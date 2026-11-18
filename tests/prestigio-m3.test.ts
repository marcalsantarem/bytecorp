import { describe, expect, it } from 'vitest'
import { BASE_CATALOG as CATALOG } from '../src/core/catalog'
import type { Catalog, QuantumNodeDef } from '../src/core/catalog/types'
import { D } from '../src/core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../src/core/engine'
import { quantumCoresReward } from '../src/core/progression/coresReward'
import { nodeLevelCost, nodeStatus } from '../src/core/progression/quantum'
import { createInitialState, type GameState } from '../src/core/state'
import { fmtTime, simulateCurve, type CurveResult } from './helpers/curva'

// QA do M3 (T-044, BRF-059): ciclos de prestígio contra o motor real, com o comprador guloso de
// tests/helpers/curva.ts (1 clique/s) e a árvore Quantum comprada entre as runs.
// Relatório: PRESTIGIO_REPORT=1 npx vitest run tests/prestigio-m3.test.ts --reporter=verbose
//
// Política da árvore (documentada): antes de cada run, comprar sempre o nó disponível mais barato
// (desempate pela ordem do catálogo) até o saldo não cobrir o mais barato. "Completa" = todos os
// nós finitos no máximo e alpha_core com 5 níveis (os 495 cores do doc arvore-quantum.md).
//
// Políticas de Reboot comparadas:
//   first    : assim que a recompensa chega a 1 core
//   afford   : assim que saldo + recompensa pagam o nó mais barato disponível
//   stage:X  : ao abrir o estágio X
//   mega     : ao abrir Mega Corporation (a run de referência do M2)

const report = !!process.env.PRESTIGIO_REPORT
const out = (text: string) => console.log(text)

const RUN_CAP_SECONDS = 3 * 3600
const TREE_CAP_SECONDS = 60 * 3600
const MAX_RUNS = 60

type PolicyName = 'first' | 'afford' | 'stage:startup_lab' | 'stage:data_center' | 'stage:corporate_network' | 'mega'

const nodes = CATALOG.quantumNodes

function cheapestAvailable(state: GameState, catalog: Catalog): { def: QuantumNodeDef; cost: number } | undefined {
  let best: { def: QuantumNodeDef; cost: number } | undefined
  for (const def of catalog.quantumNodes) {
    if (nodeStatus(def, state) !== 'available') continue
    const cost = nodeLevelCost(def, state.meta.quantumNodes[def.id] ?? 0)
    if (!best || cost < best.cost) best = { def, cost }
  }
  return best
}

function spendCores(engine: GameEngine): number {
  let bought = 0
  for (;;) {
    const next = cheapestAvailable(engine.state, engine.catalog)
    if (!next || engine.state.meta.quantumCores.lt(next.cost)) return bought
    if (!engine.buyQuantumNode(next.def.id).ok) return bought
    bought++
  }
}

function treeComplete(state: GameState, catalog: Catalog): boolean {
  return (
    catalog.quantumNodes.filter((n) => n.maxLevel !== null).every((n) => (state.meta.quantumNodes[n.id] ?? 0) >= (n.maxLevel ?? 0)) &&
    (state.meta.quantumNodes.alpha_core ?? 0) >= 5
  )
}

function stopFor(policy: PolicyName): (e: GameEngine) => boolean {
  switch (policy) {
    case 'first':
      return (e) => e.rebootRewardNow >= 1
    case 'afford':
      return (e) => {
        const next = cheapestAvailable(e.state, e.catalog)
        return e.rebootRewardNow >= 1 && (!next || e.state.meta.quantumCores.toNumber() + e.rebootRewardNow >= next.cost)
      }
    case 'mega':
      return (e) => e.state.run.stage === 'mega_corporation'
    default: {
      const stage = policy.slice('stage:'.length)
      return (e) => e.state.run.stage === stage
    }
  }
}

interface RunRow {
  n: number
  seconds: number
  reward: number
  coresBefore: number
  bought: number
  reachedStop: boolean
  megaAt: number | undefined
  stage: string
  mult: number
}

interface CycleResult {
  rows: RunRow[]
  complete: boolean
  totalSeconds: number
  stuck: boolean
  state: GameState
}

