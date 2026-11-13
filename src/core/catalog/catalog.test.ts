import { describe, expect, it } from 'vitest'
import { Decimal } from '../decimal'
import { GameEngine } from '../engine'
import { createInitialState } from '../state'
import { agentBonus } from '../economy/agents'
import { DEFAULT_MAX_COST_DISCOUNT_PERCENT } from '../production'
import { CATALOG, validateCatalog } from './index'

describe('catálogo', () => {
  it('é estruturalmente válido', () => {
    expect(validateCatalog(CATALOG)).toEqual([])
  })

  it('tem os sete estágios corporativos na ordem do GDD', () => {
    expect(CATALOG.stages.map((s) => s.id)).toEqual([
      'solo_hacker',
      'garage_company',
      'startup_lab',
      'data_center',
      'corporate_network',
      'quantum_facility',
      'mega_corporation',
    ])
  })

  it('tem 7 equipamentos por categoria e 35 no total', () => {
    expect(CATALOG.equipment).toHaveLength(35)
    for (const category of ['networking', 'processing', 'storage', 'cooling', 'infrastructure']) {
      expect(CATALOG.equipment.filter((e) => e.category === category)).toHaveLength(7)
    }
  })

  it('tem 5 agentes de especialidades distintas, em ordem de custo crescente', () => {
    expect(CATALOG.agents).toHaveLength(5)
    expect(new Set(CATALOG.agents.map((a) => a.primary.kind)).size).toBeGreaterThanOrEqual(4)
    const costs = CATALOG.agents.map((a) => a.baseCost)
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
    const stageIds = new Set(CATALOG.stages.map((s) => s.id))
    for (const a of CATALOG.agents) {
      expect(a.unlock.kind === 'stageReached' && stageIds.has(a.unlock.stage)).toBe(true)
      expect(a.costGrowth).toBeGreaterThanOrEqual(1.25)
      expect(a.bonusGrowthPerLevel).toBeGreaterThan(0)
      expect(a.secondary).toEqual([])
    }
  })

  it('mantém o desconto dos agentes abaixo de 100% em quantidades realistas', () => {
    for (const a of CATALOG.agents.filter((x) => x.primary.kind === 'costDiscountPercent')) {
      expect(agentBonus(a, 40, 20)[0]!.value).toBeLessThan(100)
    }
  })

  it('o engine lista, contrata e evolui um agente do catálogo', () => {
    const state = createInitialState(0)
    state.run.stage = 'garage_company'
    state.run.bytes = new Decimal(1e6)
    state.run.bytesEarned = new Decimal(2e4)
    const engine = new GameEngine(CATALOG, state)
    expect(engine.agentList().map((a) => a.id)).toEqual(CATALOG.agents.map((a) => a.id))
    expect(engine.agentInfo('echo_ai')!.status).toBe('unlocked')
    expect(engine.agentInfo('kai_ver_3')!.status).toBe('revealed')
    expect(engine.hireAgent('kai_ver_3')).toBe(false)
    expect(engine.hireAgent('echo_ai')).toBe(true)
    expect(engine.hireAgent('echo_ai')).toBe(true)
    expect(engine.levelUpAgent('echo_ai')).toBe(true)
    const info = engine.agentInfo('echo_ai')!
    expect(info.count).toBe(2)
    expect(info.level).toBe(2)
    expect(info.bonus[0]!.value).toBeCloseTo(2 * 3 * 1.25, 9)
  })

  it('tem 20 melhorias nos três tipos, ordenadas por custo e sem efeito específico de item', () => {
    expect(CATALOG.upgrades).toHaveLength(20)
    const costs = CATALOG.upgrades.map((u) => u.cost)
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
    const unlocks = CATALOG.upgrades.map((u) => u.unlockBytesEarnedInRun)
    expect(unlocks).toEqual([...unlocks].sort((a, b) => a - b))
    for (const u of CATALOG.upgrades) {
      expect(Number.isInteger(u.cost)).toBe(true)
      expect(u.unlockBytesEarnedInRun).toBeLessThan(u.cost)
    }
    const kinds = new Set(CATALOG.upgrades.map((u) => u.effect.kind))
    expect([...kinds].sort()).toEqual(['clickFlat', 'clickPercent', 'costDiscountPercent', 'globalProductionPercent'])
    const discount = CATALOG.upgrades.filter((u) => u.effect.kind === 'costDiscountPercent').reduce((a, u) => a + u.effect.value, 0)
    expect(discount).toBeLessThanOrEqual(8)
    expect(discount).toBeLessThan(DEFAULT_MAX_COST_DISCOUNT_PERCENT) // sobra espaço do teto (D-13) para ATLAS_CORE
    expect(CATALOG.upgrades.slice(0, 12).map((u) => u.id).join()).toBe('macro_script,overclock_basic,ergonomic_keys,bulk_discount,neural_macro,task_scheduler,supplier_contract,haptic_gloves,distributed_cache,corporate_volume,load_balancer,quantum_scheduler')
    expect(CATALOG.upgrades.filter((u) => u.unlockBytesEarnedInRun >= 1e18)).not.toHaveLength(0)
  })

  it('o engine lista, libera e aplica melhorias do catálogo', () => {
    const state = createInitialState(0)
    state.run.bytes = new Decimal(1e6)
    state.run.bytesEarned = new Decimal(300)
    state.run.equipment['home_router'] = 10
    const engine = new GameEngine(CATALOG, state)
    expect(engine.upgradeList().map((u) => u.id)).toEqual(CATALOG.upgrades.map((u) => u.id))
    expect(engine.upgradeInfo('macro_script')!.status).toBe('available')
    expect(engine.upgradeInfo('neural_macro')!.status).toBe('locked')
    expect(engine.buyUpgrade('neural_macro')).toBe(false)
    const clickBefore = engine.clickValue
    expect(engine.buyUpgrade('macro_script')).toBe(true)
    expect(engine.clickValue.toNumber()).toBeCloseTo(clickBefore.toNumber() + 1, 9)
    expect(engine.buyUpgrade('macro_script')).toBe(false)
    const prodBefore = engine.production.total.toNumber()
    expect(engine.buyUpgrade('overclock_basic')).toBe(true)
    expect(engine.production.total.toNumber()).toBeCloseTo(prodBefore * (1 + (CATALOG.upgrades.find((u) => u.id === 'overclock_basic')!.effect.value) / 100), 9)
    state.run.bytesEarned = new Decimal(1e6)
    expect(engine.upgradeInfo('neural_macro')!.status).toBe('available')
  })

  it('detecta problemas comuns', () => {
    const broken = {
      ...CATALOG,
      equipment: [
        ...CATALOG.equipment,
        { ...CATALOG.equipment[0]!, costGrowth: 1, unlock: { kind: 'equipmentOwned' as const, equipment: 'nope', count: 1 } },
      ],
    }
    const problems = validateCatalog(broken)
    expect(problems).toContain('id duplicado: equipment:home_router')
    expect(problems.some((p) => p.includes('fator de crescimento'))).toBe(true)
    expect(problems.some((p) => p.includes('equipamento inexistente "nope"'))).toBe(true)
  })
})
