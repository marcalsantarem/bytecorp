import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Catalog } from '../core/catalog/types'
import { D } from '../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../core/engine'
import { MemoryStorage, SETTINGS_KEY } from '../core/save/storage'
import { SaveManager } from '../core/save/saveManager'
import { createInitialState } from '../core/state'
import { createPersistence, PURCHASE_SAVE_DELAY_MS } from './purchaseSave'
import { resetGame } from './resetGame'

const catalog: Catalog = {
  stages: [{ id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } }],
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
  agents: [],
  upgrades: [],
  quantumNodes: [],
}

function setup() {
  const state = createInitialState(0)
  state.run.bytes = D(1000)
  state.run.bytesEarned = D(1000)
  const engine = new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
  const storage = new MemoryStorage()
  const saves = new SaveManager(storage)
  const persistence = createPersistence(engine, saves)
  return { engine, storage, saves, persistence }
}

async function loadState(saves: SaveManager) {
  const loaded = await saves.load()
  if (!('ok' in loaded) || !loaded.ok) throw new Error('save ausente ou inválido')
  return loaded.state
}

describe('resetGame', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('leva engine e save ao estado inicial', async () => {
    const { engine, saves, persistence } = setup()
    engine.buyEquipment('a', 'x1')
    engine.click()
    engine.state.meta.quantumCores = D(5)
    engine.state.meta.achievements.push('x')
    await persistence.saveNow()

    await resetGame(engine, persistence, 123)

    for (const s of [engine.state, await loadState(saves)]) {
      expect(s.run.bytes.eq(0)).toBe(true)
      expect(s.run.equipment).toEqual({})
      expect(s.run.agents).toEqual({})
      expect(s.stats.clicks).toBe(0)
      expect(s.stats.bytesEarnedAllTime.eq(0)).toBe(true)
      expect(s.meta.quantumCores.eq(0)).toBe(true)
      expect(s.meta.achievements).toEqual([])
    }
    expect(engine.state.run.stage).toBe(createInitialState(0).run.stage)
    persistence.dispose()
  })

  it('compra pendente não restaura o estado antigo', async () => {
    const { engine, saves, persistence } = setup()
    engine.buyEquipment('a', 'x1')
    await resetGame(engine, persistence)
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS * 3)
    expect((await loadState(saves)).run.equipment).toEqual({})
    persistence.dispose()
  })

  it('continua funcionando e grava depois do reset', async () => {
    const { engine, saves, persistence } = setup()
    await resetGame(engine, persistence)
    engine.click()
    engine.state.run.bytes = D(100)
    engine.buyEquipment('a', 'x1')
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
    const s = await loadState(saves)
    expect(s.run.equipment.a).toBe(1)
    expect(s.stats.clicks).toBe(1)
    persistence.dispose()
  })

  it('não apaga as configurações', async () => {
    const { engine, storage, persistence } = setup()
    await storage.set(SETTINGS_KEY, '{"language":"en"}')
    await resetGame(engine, persistence)
    expect(await storage.get(SETTINGS_KEY)).toBe('{"language":"en"}')
    persistence.dispose()
  })
})
