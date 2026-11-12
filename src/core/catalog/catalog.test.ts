import { describe, expect, it } from 'vitest'
import { Decimal } from '../decimal'
import { GameEngine } from '../engine'
import { createInitialState } from '../state'
import { agentBonus } from '../economy/agents'
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

  it('tem 5 equipamentos por categoria e 25 no total', () => {
    expect(CATALOG.equipment).toHaveLength(25)
    for (const category of ['networking', 'processing', 'storage', 'cooling', 'infrastructure']) {
      expect(CATALOG.equipment.filter((e) => e.category === category)).toHaveLength(5)
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
    expect(info.bonus[0]!.value).toBeCloseTo(2 * 5 * 1.5, 9)
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
