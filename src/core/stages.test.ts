import { describe, expect, it } from 'vitest'
import type { Catalog, EquipmentDef, StageId } from './catalog/types'
import { D } from './decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from './engine'
import { createInitialState, type GameState } from './state'

const eq = (id: string, over: Partial<EquipmentDef> = {}): EquipmentDef => ({
  id,
  category: 'networking',
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  icon: 'router',
  baseCost: 10,
  costGrowth: 1.15,
  baseProduction: 10,
  unlock: { kind: 'always' },
  reveal: { kind: 'always' },
  ...over,
})

// Fora de ordem de propósito: o engine ordena por `order`.
const catalog: Catalog = {
  stages: [
    { id: 'startup_lab', order: 2, nameKey: 'stage.startup_lab', requirement: { kind: 'bytesEarnedInRun', amount: 1000 } },
    { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
    { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 100 } },
    {
      id: 'data_center',
      order: 3,
      nameKey: 'stage.data_center',
      requirement: { kind: 'equipmentOwned', equipment: 'a', count: 2 },
    },
  ],
  equipment: [eq('a'), eq('g', { unlock: { kind: 'stageReached', stage: 'garage_company' }, reveal: { kind: 'always' } })],
  agents: [],
  upgrades: [],
  quantumNodes: [],
}

function stateWith(over: { earned?: number; bytes?: number; stage?: StageId; a?: number } = {}): GameState {
  const state = createInitialState(0)
  state.run.bytesEarned = D(over.earned ?? 0)
  state.run.bytes = D(over.bytes ?? over.earned ?? 0)
  if (over.stage) state.run.stage = over.stage
  if (over.a) state.run.equipment.a = over.a
  return state
}

function engineWith(state: GameState, config: Partial<EngineConfig> = {}) {
  const engine = new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99, ...config })
  const changes: string[] = []
  engine.events.on('stageChanged', ({ from, to }) => changes.push(`${from}>${to}`))
  return { engine, changes }
}

describe('estágios corporativos', () => {
  it('avança ao atingir o requisito do próximo estágio', () => {
    const { engine, changes } = engineWith(stateWith({ a: 1 }))
    engine.advance(9000)
    expect(engine.state.run.stage).toBe('solo_hacker')
    expect(changes).toEqual([])
    engine.advance(1000)
    expect(engine.state.run.stage).toBe('garage_company')
    expect(changes).toEqual(['solo_hacker>garage_company'])
  })

  it('pula estágios com um evento por estágio, em ordem', () => {
    const { engine, changes } = engineWith(stateWith(), { baseClick: 5000 })
    const revision = engine.revision
    engine.click()
    expect(engine.state.run.stage).toBe('startup_lab')
    expect(changes).toEqual(['solo_hacker>garage_company', 'garage_company>startup_lab'])
    expect(engine.revision).toBeGreaterThan(revision)
  })

  it('avança após uma compra que atende o requisito', () => {
    const { engine, changes } = engineWith(stateWith({ earned: 1000, a: 1 }))
    expect(engine.state.run.stage).toBe('startup_lab')
    expect(engine.buyEquipment('a', 'x1')).toBe(1)
    expect(engine.state.run.stage).toBe('data_center')
    expect(changes).toEqual(['startup_lab>data_center'])
  })

  it('não regride quando o saldo cai nem quando o requisito deixa de valer', () => {
    const { engine, changes } = engineWith(stateWith({ earned: 100 }))
    expect(engine.state.run.stage).toBe('garage_company')
    engine.buyEquipment('a', 'max')
    expect(engine.state.run.bytes.lt(100)).toBe(true)
    engine.state.run.bytes = D(0)
    engine.state.run.bytesEarned = D(0)
    engine.advance(5)
    engine.click()
    expect(engine.state.run.stage).toBe('garage_company')
    expect(changes).toEqual([])
  })

  it('corrige sem evento um estado carregado com estágio defasado', () => {
    const built = engineWith(stateWith({ earned: 5000 }))
    expect(built.engine.state.run.stage).toBe('startup_lab')

    const { engine, changes } = engineWith(stateWith())
    const loaded = stateWith({ earned: 150 })
    engine.replaceState(loaded)
    expect(loaded.run.stage).toBe('garage_company')
    expect(changes).toEqual([])
    expect(engine.stageInfo.current?.id).toBe('garage_company')

    // Estágio salvo acima do que os requisitos garantem fica como está.
    engine.replaceState(stateWith({ stage: 'startup_lab' }))
    expect(engine.state.run.stage).toBe('startup_lab')
    expect(changes).toEqual([])
  })

  it('termina no mesmo estágio independentemente de como o tempo é fatiado', () => {
    const total = 150_000
    const oneCall = engineWith(stateWith({ a: 1 }))
    const manyCalls = engineWith(stateWith({ a: 1 }))
    const irregular = engineWith(stateWith({ a: 1 }))

    oneCall.engine.advance(total)
    for (let i = 0; i < (total / 1000) * 60; i++) manyCalls.engine.advance(1000 / 60)
    const frames = [7, 33, 16, 250, 1, 2000, 41]
    let elapsed = 0
    for (let i = 0; elapsed < total; i++) {
      const dt = Math.min(frames[i % frames.length]!, total - elapsed)
      irregular.engine.advance(dt)
      elapsed += dt
    }

    const expected = ['solo_hacker>garage_company', 'garage_company>startup_lab']
    for (const { engine, changes } of [oneCall, manyCalls, irregular]) {
      expect(engine.state.run.stage).toBe('startup_lab')
      expect(changes).toEqual(expected)
    }
  })

  it('desbloqueia item com unlock por stageReached quando o estágio muda', () => {
    const { engine } = engineWith(stateWith({ earned: 99 }), { baseClick: 1 })
    expect(engine.equipmentInfo('g')?.status).toBe('revealed')
    engine.click()
    expect(engine.equipmentInfo('g')?.status).toBe('unlocked')
  })

  it('informa o estágio atual e o próximo com o requisito', () => {
    const { engine } = engineWith(stateWith())
    expect(engine.stageInfo.current?.id).toBe('solo_hacker')
    expect(engine.stageInfo.next?.id).toBe('garage_company')
    expect(engine.stageInfo.next?.requirement).toEqual({ kind: 'bytesEarnedInRun', amount: 100 })

    const last = engineWith(stateWith({ earned: 1000, a: 2 }))
    expect(last.engine.stageInfo.current?.id).toBe('data_center')
    expect(last.engine.stageInfo.next).toBeNull()
  })
})
