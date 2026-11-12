import { describe, expect, it } from 'vitest'
import type { Catalog } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { decodeSave, encodeSave } from './codec'

const catalog = {
  stages: [
    { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
    { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 5000 } },
  ],
  equipment: [
    {
      id: 'a',
      category: 'networking',
      nameKey: 'equipment.home_router.name',
      descriptionKey: 'equipment.home_router.desc',
      icon: 'router',
      baseCost: 10,
      costGrowth: 1.15,
      baseProduction: 1,
      unlock: { kind: 'always' },
      reveal: { kind: 'always' },
    },
  ],
  agents: [
    {
      id: 'g',
      nameKey: 'agent.script_kiddie.name',
      descriptionKey: 'agent.script_kiddie.desc',
      specialtyKey: 'agent.script_kiddie.specialty',
      icon: 'bot',
      baseCost: 20,
      costGrowth: 1.25,
      levelBaseCost: 30,
      levelCostGrowth: 1.5,
      primary: { kind: 'globalProductionPercent', value: 10 },
      secondary: [],
      bonusGrowthPerLevel: 10,
      unlock: { kind: 'always' },
      reveal: { kind: 'always' },
    },
  ],
  upgrades: [
    {
      id: 'u',
      nameKey: 'upgrade.overclock.name',
      descriptionKey: 'upgrade.overclock.desc',
      icon: 'zap',
      cost: 50,
      effect: { kind: 'globalProductionPercent', value: 50 },
      unlockBytesEarnedInRun: 0,
    },
  ],
  quantumNodes: [],
} as unknown as Catalog

const config = { ...DEFAULT_CONFIG, random: () => 0.99 }

function decoded(text: string) {
  const result = decodeSave(text)
  if (!result.ok) throw new Error(result.detail)
  return result.state
}

describe('save com estados do M2', () => {
  it('ida e volta com agentes, nível, melhorias e estágio avançado preserva estado e produção', () => {
    const state = createInitialState(0)
    state.run.bytes = D(100_000)
    state.run.bytesEarned = D(100_000)
    const engine = new GameEngine(catalog, state, config)
    engine.buyEquipment('a', 'x10')
    engine.hireAgent('g')
    engine.hireAgent('g')
    engine.levelUpAgent('g')
    engine.buyUpgrade('u')
    engine.click()
    expect(engine.state.run.stage).toBe('garage_company')

    const back = decoded(encodeSave(engine.state, 1))
    expect(back.run.stage).toBe('garage_company')
    expect(back.run.agents.g).toEqual({ count: 2, level: 2 })
    expect(back.run.upgrades).toEqual(['u'])
    expect(back.run.equipment.a).toBe(10)

    const restored = new GameEngine(catalog, back, config)
    expect(restored.production.total.eq(engine.production.total)).toBe(true)
    expect(restored.production.total.gt(0)).toBe(true)
  })

  it('ids que não existem mais no catálogo carregam sem erro e são ignorados', () => {
    const state = createInitialState(0)
    state.run.equipment = { a: 3, fantasma: 7 }
    state.run.agents = { g: { count: 1, level: 1 }, fantasma: { count: 4, level: 9 } }
    state.run.upgrades = ['u', 'fantasma']

    const clean = createInitialState(0)
    clean.run.equipment = { a: 3 }
    clean.run.agents = { g: { count: 1, level: 1 } }
    clean.run.upgrades = ['u']

    const engine = new GameEngine(catalog, decoded(encodeSave(state, 1)), config)
    const reference = new GameEngine(catalog, clean, config)
    expect(engine.production.total.eq(reference.production.total)).toBe(true)
    expect(engine.clickValue.eq(reference.clickValue)).toBe(true)

    engine.advance(5000)
    engine.click()
    engine.state.run.bytes = D(1000)
    expect(() => {
      engine.buyEquipment('a', 'x1')
      engine.hireAgent('g')
      engine.levelUpAgent('g')
      engine.buyEquipment('fantasma', 'x1')
      engine.hireAgent('fantasma')
    }).not.toThrow()
    expect(engine.production.total.gt(0)).toBe(true)
  })
})
