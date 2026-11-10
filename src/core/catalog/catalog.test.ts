import { describe, expect, it } from 'vitest'
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

  it('tem 3 equipamentos por categoria e 15 no total', () => {
    expect(CATALOG.equipment).toHaveLength(15)
    for (const category of ['networking', 'processing', 'storage', 'cooling', 'infrastructure']) {
      expect(CATALOG.equipment.filter((e) => e.category === category)).toHaveLength(3)
    }
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
