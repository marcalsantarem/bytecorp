import { describe, expect, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import { ACHIEVEMENTS, type AchievementDef } from '../src/core/catalog/achievements'
import { D } from '../src/core/decimal'
import { GameEngine } from '../src/core/engine'
import { decodeSave, encodeSave } from '../src/core/save/codec'
import { createInitialState, type GameState } from '../src/core/state'

// QA do M5 (T-090, BRF-094): conquistas alcançáveis no conteúdo atual, recompensa entregue uma
// única vez (Reboot, reinício da árvore, ida e volta do save) e save v2 do M4 carregado no motor.

const HOUR = 3_600_000
const byId = (id: string): AchievementDef => {
  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) throw new Error(id)
  return def
}

// Engine com o estado num estágio, Bytes de sobra e o estágio sincronizado.
function richEngine(stage: GameState['run']['stage'] = 'mega_corporation'): GameEngine {
  const state = createInitialState(0)
  state.run.stage = stage
  state.run.bytes = D('1e40')
  const engine = new GameEngine(CATALOG, state, { ...new GameEngine(CATALOG).config, random: () => 0.99 })
  engine.replaceState(state)
  return engine
}

describe('nenhuma conquista impossível no conteúdo atual', () => {
  const cappedLevels = CATALOG.quantumNodes.reduce((s, n) => s + (n.maxLevel ?? Infinity), 0)

  it.each(ACHIEVEMENTS.map((a) => [a.id, a] as const))('%s tem alvo dentro do que o catálogo permite', (_id, a) => {
    const r = a.requirement
    switch (r.kind) {
      case 'agentsDistinct':
        expect(r.amount).toBeLessThanOrEqual(CATALOG.agents.length)
        break
      case 'agentsTotal':
      case 'agentLevel':
        if ('agent' in r && r.agent) expect(CATALOG.agents.some((x) => x.id === r.agent)).toBe(true)
        break
      case 'equipmentOwned':
        expect(CATALOG.equipment.some((e) => e.id === r.equipment)).toBe(true)
        break
      case 'quantumNode': {
        const node = CATALOG.quantumNodes.find((n) => n.id === r.node)
        expect(node).toBeDefined()
        expect(r.amount).toBeLessThanOrEqual(node!.maxLevel ?? Infinity)
        break
      }
      case 'quantumNodeLevels':
        expect(r.amount).toBeLessThanOrEqual(cappedLevels)
        break
      case 'stageReached':
        expect(CATALOG.stages.some((s) => s.id === r.stage)).toBe(true)
        break
      default:
        expect('amount' in r ? r.amount : 1).toBeGreaterThan(0)
    }
  })

  // As quatro que a simulação gulosa não alcança (docs/AG07/conquistas-m5.md): alcançáveis no motor.
  it('clicks_15000: 15 mil cliques desbloqueiam', () => {
    const e = richEngine('solo_hacker')
    for (let i = 0; i < 15_000; i++) e.click()
    expect(e.state.meta.achievements).toContain('clicks_15000')
  })

  it('spectre_10: contratar SPECTRE_X e evoluir ao nível 10 desbloqueia', () => {
    const e = richEngine()
    expect(e.hireAgent('spectre_x')).toBe(true)
    for (let i = 1; i < 10; i++) expect(e.levelUpAgent('spectre_x')).toBe(true)
    expect(e.state.meta.achievements).toContain('spectre_10')
  })

  it('q_reset: comprar um nó e reiniciar a árvore desbloqueia', () => {
    const e = richEngine()
    e.state.meta.quantumCores = D(1000)
    expect(e.buyQuantumNode('alpha_core').ok).toBe(true)
    expect(e.resetQuantumTree().ok).toBe(true)
    expect(e.state.meta.achievements).toContain('q_reset')
  })

  it('play_24h: 24 h de jogo aberto desbloqueiam (e play_1h antes)', () => {
    const e = richEngine('solo_hacker')
    e.advance(HOUR)
    expect(e.state.meta.achievements).toContain('play_1h')
    expect(e.state.meta.achievements).not.toContain('play_24h')
    e.advance(23 * HOUR)
    expect(e.state.meta.achievements).toContain('play_24h')
  })
})