// Joga ciclos de run + Reboot + compras até a árvore completar (ou um teto de runs/tempo).
function playCycles(policy: PolicyName, opts: { maxRuns?: number; stopWhenComplete?: boolean; catalog?: Catalog } = {}): CycleResult {
  const { maxRuns = MAX_RUNS, stopWhenComplete = true, catalog = CATALOG } = opts
  const state = createInitialState(0)
  const rows: RunRow[] = []
  let total = 0
  let stuck = false
  // Saldo e compras feitas logo depois do Reboot anterior (a run 1 começa sem cores).
  let pending = { balance: 0, bought: 0 }
  const stop = stopFor(policy)
  for (let n = 1; n <= maxRuns && total < TREE_CAP_SECONDS; n++) {
    const { balance: coresBefore, bought } = pending
    const r = simulateCurve(catalog, { state, seed: n, maxSeconds: RUN_CAP_SECONDS, stopWhen: (e) => stop(e) })
    const e = r.engine
    const reached = stop(e)
    const reward = e.rebootRewardNow
    rows.push({
      n,
      seconds: r.seconds,
      reward,
      coresBefore,
      bought,
      reachedStop: reached,
      megaAt: r.stageAt.mega_corporation,
      stage: e.state.run.stage,
      mult: e.production.multiplier.toNumber(),
    })
    total += r.seconds
    if (!reached || reward < 1) {
      stuck = true
      break
    }
    e.reboot()
    const balance = state.meta.quantumCores.toNumber()
    pending = { balance, bought: spendCores(e) }
    if (stopWhenComplete && treeComplete(state, catalog)) break
  }
  return { rows, complete: treeComplete(state, catalog), totalSeconds: total, stuck, state }
}

function printCycles(name: string, c: CycleResult) {
  const lines = [`\n== ${name}: ${c.rows.length} runs, árvore ${c.complete ? 'completa' : 'incompleta'}, total ${fmtTime(c.totalSeconds)}${c.stuck ? ' (PAROU: run sem Reboot)' : ''} ==`]
  for (const r of c.rows)
    lines.push(
      `run ${String(r.n).padStart(2)}  duração ${fmtTime(r.seconds).padStart(9)}  estágio ${r.stage.padEnd(18)} recompensa ${String(r.reward).padStart(3)}  saldo após Reboot ${String(r.coresBefore).padStart(3)}  nós comprados ${String(r.bought).padStart(2)}  Mega ${fmtTime(r.megaAt).padStart(9)}  mult ${r.mult.toFixed(1)}`,
    )
  out(lines.join('\n'))
}

