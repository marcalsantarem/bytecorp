import { describe, expect, it } from 'vitest'
import type { AgentDef, Catalog } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { agentBonus, agentHireCost, agentLevelCost } from './agents'

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
  primary: { kind: 'globalProductionPercent', value: 2 },
  secondary: [{ kind: 'clickFlat', value: 1 }],
  bonusGrowthPerLevel: 0.5,
  unlock: { kind: 'always' },
  reveal: { kind: 'always' },
  ...over,
})

const catalog: Catalog = {
  stages: [{ id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } }],
  equipment: [],
  agents: [
    ag('a'),
    ag('b', { baseCost: 10 }),
    ag('c', {
      unlock: { kind: 'bytesEarnedInRun', amount: 1000 },
      reveal: { kind: 'bytesEarnedInRun', amount: 100 },
    }),
  ],
  upgrades: [],
  quantumNodes: [],
}

function engine(bytes: number, earned = bytes) {
  const state = createInitialState(0)
  state.run.bytes = D(bytes)
  state.run.bytesEarned = D(earned)
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
}

describe('custo de agentes', () => {
  it('cresce com a quantidade, é inteiro e >= 1 mesmo com desconto de 150%', () => {
    const def = ag('x')
    const costs = [0, 1, 2, 5, 12].map((n) => agentHireCost(def, n).toNumber())
    expect(costs[0]).toBe(100)
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
    for (const c of costs) expect(Number.isInteger(c)).toBe(true)
    expect(agentHireCost(def, 3, 150).toNumber()).toBe(1)
    expect(agentLevelCost(def, 4, 150).toNumber()).toBe(1)
  })

  it('evolução: levelBaseCost × growth^(nível−1) com desconto', () => {
    const def = ag('x')
    expect(agentLevelCost(def, 1).toNumber()).toBe(50)
    expect(agentLevelCost(def, 4).toNumber()).toBe(400)
    expect(agentLevelCost(def, 4, 50).toNumber()).toBe(200)
  })
})

describe('contratação', () => {
  it('debita, sobe a quantidade, define nível 1 e emite evento', () => {
    const e = engine(1000)
    const seen: unknown[] = []
    e.events.on('agentHired', (p) => seen.push(p))
    const rev = e.revision
    expect(e.hireAgent('a')).toBe(true)
    expect(e.state.run.agents['a']).toEqual({ count: 1, level: 1 })
    expect(e.state.run.bytes.toNumber()).toBe(900)
    expect(e.revision).toBeGreaterThan(rev)
    expect(e.hireAgent('a')).toBe(true)
    expect(e.state.run.bytes.toNumber()).toBe(775)
    expect(e.state.run.agents['a']?.level).toBe(1)
    expect(seen).toHaveLength(2)
    expect(seen[1]).toMatchObject({ id: 'a', count: 2 })
  })

  it('não contrata sem saldo, bloqueado ou inexistente', () => {
    const e = engine(99)
    expect(e.hireAgent('a')).toBe(false)
    expect(e.hireAgent('c')).toBe(false)
    expect(e.hireAgent('zzz')).toBe(false)
    expect(e.state.run.agents).toEqual({})
    expect(e.state.run.bytes.toNumber()).toBe(99)
    expect(engine(1e6, 10).hireAgent('c')).toBe(false)
  })
})

describe('nível coletivo', () => {
  it('não evolui sem agente; evolui uma por vez com custo em Bytes', () => {
    const e = engine(1000)
    expect(e.levelUpAgent('a')).toBe(false)
    e.hireAgent('a')
    const seen: unknown[] = []
    e.events.on('agentLeveled', (p) => seen.push(p))
    expect(e.levelUpAgent('a')).toBe(true)
    expect(e.state.run.agents['a']?.level).toBe(2)
    expect(e.state.run.bytes.toNumber()).toBe(850)
    expect(e.levelUpAgent('a')).toBe(true)
    expect(e.state.run.agents['a']?.level).toBe(3)
    expect(e.state.run.bytes.toNumber()).toBe(750)
    expect(seen).toHaveLength(2)
    expect(seen[1]).toMatchObject({ id: 'a', level: 3 })
  })

  it('sem saldo não evolui', () => {
    const e = engine(110)
    e.hireAgent('a')
    expect(e.levelUpAgent('a')).toBe(false)
    expect(e.state.run.agents['a']?.level).toBe(1)
  })
})

describe('agentBonus', () => {
  it('segue a D-10 para primário e secundários', () => {
    const def = ag('x')
    // quantidade 4, nível 3: 4 × (1 + 0,5 × 2) = 8
    expect(agentBonus(def, 4, 3)).toEqual([
      { kind: 'globalProductionPercent', value: 16 },
      { kind: 'clickFlat', value: 8 },
    ])
    expect(agentBonus(def, 1, 1)[0]?.value).toBe(2)
    expect(agentBonus(def, 0, 0).every((b) => b.value === 0)).toBe(true)
  })
})

describe('estados e lista', () => {
  it('hidden, revealed, unlocked', () => {
    expect(engine(0, 0).agentInfo('c')?.status).toBe('hidden')
    expect(engine(0, 100).agentInfo('c')?.status).toBe('revealed')
    expect(engine(0, 1000).agentInfo('c')?.status).toBe('unlocked')
    expect(engine(0).agentInfo('nada')).toBeUndefined()
  })

  it('lista ordenada pelo próximo custo, que muda ao contratar', () => {
    const e = engine(100000)
    expect(e.agentList().map((i) => i.id)).toEqual(['b', 'a', 'c'])
    for (let i = 0; i < 5; i++) e.hireAgent('b')
    // b: 10 × 1,25^5 ≈ 30 < 100 ainda; contrata mais até passar de 100
    for (let i = 0; i < 6; i++) e.hireAgent('b')
    expect(e.agentList().map((i) => i.id)).toEqual(['a', 'c', 'b'])
  })

  it('info: nível, custo de evolução e progresso', () => {
    const e = engine(125)
    const before = e.agentInfo('a')!
    expect(before).toMatchObject({ count: 0, level: 0, levelCost: null, levelProgress: null })
    e.hireAgent('a')
    const info = e.agentInfo('a')!
    expect(info.level).toBe(1)
    expect(info.levelCost?.toNumber()).toBe(50)
    expect(info.levelProgress).toBe(0.5)
    expect(info.hireCost.toNumber()).toBe(125)
    expect(info.bonus[0]?.value).toBe(2)
  })
})
