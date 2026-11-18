import { describe, expect, it } from 'vitest'
import { BASE_CATALOG, CATALOG, validateCatalog } from '../src/core/catalog'
import { ACHIEVEMENTS, type AchievementDef } from '../src/core/catalog/achievements'
import type { Catalog } from '../src/core/catalog/types'
import type { GameEngine } from '../src/core/engine'
import { nodeLevelCost, nodeStatus } from '../src/core/progression/quantum'
import { createInitialState, type GameState } from '../src/core/state'
import { achievementsEn } from '../src/i18n/achievements/en'
import { achievementsPtBR } from '../src/i18n/achievements/pt-BR'
import { fmtTime, simulateCurve } from './helpers/curva'

// Catálogo de conquistas do M5 (T-078, BRF-083): estrutura e impacto na curva, contra o motor real.
// Relatório completo (inclui a árvore inteira, com e sem conquistas, vários minutos):
//   CONQUISTAS_REPORT=1 npx vitest run tests/conquistas-m5.test.ts
// Política: a mesma do curva-m2 e do prestigio-m3 (1 clique/s, comprador guloso, Reboot ao abrir
// Mega, cores no nó disponível mais barato). Sem aceleradores (medidos à parte no tempo-m4).

const report = !!process.env.CONQUISTAS_REPORT
const out = (text: string) => console.log(text)

describe('catálogo de conquistas (estrutura)', () => {
  it('é válido no validateCatalog', () => {
    expect(validateCatalog(CATALOG)).toEqual([])
    expect(CATALOG.achievements).toBe(ACHIEVEMENTS)
  })

  it('tem cerca de 40, as 7 categorias, as 4 raridades e 6 a 8 secretas com pista (D-20)', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(36)
    expect(ACHIEVEMENTS.length).toBeLessThanOrEqual(44)
    expect(new Set(ACHIEVEMENTS.map((a) => a.category))).toEqual(new Set(['production', 'clicks', 'equipment', 'agents', 'reboots', 'quantum', 'milestones']))
    expect(new Set(ACHIEVEMENTS.map((a) => a.rarity))).toEqual(new Set(['bronze', 'silver', 'gold', 'diamond']))
    const secret = ACHIEVEMENTS.filter((a) => a.secret)
    expect(secret.length).toBeGreaterThanOrEqual(6)
    expect(secret.length).toBeLessThanOrEqual(8)
    for (const a of secret) expect(a.hintKey, a.id).toBeDefined()
  })

  it('cada estágio a partir do segundo tem a sua conquista', () => {
    const stages = ACHIEVEMENTS.flatMap((a) => (a.requirement.kind === 'stageReached' ? [a.requirement.stage] : []))
    expect(new Set(stages)).toEqual(new Set(CATALOG.stages.slice(1).map((s) => s.id)))
  })

  it('textos: as chaves do catálogo são exatamente as dos dicionários, em pt-BR e en, sem texto vazio', () => {
    const used = ACHIEVEMENTS.flatMap((a) => [a.nameKey, a.descriptionKey, ...(a.hintKey ? [a.hintKey] : [])]).sort()
    expect(Object.keys(achievementsPtBR).sort()).toEqual(used)
    expect(Object.keys(achievementsEn).sort()).toEqual(used)
    for (const k of used) {
      expect(achievementsPtBR[k as keyof typeof achievementsPtBR].trim(), k).not.toBe('')
      expect(achievementsEn[k as keyof typeof achievementsEn].trim(), k).not.toBe('')
    }
  })

  it('recompensas dentro dos limites: Quantum e Diamond dão Cores, bônus até 1,25x, Cores até 25', () => {
    for (const a of ACHIEVEMENTS) {
      const r = a.reward
      if (a.category === 'quantum' || a.rarity === 'diamond') expect(r.kind, a.id).toBe('quantumCores')
      if (r.kind === 'temporaryBonus') expect(r.multiplier, a.id).toBeLessThanOrEqual(1.25)
      if (r.kind === 'quantumCores') expect(r.amount, a.id).toBeLessThanOrEqual(25)
    }
  })
})

// ---------------------------------------------------------------------------------------------
// Curva

interface Unlock {
  id: string
  min: number
}

function unlocksOf(e: GameEngine): Unlock[] {
  const u = e.state.meta.achievementUnlocks ?? {}
  return Object.entries(u)
    .map(([id, v]) => ({ id, min: v.playTimeMs / 60000 }))
    .sort((a, b) => a.min - b.min)
}

function run1(catalog: Catalog) {
  const r = simulateCurve(catalog)
  return { seconds: r.seconds, stageAt: r.stageAt, engine: r.engine }
}

function spendCores(engine: GameEngine): void {
  for (;;) {
    let best: { id: string; cost: number } | undefined
    for (const def of engine.catalog.quantumNodes) {
      if (nodeStatus(def, engine.state) !== 'available') continue
      const cost = nodeLevelCost(def, engine.state.meta.quantumNodes[def.id] ?? 0)
      if (!best || cost < best.cost) best = { id: def.id, cost }
    }
    if (!best || engine.state.meta.quantumCores.lt(best.cost)) return
    if (!engine.buyQuantumNode(best.id).ok) return
  }
}
function treeComplete(state: GameState, catalog: Catalog): boolean {
  return (
    catalog.quantumNodes.filter((n) => n.maxLevel !== null).every((n) => (state.meta.quantumNodes[n.id] ?? 0) >= (n.maxLevel ?? 0)) &&
    (state.meta.quantumNodes.alpha_core ?? 0) >= 5
  )
}

