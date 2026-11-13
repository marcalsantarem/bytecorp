import type { Catalog } from '../../src/core/catalog/types'
import { DEFAULT_CONFIG, GameEngine } from '../../src/core/engine'
import { createInitialState } from '../../src/core/state'

// Comprador guloso contra o motor real (T-062): 1 clique por segundo (com o crítico real e
// aleatoriedade determinística), compra o item de menor retorno (custo / ganho de renda efetiva)
// e espera juntar o saldo. Tempo virtual por advance(); termina ao alcançar Mega Corporation.

export interface CurveOptions {
  useAgents?: boolean
  useUpgrades?: boolean
  // Tempo virtual máximo, em segundos.
  maxSeconds?: number
  // Cliques por segundo (padrão 1; aceita fração e 0).
  clicksPerSecond?: number
  // Segundos iniciais com pelo menos 1 clique por segundo (sem clique não há como comprar o primeiro item).
  bootstrapSeconds?: number
}

export interface Purchase {
  t: number
  gap: number
  kind: 'eq' | 'hire' | 'level' | 'up'
  id: string
  cost: number
  payback: number
  income: number
  mult: number
}

export interface CurveResult {
  reachedMega: boolean
  seconds: number
  stageAt: Record<string, number>
  discountAtStage: Record<string, number>
  agentFirstHire: Record<string, { t: number; cost: number; payback: number; income: number; mult: number }>
  upgradeAt: Record<string, { t: number; cost: number; payback: number; income: number; mult: number }>
  levels: Record<string, number>
  purchases: Purchase[]
  finalDiscount: number
  finalRawDiscount: number
  finalCrit: number
  agentsFinal: Record<string, { count: number; level: number }>
  // Fatia da renda total gerada que veio de cliques ao abrir cada estágio (0 a 1).
  clickShareAtStage: Record<string, number>
  finalClickShare: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Candidate {
  kind: Purchase['kind']
  id: string
  cost: number
  payback: number
  score: number
  buy: () => boolean
}

export function simulateCurve(catalog: Catalog, opts: CurveOptions = {}): CurveResult {
  const { useAgents = true, useUpgrades = true, maxSeconds = 4 * 3600, clicksPerSecond = 1, bootstrapSeconds = 0 } = opts
  const engine = new GameEngine(catalog, createInitialState(0), { ...DEFAULT_CONFIG, random: mulberry32(1234) })
  const { run } = engine.state
  const share = () => {
    const tot = engine.state.stats.bytesEarnedAllTime.toNumber()
    return tot > 0 ? engine.state.stats.bytesFromClicks.toNumber() / tot : 0
  }
  const cfg = engine.config

  const result: CurveResult = {
    reachedMega: false,
    seconds: 0,
    stageAt: {},
    discountAtStage: {},
    agentFirstHire: {},
    upgradeAt: {},
    levels: {},
    purchases: [],
    finalDiscount: 0,
    finalRawDiscount: 0,
    finalCrit: 0,
    agentsFinal: {},
    clickShareAtStage: {},
    finalClickShare: 0,
  }
  let t = 0
  result.stageAt[run.stage] = 0
  engine.events.on('stageChanged', ({ to }) => {
    result.stageAt[to] = t
    result.discountAtStage[to] = engine.costDiscount.effective.toNumber()
    result.clickShareAtStage[to] = share()
  })
  result.discountAtStage[run.stage] = 0

  // Renda efetiva por segundo: produção + clique esperado (1/s), dividida por (1 - desconto).
  const income = () => {
    const crit = engine.criticalChanceInfo.effective
    const critMult = cfg.criticalMultiplier + extraCritMult()
    const click = (t < bootstrapSeconds ? Math.max(1, clicksPerSecond) : clicksPerSecond) * engine.clickValue.toNumber() * (1 + crit * (critMult - 1))
    return engine.production.total.toNumber() + click
  }
  const extraCritMult = () => {
    let s = 0
    for (const u of run.upgrades) {
      const e = catalog.upgrades.find((x) => x.id === u)?.effect
      if (e?.kind === 'criticalMultiplier') s += e.value
    }
    return s
  }
  const eff = () => {
    const d = Math.min(95, engine.costDiscount.effective.toNumber())
    return income() / Math.max(0.05, 1 - d / 100)
  }

  const pick = (): Candidate | null => {
    const base = eff()
    const inc = income()
    const out: Candidate[] = []
    const trial = (apply: () => void, undo: () => void, cost: number, c: Omit<Candidate, 'cost' | 'payback' | 'score'>) => {
      apply()
      engine.invalidate()
      const gain = eff() - base
      undo()
      engine.invalidate()
      if (gain > 0) out.push({ ...c, cost, payback: cost / gain, score: Math.max(0, cost - run.bytes.toNumber()) / Math.max(1e-9, inc) + cost / gain })
    }
    for (const e of catalog.equipment) {
      const info = engine.equipmentInfo(e.id)!
      if (info.status !== 'unlocked') continue
      trial(
        () => (run.equipment[e.id] = info.owned + 1),
        () => (run.equipment[e.id] = info.owned),
        info.nextCost.toNumber(),
        { kind: 'eq', id: e.id, buy: () => engine.buyEquipment(e.id, 'x1') > 0 },
      )
    }
    if (useAgents) {
      for (const a of catalog.agents) {
        const info = engine.agentInfo(a.id)!
        if (info.status !== 'unlocked') continue
        const prev = run.agents[a.id]
        const restore = () => {
          if (prev) run.agents[a.id] = { ...prev }
          else delete run.agents[a.id]
        }
        trial(
          () => (run.agents[a.id] = { count: info.count + 1, level: Math.max(1, info.level) }),
          restore,
          info.hireCost.toNumber(),
          { kind: 'hire', id: a.id, buy: () => engine.hireAgent(a.id) },
        )
        if (info.count > 0 && info.levelCost) {
          trial(
            () => (run.agents[a.id] = { count: info.count, level: info.level + 1 }),
            restore,
            info.levelCost.toNumber(),
            { kind: 'level', id: a.id, buy: () => engine.levelUpAgent(a.id) },
          )
        }
      }
    }
    if (useUpgrades) {
      for (const u of catalog.upgrades) {
        const info = engine.upgradeInfo(u.id)!
        if (info.status !== 'available') continue
        trial(
          () => run.upgrades.push(u.id),
          () => run.upgrades.pop(),
          info.cost,
          { kind: 'up', id: u.id, buy: () => engine.buyUpgrade(u.id) },
        )
      }
    }
    out.sort((a, b) => a.score - b.score)
    return out[0] ?? null
  }

  let target: Candidate | null = null
  let lastBuy = 0
  let clickAcc = 0
  const record = (c: Candidate) => {
    result.purchases.push({ t, gap: t - lastBuy, kind: c.kind, id: c.id, cost: c.cost, payback: c.payback, income: income(), mult: engine.production.multiplier.toNumber() })
    lastBuy = t
    if (c.kind === 'hire') result.agentFirstHire[c.id] ??= { t, cost: c.cost, payback: c.payback, income: income(), mult: engine.production.multiplier.toNumber() }
    if (c.kind === 'up') result.upgradeAt[c.id] = { t, cost: c.cost, payback: c.payback, income: income(), mult: engine.production.multiplier.toNumber() }
    if (c.kind === 'level') result.levels[c.id] = (result.levels[c.id] ?? 0) + 1
  }

  while (t < maxSeconds && result.stageAt.mega_corporation === undefined) {
    clickAcc += t < bootstrapSeconds ? Math.max(1, clicksPerSecond) : clicksPerSecond
    while (clickAcc >= 1) {
      engine.click()
      clickAcc -= 1
    }
    engine.advance(1000)
    t++
    if (!target || t % 15 === 0) target = pick()
    let guard = 0
    while (target && run.bytes.gte(target.cost) && guard++ < 200) {
      const c = target
      if (!c.buy()) break
      record(c)
      target = pick()
    }
  }
  result.seconds = t
  result.reachedMega = result.stageAt.mega_corporation !== undefined
  result.finalClickShare = share()
  result.finalDiscount = engine.costDiscount.effective.toNumber()
  result.finalRawDiscount = engine.costDiscount.raw.toNumber()
  result.finalCrit = engine.criticalChanceInfo.effective
  for (const a of catalog.agents) result.agentsFinal[a.id] = { count: run.agents[a.id]?.count ?? 0, level: run.agents[a.id]?.level ?? 0 }
  return result
}

export const fmtTime = (s: number | undefined) =>
  s === undefined ? '-' : s < 120 ? `${s.toFixed(0)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : `${(s / 3600).toFixed(1)} h`