describe('prestígio do M3 contra o motor real', () => {
  const baseRun = (() => {
    const stages: Record<string, { t: number; reward: number }> = {}
    let firstCore: number | undefined
    const r: CurveResult = simulateCurve(CATALOG, {
      stopWhen: (e, t) => {
        if (firstCore === undefined && e.rebootRewardNow >= 1) firstCore = t
        stages[e.state.run.stage] ??= { t, reward: e.rebootRewardNow }
        return e.state.run.stage === 'mega_corporation'
      },
    })
    // Recompensa ao abrir cada estágio e ao fim da run.
    return { r, stages, firstCore, rewardAtMega: r.engine.rebootRewardNow }
  })()

  it('primeira run: o Reboot habilita entre 5 e 9 min (Startup Lab, D-15) e a recompensa cresce a cada estágio', () => {
    if (report) {
      const lines = ['\n== Run 1 (sem árvore) ==', `primeiro core em ${fmtTime(baseRun.firstCore)}`]
      for (const [id, s] of Object.entries(baseRun.stages)) lines.push(`${id.padEnd(18)} ${fmtTime(s.t).padStart(9)}  recompensa ${s.reward}`)
      lines.push(`Mega em ${fmtTime(baseRun.r.seconds)}  recompensa ${baseRun.rewardAtMega}  melhorias ${baseRun.r.engine.state.run.upgrades.length}`)
      out(lines.join('\n'))
    }
    expect(baseRun.firstCore).toBeDefined()
    expect(baseRun.firstCore! / 60).toBeGreaterThanOrEqual(5)
    expect(baseRun.firstCore! / 60).toBeLessThanOrEqual(9)
    const rewards = Object.values(baseRun.stages).map((s) => s.reward)
    for (let i = 1; i < rewards.length; i++) expect(rewards[i]!).toBeGreaterThanOrEqual(rewards[i - 1]!)
    // Mega Corporation rende dezenas de cores (D-15 estimava 59 com peso 1; com peso 0,5 são 56).
    expect(baseRun.rewardAtMega).toBeGreaterThanOrEqual(45)
    expect(baseRun.rewardAtMega).toBeLessThanOrEqual(70)
  })

  // Uma só simulação de 10 runs serve aos dois testes abaixo (cerca de 2 min).
  let megaCycles: CycleResult | undefined
  const mega = () => (megaCycles ??= playCycles('mega'))

  it('a árvore completa em até 16 Reboots jogando cada run até Mega Corporation, sem run parada', () => {
    const c = mega()
    if (report) printCycles('política mega', c)
    expect(c.stuck).toBe(false)
    expect(c.complete).toBe(true)
    expect(c.rows.length).toBeLessThanOrEqual(16)
    // Cada run termina em Mega Corporation e dá mais de 1 core: sem run infinita de ganho nem estagnada.
    for (const r of c.rows) {
      expect(r.reachedStop).toBe(true)
      expect(r.seconds).toBeLessThanOrEqual(RUN_CAP_SECONDS)
    }
  }, 600_000)

  it('o prestígio acelera a run: Mega Corporation na run 3 e na 5 é mais rápida que na 1', () => {
    const t = mega().rows.slice(0, 5).map((r) => r.megaAt!)
    expect(t.length).toBe(5)
    if (report) out(`
Mega por run (política mega): ${t.map((x) => fmtTime(x)).join(', ')}`)
    expect(t[2]!).toBeLessThan(t[0]!)
    expect(t[4]!).toBeLessThan(t[2]!)
    // Aceleração com sentido: a run 5 leva de 15% a 60% da primeira.
    expect(t[4]! / t[0]!).toBeGreaterThanOrEqual(0.15)
    expect(t[4]! / t[0]!).toBeLessThanOrEqual(0.6)
  }, 600_000)

  it.skipIf(!report)('comparação de políticas de Reboot (relatório)', () => {
    for (const p of ['first', 'afford', 'stage:startup_lab', 'stage:data_center', 'stage:corporate_network', 'mega'] as PolicyName[]) {
      printCycles(`política ${p}`, playCycles(p))
    }
  }, 3_600_000)

  it.skipIf(!report)('sensibilidade do custo da árvore (relatório)', () => {
    for (const k of [1.5, 2]) {
      const cat = structuredClone(CATALOG)
      for (const n of cat.quantumNodes) n.baseCost = Math.round(n.baseCost * k)
      for (const p of ['mega', 'stage:corporate_network'] as PolicyName[]) {
        const c = playCycles(p, { catalog: cat })
        out(`
custo da árvore x${k}, política ${p}: ${c.rows.length} runs, ${c.complete ? 'completa' : 'incompleta'}, total ${fmtTime(c.totalSeconds)}, Mega por run: ${c.rows.slice(0, 6).map((r) => fmtTime(r.megaAt)).join(', ')}, última run ${fmtTime(c.rows.at(-1)?.seconds)}`)
      }
    }
  }, 3_600_000)

  it.skipIf(!report)('desconto: efeito efetivo da árvore ao longo da run 1 (relatório)', () => {
    // Compara o desconto efetivo por estágio com e sem os 10 pp da árvore gama.
    const plain = baseRun.r
    const state = createInitialState(0)
    state.meta.quantumCores = D(1000)
    new GameEngine(CATALOG, state, DEFAULT_CONFIG)
    const withTree = simulateCurve(CATALOG, {
      state: (() => {
        const s = createInitialState(0)
        s.meta.quantumNodes = { gamma_supply: 5, gamma_contracts: 5 }
        return s
      })(),
    })
    const lines = ['\n== Desconto efetivo por estágio: sem árvore vs gama completa (+10 pp) ==']
    for (const id of Object.keys(plain.stageAt))
      lines.push(`${id.padEnd(18)} sem ${(plain.discountAtStage[id] ?? 0).toFixed(1).padStart(5)}%  com ${(withTree.discountAtStage[id] ?? 0).toFixed(1).padStart(5)}%  tempo ${fmtTime(plain.stageAt[id]).padStart(9)} vs ${fmtTime(withTree.stageAt[id]).padStart(9)}`)
    lines.push(`fim: bruto sem ${plain.finalRawDiscount.toFixed(1)}%, bruto com ${withTree.finalRawDiscount.toFixed(1)}%; Mega ${fmtTime(plain.seconds)} vs ${fmtTime(withTree.seconds)}`)
    out(lines.join('\n'))
  }, 600_000)
})