function playTree(catalog: Catalog) {
  const state = createInitialState(0)
  const runs: number[] = []
  let total = 0
  let engine: GameEngine | undefined
  for (let n = 1; n <= 20; n++) {
    const r = simulateCurve(catalog, { state, seed: n, maxSeconds: 3 * 3600 })
    engine = r.engine
    runs.push(r.seconds)
    total += r.seconds
    if (!r.reachedMega || engine.rebootRewardNow < 1) break
    engine.reboot()
    spendCores(engine)
    if (treeComplete(state, catalog)) break
  }
  return { runs, total, complete: treeComplete(state, catalog), engine: engine! }
}

const rarityOf = new Map(ACHIEVEMENTS.map((a) => [a.id, a.rarity]))
const fmtUnlocks = (list: Unlock[]) => list.map((u) => `${u.id}(${rarityOf.get(u.id)?.[0]}) ${u.min.toFixed(1)}m`).join(', ')

describe('impacto na run 1 contra o motor real', () => {
  const base = run1(BASE_CATALOG)
  const withAch = run1(CATALOG)
  const unlocks = unlocksOf(withAch.engine)

  it('o catálogo adianta Mega da run 1 em no máximo 10%', () => {
    const gain = 1 - withAch.seconds / base.seconds
    if (report) {
      out(`\nRun 1: sem conquistas ${fmtTime(base.seconds)}; com ${fmtTime(withAch.seconds)} (-${(100 * gain).toFixed(1)}%)`)
      for (const [name, r] of [['sem', base], ['com', withAch]] as const)
        out(`  ${name} ${Object.entries(r.stageAt).map(([s, t]) => `${s}:${fmtTime(t)}`).join('  ')}`)
      out(`  ${unlocks.length} desbloqueadas na run 1: ${fmtUnlocks(unlocks)}`)
    }
    expect(withAch.seconds).toBeLessThanOrEqual(base.seconds)
    expect(gain).toBeLessThanOrEqual(0.1)
  }, 300_000)

  // Conquistas de clique dão bônus temporário (proporcional) e não Bytes fixos: com Bytes fixos
  // medidos a 1 clique/s, quem clica 10/s recebia a recompensa cedo demais (Mega em 36,7 min).
  // O piso de 50 min da D-14 (A-09) vale para a curva sem conquistas (curva-m2); com elas, o
  // adiantamento a 10 cliques/s fica no mesmo teto de 10% (medido: 51,5 para 46,9 min).
  it('10 cliques/s: o catálogo adianta Mega em no máximo 10% e não cai abaixo de 45 min', () => {
    const fastBase = simulateCurve(BASE_CATALOG, { clicksPerSecond: 10 })
    const fast = simulateCurve(CATALOG, { clicksPerSecond: 10 })
    if (report) out(`\n10 cliques/s: sem conquistas ${fmtTime(fastBase.seconds)}; com ${fmtTime(fast.seconds)} (-${(100 * (1 - fast.seconds / fastBase.seconds)).toFixed(1)}%)`)
    expect(fast.reachedMega).toBe(true)
    expect(1 - fast.seconds / fastBase.seconds).toBeLessThanOrEqual(0.1)
    expect(fast.seconds / 60).toBeGreaterThanOrEqual(45)
  }, 180_000)

  it('toda bronze não secreta de execução sai na run 1; nenhuma diamond sai na run 1', () => {
    const got = new Set(unlocks.map((u) => u.id))
    const runOnly = (a: AchievementDef) => !['reboots', 'treeResets', 'quantumNodeLevels', 'quantumNode', 'quantumCoresTotal'].includes(a.requirement.kind)
    for (const a of ACHIEVEMENTS.filter((x) => x.rarity === 'bronze' && !x.secret && runOnly(x))) expect(got.has(a.id), a.id).toBe(true)
    for (const a of ACHIEVEMENTS.filter((x) => x.rarity === 'diamond')) expect(got.has(a.id), a.id).toBe(false)
  })
})

describe('árvore completa com e sem conquistas (relatório)', () => {
  it.skipIf(!report)('Reboots, horas e quando cada conquista sai', () => {
    const none = playTree(BASE_CATALOG)
    const ach = playTree(CATALOG)
    const unlocks = unlocksOf(ach.engine)
    const missing = ACHIEVEMENTS.filter((a) => !unlocks.some((u) => u.id === a.id)).map((a) => a.id)
    out(
      [
        '\n== Árvore completa (Reboot ao abrir Mega) ==',
        `sem conquistas: ${none.runs.length} runs, ${none.complete ? 'completa' : 'INCOMPLETA'}, total ${fmtTime(none.total)}; runs ${none.runs.map(fmtTime).join(', ')}`,
        `com conquistas: ${ach.runs.length} runs, ${ach.complete ? 'completa' : 'INCOMPLETA'}, total ${fmtTime(ach.total)} (-${(100 * (1 - ach.total / none.total)).toFixed(1)}%); runs ${ach.runs.map(fmtTime).join(', ')}`,
        `cores ganhos por conquistas: ${ACHIEVEMENTS.filter((a) => a.reward.kind === 'quantumCores' && unlocks.some((u) => u.id === a.id)).reduce((s, a) => s + (a.reward.kind === 'quantumCores' ? a.reward.amount : 0), 0)}`,
        `${unlocks.length} desbloqueadas: ${fmtUnlocks(unlocks)}`,
        `não desbloqueadas: ${missing.join(', ')}`,
      ].join('\n'),
    )
    expect(ach.complete).toBe(true)
    expect(1 - ach.total / none.total).toBeLessThanOrEqual(0.1)
  }, 3_600_000)
})