describe('recompensa entregue uma única vez', () => {
  it('Reboot e nova travessia do requisito não pagam de novo (Bytes, bônus e Cores)', () => {
    const e = richEngine('solo_hacker')
    e.state.run.bytes = D(0)
    e.state.meta.quantumCores = D(0)
    for (let i = 0; i < 100; i++) e.click()
    expect(e.state.meta.achievements).toContain('clicks_100')
    const delivered = [...(e.state.meta.achievementRewardsDelivered ?? [])]
    // Repõe o estado de execução e refaz o requisito de estágio (Bytes) e de agentes.
    e.state.run.stage = 'mega_corporation'
    e.replaceState(e.state)
    e.state.run.bytes = D('1e40')
    e.hireAgent('spectre_x')
    e.advance(1000)
    const coresAfterFirst = e.state.meta.quantumCores
    const count = e.state.meta.achievements.length
    expect(e.state.meta.achievements).toContain('stage_mega')
    expect(e.state.meta.achievements).toContain('agent_first')
    expect(delivered.length).toBeLessThan(e.state.meta.achievementRewardsDelivered!.length)

    e.reboot()
    const coresAfterReboot = e.state.meta.quantumCores
    e.state.run.stage = 'mega_corporation'
    e.replaceState(e.state)
    e.state.run.bytes = D('1e40')
    const bytesBefore = e.state.run.bytes
    e.hireAgent('spectre_x')
    e.advance(1000)
    const ids = e.state.meta.achievements
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(e.state.meta.achievementRewardsDelivered).size).toBe(e.state.meta.achievementRewardsDelivered!.length)
    // Nenhuma recompensa repetida: os Cores só mudam pelo Reboot (e por conquistas novas, de Reboot).
    const newOnes = ids.slice(count)
    const coresFromNew = newOnes.map(byId).reduce((s, a) => s + (a.reward.kind === 'quantumCores' ? a.reward.amount : 0), 0)
    expect(e.state.meta.quantumCores.toNumber()).toBe(coresAfterReboot.toNumber() + coresFromNew)
    expect(coresAfterFirst.toNumber()).toBeGreaterThan(0)
    // Bytes: nenhuma recompensa de Bytes nova entre as repetidas (stage_mega, agent_first).
    const bytesFromNew = newOnes.map(byId).reduce((s, a) => s + (a.reward.kind === 'bytes' ? a.reward.amount : 0), 0)
    expect(bytesFromNew).toBe(0)
    expect(e.state.run.bytes.lte(bytesBefore)).toBe(true)
  })

  it('ida e volta do save mantém desbloqueios e não repaga', () => {
    const e = richEngine()
    e.advance(1000)
    const before = { ach: [...e.state.meta.achievements], cores: e.state.meta.quantumCores.toString() }
    const decoded = decodeSave(encodeSave(e.state, 0))
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    const e2 = new GameEngine(CATALOG, decoded.state)
    e2.advance(1000)
    expect(e2.state.meta.achievements.slice(0, before.ach.length)).toEqual(before.ach)
    expect(e2.state.meta.quantumCores.toString()).toBe(before.cores)
  })
})

describe('save v2 do M4 no motor', () => {
  // Save v2 como o M4 gravava: sem campos de conquistas detalhadas nem tutorial.
  function v2Save(achievements: string[]): string {
    const state = createInitialState(0)
    state.run.stage = 'startup_lab'
    state.run.bytes = D(5e5)
    state.run.bytesEarned = D(2e6)
    state.stats.bytesEarnedAllTime = D(2e6)
    state.stats.clicks = 150
    state.run.equipment = { home_router: 12 }
    state.meta.achievements = achievements
    const envelope = JSON.parse(encodeSave(state, 0)) as { version: number; state: { meta: Record<string, unknown> } }
    envelope.version = 2
    for (const k of ['achievementUnlocks', 'achievementRewardsDelivered', 'achievementQueue', 'tutorial']) delete envelope.state.meta[k]
    return JSON.stringify(envelope)
  }

  it('progresso do M4 desbloqueia as conquistas já atingidas na primeira atualização, pagando uma vez', () => {
    const decoded = decodeSave(v2Save([]))
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    const e = new GameEngine(CATALOG, decoded.state)
    expect(e.state.meta.achievements).toEqual([])
    const bytes0 = e.state.run.bytes
    e.advance(1000)
    for (const id of ['prod_bytes_1k', 'prod_bytes_1m', 'clicks_100', 'eq_10', 'stage_garage', 'stage_startup']) expect(e.state.meta.achievements, id).toContain(id)
    const paid = e.state.meta.achievements.map(byId).reduce((s, a) => s + (a.reward.kind === 'bytes' ? a.reward.amount : 0), 0)
    const produced = e.state.run.bytes.sub(bytes0).sub(paid)
    expect(produced.gte(0)).toBe(true)
    const n = e.state.meta.achievements.length
    e.advance(1000)
    expect(e.state.meta.achievements.length).toBe(n)
    expect(e.state.meta.tutorial).toBeDefined()
  })

  it('conquistas já listadas no v2 não pagam de novo', () => {
    const decoded = decodeSave(v2Save(['clicks_100', 'stage_startup']))
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.state.meta.achievementRewardsDelivered).toEqual(['clicks_100', 'stage_startup'])
    const e = new GameEngine(CATALOG, decoded.state)
    const bytes0 = e.state.run.bytes
    e.advance(1000)
    const fresh = e.state.meta.achievements.filter((id) => id !== 'clicks_100' && id !== 'stage_startup')
    const paid = fresh.map(byId).reduce((s, a) => s + (a.reward.kind === 'bytes' ? a.reward.amount : 0), 0)
    // Saldo = antes + produção de 1 s + só as recompensas novas (nada de 50 B ou 50 kB repetidos).
    const gained = e.state.run.bytes.sub(bytes0).toNumber()
    expect(gained).toBeGreaterThanOrEqual(paid)
    expect(gained - paid).toBeLessThan(5e4)
  })
})
