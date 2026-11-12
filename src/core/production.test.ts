import { describe, expect, it } from 'vitest'
import type { AgentDef, Catalog, EquipmentDef, UpgradeDef } from './catalog/types'
import { D } from './decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from './engine'
import { combineProduction } from './production'
import { createInitialState, type GameState } from './state'

const eq = (id: string, over: Partial<EquipmentDef> = {}): EquipmentDef => ({
  id,
  category: 'networking',
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  icon: 'zap',
  baseCost: 100,
  costGrowth: 1.15,
  baseProduction: 10,
  unlock: { kind: 'always' },
  reveal: { kind: 'always' },
  ...over,
})

const ag = (id: string, over: Partial<AgentDef> = {}): AgentDef => ({
  id,
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  specialtyKey: 'equipment.home_router.desc',
  icon: 'bot',
  baseCost: 100,
  costGrowth: 1.25,
  levelBaseCost: 50,
  levelCostGrowth: 2,
  primary: { kind: 'globalProductionPercent', value: 10 },
  secondary: [],
  bonusGrowthPerLevel: 0.5,
  unlock: { kind: 'always' },
  reveal: { kind: 'always' },
  ...over,
})

const up = (id: string, effect: UpgradeDef['effect'], cost = 10): UpgradeDef => ({
  id,
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  icon: 'zap',
  cost,
  effect,
  unlockBytesEarnedInRun: 0,
})

const catalog: Catalog = {
  stages: [{ id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } }],
  equipment: [eq('e1'), eq('e2', { baseProduction: 5 })],
  agents: [
    ag('a1'),
    ag('a2', {
      primary: { kind: 'globalProductionPercent', value: 4 },
      secondary: [
        { kind: 'clickFlat', value: 3 },
        { kind: 'costDiscountPercent', value: 10 },
      ],
    }),
  ],
  upgrades: [
    up('u_prod', { kind: 'globalProductionPercent', value: 20 }),
    up('u_prod2', { kind: 'globalProductionPercent', value: 5 }),
    up('u_flat', { kind: 'clickFlat', value: 2 }),
    up('u_pct', { kind: 'clickPercent', value: 50 }),
    up('u_disc', { kind: 'costDiscountPercent', value: 20 }),
    up('u_crit', { kind: 'criticalChancePercent', value: 25 }),
    up('u_critx', { kind: 'criticalMultiplier', value: 3 }),
  ],
  quantumNodes: [],
}

function make(setup?: (s: GameState) => void, cfg: Partial<EngineConfig> = {}) {
  const state = createInitialState(0)
  state.run.bytes = D(1e9)
  state.run.bytesEarned = D(1e9)
  setup?.(state)
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.5, ...cfg })
}