describe('efeitos da árvore Quantum no catálogo real', () => {
  const engineWith = (levels: Record<string, number>) => {
    const s = createInitialState(0)
    s.meta.quantumNodes = levels
    return new GameEngine(CATALOG, s, { ...DEFAULT_CONFIG, random: () => 0 })
  }
  const prepared = (levels: Record<string, number>) => {
    const e = engineWith(levels)
    e.state.run.equipment[CATALOG.equipment[0]!.id] = 10
    e.invalidate()
    return e
  }

  it('cada nó do catálogo muda o resultado que promete', () => {
    const base = prepared({})
    const baseProd = base.production.total.toNumber()
    const baseClick = base.clickValue.toNumber()
    const baseOffline = base.offlineCapMs
    for (const def of nodes) {
      // Nível 1 do nó com os pré-requisitos (cada um em 1 nível).
      const levels: Record<string, number> = { [def.id]: 1 }
      for (const p of def.prerequisites) levels[p] = 1
      const e = prepared(levels)
      switch (def.effectPerLevel.kind) {
        case 'globalProductionPercent':
          expect(e.production.total.toNumber(), def.id).toBeGreaterThan(baseProd)
          break
        case 'clickPercent':
          expect(e.clickValue.toNumber(), def.id).toBeGreaterThan(baseClick)
          break
        case 'criticalChancePercent':
          expect(e.criticalChanceInfo.effective, def.id).toBeGreaterThan(base.criticalChanceInfo.effective)
          break
        case 'criticalMultiplier': {
          // random() = 0 força o crítico: o multiplicador maior rende mais por clique.
          const crit = engineWith(levels)
          const plain = engineWith({})
          expect(crit.click().toNumber(), def.id).toBeGreaterThan(plain.click().toNumber())
          break
        }
        case 'costDiscountPercent':
          expect(e.costDiscount.raw.toNumber(), def.id).toBeGreaterThan(base.costDiscount.raw.toNumber())
          expect(e.costDiscount.effective.toNumber(), def.id).toBeGreaterThan(0)
          break
        case 'offlineCapHours':
          expect(e.offlineCapMs, def.id).toBeGreaterThan(baseOffline)
          break
        default:
          throw new Error(`tipo de efeito sem verificação: ${def.effectPerLevel.kind}`)
      }
    }
  })

  it('sem pré-requisito o nó recusa a compra e não gasta cores', () => {
    const e = engineWith({})
    e.state.meta.quantumCores = D(1000)
    const r = e.buyQuantumNode('alpha_overclock')
    expect(r).toEqual({ ok: false, reason: 'locked' })
    expect(e.state.meta.quantumCores.toNumber()).toBe(1000)
  })

  it('o desconto do caminho gama (+10 pp) vale no começo da run e some no teto de 50 pp no fim', () => {
    // Início: sem melhorias, +10 pp valem 10 pp efetivos.
    const early = engineWith({ gamma_supply: 5, gamma_contracts: 5 })
    expect(early.costDiscount.effective.toNumber()).toBe(10)
    // Fim da run 1: o bruto já passa do teto sozinho (curva-m2: desconto final 30 a 50 pp efetivos).
    const r = simulateCurve(CATALOG)
    expect(r.finalRawDiscount).toBeGreaterThan(0)
    // Margem: quanto falta para o teto antes da árvore. Se for menor que 10 pp, parte da árvore é perdida.
    const headroom = Math.max(0, 50 - r.finalRawDiscount)
    if (report) out(`\nDesconto bruto no fim da run 1: ${r.finalRawDiscount.toFixed(1)} pp; folga até o teto: ${headroom.toFixed(1)} pp; árvore gama: 10 pp`)
    expect(headroom).toBeGreaterThanOrEqual(0)
  }, 120_000)

  it('nós desconhecidos no save são ignorados nos cálculos e preservados', () => {
    const clean = prepared({ alpha_core: 2 })
    const dirty = prepared({ alpha_core: 2, no_exist: 9, outro: 3 })
    expect(dirty.production.total.toNumber()).toBe(clean.production.total.toNumber())
    expect(dirty.clickValue.toNumber()).toBe(clean.clickValue.toNumber())
    expect(dirty.costDiscount.raw.toNumber()).toBe(clean.costDiscount.raw.toNumber())
    expect(dirty.offlineCapMs).toBe(clean.offlineCapMs)
    expect(dirty.quantumCoresSpent).toBe(clean.quantumCoresSpent)
    expect(dirty.buyQuantumNode('no_exist')).toEqual({ ok: false, reason: 'unknown' })
    // O reset devolve só o que o catálogo conhece e zera o mapa.
    dirty.state.meta.quantumCores = D(10)
    expect(dirty.resetQuantumTree().ok).toBe(true)
    expect(dirty.state.meta.quantumNodes).toEqual({})
  })

  it('a fórmula da D-15 dá 1 core com 1e6 Bytes no Solo Hacker e é monótona em Bytes', () => {
    const s = createInitialState(0)
    s.run.bytesEarned = D(1e6)
    expect(quantumCoresReward(s, CATALOG)).toBe(1)
    s.run.bytesEarned = D(1e5)
    expect(quantumCoresReward(s, CATALOG)).toBe(0)
    let prev = 0
    for (let l = 0; l <= 24; l++) {
      s.run.bytesEarned = D(10).pow(l)
      const v = quantumCoresReward(s, CATALOG)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})
