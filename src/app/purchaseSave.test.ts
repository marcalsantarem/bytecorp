import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Catalog } from '../core/catalog/types'
import { D } from '../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../core/engine'
import { MemoryStorage } from '../core/save/storage'
import { SaveManager } from '../core/save/saveManager'
import { createInitialState } from '../core/state'
import { createPersistence, PURCHASE_SAVE_DELAY_MS } from './purchaseSave'

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
  const setSpy = vi.spyOn(storage, 'set')
  const saves = new SaveManager(storage)
  return { engine, saves, setSpy }
}

async function loadedEquipment(saves: SaveManager) {
  const loaded = await saves.load()
  if (!('ok' in loaded) || !loaded.ok) throw new Error('save ausente ou inválido')
  return loaded.state.run.equipment.a
}

describe('salvar após compra', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('o save traz a compra sem esperar o autosave', async () => {
    const { engine, saves } = setup()
    const p = createPersistence(engine, saves)
    engine.buyEquipment('a', 'x1')
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
    expect(await loadedEquipment(saves)).toBe(1)
    p.dispose()
  })

  it('várias compras seguidas geram uma gravação com o estado final', async () => {
    const { engine, saves, setSpy } = setup()
    const p = createPersistence(engine, saves)
    engine.buyEquipment('a', 'x1')
    engine.buyEquipment('a', 'x1')
    engine.buyEquipment('a', 'x1')
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
    expect(setSpy).toHaveBeenCalledTimes(1)
    expect(await loadedEquipment(saves)).toBe(3)
    p.dispose()
  })

  it('gravações lentas não se atropelam: a última vence', async () => {
    const { engine, saves, setSpy } = setup()
    const original = MemoryStorage.prototype.set
    const delays = [50, 0]
    let call = 0
    setSpy.mockImplementation(async function (this: MemoryStorage, key: string, value: string) {
      const wait = delays[call++] ?? 0
      await new Promise((r) => setTimeout(r, wait))
      return original.call(this, key, value)
    })
    const p = createPersistence(engine, saves)
    engine.buyEquipment('a', 'x1')
    p.saveNow()
    engine.buyEquipment('a', 'x1')
    p.saveNow()
    await vi.advanceTimersByTimeAsync(200)
    expect(await loadedEquipment(saves)).toBe(2)
    p.dispose()
  })

  it('dispose cancela o agendamento e a inscrição', async () => {
    const { engine, saves, setSpy } = setup()
    const p = createPersistence(engine, saves)
    engine.buyEquipment('a', 'x1')
    p.dispose()
    engine.buyEquipment('a', 'x1')
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS * 3)
    expect(setSpy).not.toHaveBeenCalled()
  })
})