describe('fórmula global de produção', () => {
  it('combina as três camadas (exemplo 5.040)', () => {
    const r = combineProduction(1000, { layer1: 50 + 30, quantum: 40, temporaryFactors: [2] })
    expect(r.toNumber()).toBeCloseTo(5040, 9)
  })

  it('sem bônus, multiplicador 1 e camadas neutras', () => {
    const e = make((s) => (s.run.equipment.e1 = 2))
    expect(e.production.multiplier.toNumber()).toBe(1)
    expect(e.production.total.toNumber()).toBe(20)
    expect(e.production.layers.quantum.toNumber()).toBe(0)
    expect(e.production.layers.temporary.toNumber()).toBe(1)
  })

  it('bônus de agente por quantidade e nível', () => {
    const e = make((s) => {
      s.run.equipment.e1 = 10
      s.run.agents.a1 = { count: 2, level: 3 }
    })
    // 10 x 2 x (1 + 0,5 x 2) = 40 pontos
    expect(e.production.layers.bonus.agents.toNumber()).toBe(40)
    expect(e.production.total.toNumber()).toBeCloseTo(100 * 1.4, 9)
  })

  it('soma agentes e melhorias na mesma camada e rastreia a origem', () => {
    const e = make((s) => {
      s.run.equipment.e1 = 10
      s.run.agents.a1 = { count: 1, level: 1 }
      s.run.agents.a2 = { count: 1, level: 1 }
      s.run.upgrades.push('u_prod', 'u_prod2')
    })
    const { layers } = e.production
    expect(layers.bonus.agents.toNumber()).toBe(14)
    expect(layers.bonus.upgrades.toNumber()).toBe(25)
    expect(layers.bonus.total.toNumber()).toBe(39)
    expect(e.production.bySource.equipment.toNumber()).toBe(100)
    expect(e.production.total.toNumber()).toBeCloseTo(139, 9)
  })

  it('clique com fixos, percentuais e multiplicador global', () => {
    const e = make((s) => {
      s.run.agents.a2 = { count: 1, level: 1 } // +3 fixo, +4 pp de produção
      s.run.upgrades.push('u_flat', 'u_pct', 'u_prod') // +2 fixo, +50%, +20 pp
    })
    // (1 + 3 + 2) x 1,5 x 1,24 = 11,16
    expect(e.clickValue.toNumber()).toBeCloseTo(11.16, 9)
  })

  it('crítico soma chance e multiplicador', () => {
    const cfg = { criticalChance: 0.05, criticalMultiplier: 5, random: () => 0.2 }
    const sem = make(undefined, cfg)
    sem.click()
    expect(sem.state.stats.criticalClicks).toBe(0)
    const com = make((s) => s.run.upgrades.push('u_crit', 'u_critx'), cfg)
    const gained = com.click()
    expect(com.state.stats.criticalClicks).toBe(1)
    expect(gained.toNumber()).toBe(8) // 1 x (5 + 3)
  })

  it('chance crítica fica limitada a 0..1', () => {
    const e = make((s) => s.run.upgrades.push('u_crit'), { criticalChance: 0.9, random: () => 0.999 })
    e.click()
    expect(e.state.stats.criticalClicks).toBe(1)
  })

  it('desconto vale para equipamento e agente, não para melhoria', () => {
    const e = make((s) => s.run.upgrades.push('u_disc')) // 20%
    expect(e.equipmentInfo('e1')!.nextCost.toNumber()).toBe(80)
    expect(e.agentInfo('a1')!.hireCost.toNumber()).toBe(80)
    e.hireAgent('a1')
    expect(e.agentInfo('a1')!.levelCost!.toNumber()).toBe(40)
    const before = e.state.run.bytes
    expect(e.buyUpgrade('u_prod')).toBe(true)
    expect(before.sub(e.state.run.bytes).toNumber()).toBe(10)
  })

  it('desconto de agente soma com o de melhoria', () => {
    const e = make((s) => {
      s.run.upgrades.push('u_disc')
      s.run.agents.a2 = { count: 1, level: 1 } // +10
    })
    expect(e.equipmentInfo('e1')!.nextCost.toNumber()).toBe(70)
  })
})

describe('invalidação e consistência', () => {
  it('contratar, evoluir e comprar melhoria refletem na hora', () => {
    const e = make((s) => (s.run.equipment.e1 = 10))
    expect(e.production.total.toNumber()).toBe(100)
    e.hireAgent('a1')
    expect(e.production.total.toNumber()).toBeCloseTo(110, 9)
    e.levelUpAgent('a1')
    expect(e.production.total.toNumber()).toBeCloseTo(115, 9) // 10 x 1,5 = 15 pp
    e.buyUpgrade('u_prod')
    expect(e.production.total.toNumber()).toBeCloseTo(135, 9)
  })

  it('clique e desconto refletem a compra', () => {
    const e = make()
    expect(e.clickValue.toNumber()).toBe(1)
    e.buyUpgrade('u_flat')
    expect(e.clickValue.toNumber()).toBe(3)
    e.buyUpgrade('u_disc')
    expect(e.equipmentInfo('e1')!.nextCost.toNumber()).toBe(80)
  })

  it('mesmo resultado com o tempo fatiado', () => {
    const setup = (s: GameState) => {
      s.run.equipment.e1 = 7
      s.run.agents.a1 = { count: 2, level: 2 }
      s.run.upgrades.push('u_prod')
    }
    const a = make(setup)
    const b = make(setup)
    a.advance(60_000)
    for (let i = 0; i < 3600; i++) b.advance(1000 / 60)
    const ga = a.state.run.bytes.sub(1e9).toNumber()
    expect(b.state.run.bytes.sub(1e9).toNumber()).toBeCloseTo(ga, 3)
    expect(ga).toBeGreaterThan(0)
  })
})
