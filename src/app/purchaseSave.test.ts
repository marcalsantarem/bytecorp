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

  describe('ações do M2', () => {
    const m2: Catalog = {
      ...catalog,
      stages: [
        catalog.stages[0]!,
        { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 5000 } },
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
          effect: { kind: 'clickFlat', value: 1 },
          unlockBytesEarnedInRun: 0,
        },
      ],
    } as unknown as Catalog

    function setupM2() {
      const state = createInitialState(0)
      state.run.bytes = D(1000)
      state.run.bytesEarned = D(1000)
      const engine = new GameEngine(m2, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
      const storage = new MemoryStorage()
      const setSpy = vi.spyOn(storage, 'set')
      const saves = new SaveManager(storage)
      return { engine, saves, setSpy }
    }

    async function loadedState(saves: SaveManager) {
      const loaded = await saves.load()
      if (!('ok' in loaded) || !loaded.ok) throw new Error('save ausente ou inválido')
      return loaded.state
    }

    it('contratar grava sem esperar o autosave', async () => {
      const { engine, saves } = setupM2()
      const p = createPersistence(engine, saves)
      expect(engine.hireAgent('g')).toBe(true)
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
      expect((await loadedState(saves)).run.agents.g).toEqual({ count: 1, level: 1 })
      p.dispose()
    })

    it('evoluir grava sem esperar o autosave', async () => {
      const { engine, saves } = setupM2()
      engine.hireAgent('g')
      const p = createPersistence(engine, saves)
      expect(engine.levelUpAgent('g')).toBe(true)
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
      expect((await loadedState(saves)).run.agents.g?.level).toBe(2)
      p.dispose()
    })

    it('comprar melhoria grava sem esperar o autosave', async () => {
      const { engine, saves } = setupM2()
      const p = createPersistence(engine, saves)
      expect(engine.buyUpgrade('u')).toBe(true)
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
      expect((await loadedState(saves)).run.upgrades).toEqual(['u'])
      p.dispose()
    })

    it('mudar de estágio grava sem esperar o autosave', async () => {
      const { engine, saves } = setupM2()
      const p = createPersistence(engine, saves)
      engine.state.run.bytesEarned = D(6000)
      engine.click()
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
      expect((await loadedState(saves)).run.stage).toBe('garage_company')
      p.dispose()
    })

    it('ações de tipos diferentes na mesma janela geram uma gravação só', async () => {
      const { engine, saves, setSpy } = setupM2()
      const p = createPersistence(engine, saves)
      engine.buyEquipment('a', 'x1')
      engine.hireAgent('g')
      engine.levelUpAgent('g')
      engine.buyUpgrade('u')
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS)
      expect(setSpy).toHaveBeenCalledTimes(1)
      const s = await loadedState(saves)
      expect(s.run.equipment.a).toBe(1)
      expect(s.run.agents.g?.level).toBe(2)
      expect(s.run.upgrades).toEqual(['u'])
      p.dispose()
    })

    it('depois do dispose nenhuma ação grava', async () => {
      const { engine, saves, setSpy } = setupM2()
      const p = createPersistence(engine, saves)
      p.dispose()
      engine.hireAgent('g')
      engine.levelUpAgent('g')
      engine.buyUpgrade('u')
      engine.state.run.bytesEarned = D(6000)
      engine.click()
      await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS * 3)
      expect(setSpy).not.toHaveBeenCalled()
    })
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
