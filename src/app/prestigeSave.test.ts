import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { CATALOG } from '../core/catalog'
import type { Catalog, QuantumNodeDef } from '../core/catalog/types'
import { D } from '../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../core/engine'
import { decodeSave, encodeSave } from '../core/save/codec'
import { SaveManager } from '../core/save/saveManager'
import { createInitialState } from '../core/state'
import { IndexedDbStorage } from '../platform/indexedDbStorage'
import { createPersistence } from './purchaseSave'

// fake-indexeddb não convive com timers falsos: usa relógio real e janela curta.
const DELAY = 10
const settle = (ms = 150) => new Promise((r) => setTimeout(r, ms))

const node = (id: string): QuantumNodeDef => ({
  id,
  path: 'alpha',
  nameKey: 'stage.solo_hacker',
  descriptionKey: 'stage.solo_hacker',
  icon: 'cpu',
  baseCost: 2,
  costGrowth: 2,
  effectPerLevel: { kind: 'globalProductionPercent', value: 10 },
  prerequisites: [],
  maxLevel: 5,
  position: { x: 0, y: 0 },
})
type Env = { state: { meta: { treeResets: number }; stats: { reboots: number } } }
const catalog: Catalog = { ...CATALOG, quantumNodes: [node('a')] }

function setup() {
  const state = createInitialState(0)
  state.run.bytes = D(1000)
  state.run.bytesEarned = D(1000)
  state.run.equipment = { x: 3 }
  const engine = new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 10 })
  const saves = new SaveManager(new IndexedDbStorage(new IDBFactory()))
  return { engine, saves }
}

async function loaded(saves: SaveManager) {
  const r = await saves.load()
  if (!('ok' in r) || !r.ok) throw new Error('save ausente ou inválido')
  return r.state
}

describe('save do prestígio (IndexedDB)', () => {
  it('o Reboot grava já, sem esperar a janela coalescida', async () => {
    const { engine, saves } = setup()
    const p = createPersistence(engine, saves, DELAY)
    expect(engine.reboot().ok).toBe(true)
    await p.saveNow()
    const s = await loaded(saves)
    expect(s.meta.quantumCores.toNumber()).toBe(10)
    expect(s.stats.reboots).toBe(1)
    expect(s.run.equipment).toEqual({})
    expect(s.run.bytes.toNumber()).toBe(0)
    p.dispose()
  })

  it('o Reboot grava sem chamar saveNow (antes da janela coalescida)', async () => {
    const { engine, saves } = setup()
    const p = createPersistence(engine, saves, 5000)
    engine.reboot()
    await settle(50)
    expect((await loaded(saves)).stats.reboots).toBe(1)
    p.dispose()
  })

  it('compra de nó e reset da árvore gravam e recarregam', async () => {
    const { engine, saves } = setup()
    engine.state.meta.quantumCores = D(20)
    const p = createPersistence(engine, saves, DELAY)
    expect(engine.buyQuantumNode('a').ok).toBe(true)
    expect(engine.buyQuantumNode('a').ok).toBe(true)
    await settle()
    let s = await loaded(saves)
    expect(s.meta.quantumNodes).toEqual({ a: 2 })
    expect(s.meta.quantumCores.toNumber()).toBe(14)

    expect(engine.resetQuantumTree().ok).toBe(true)
    await settle()
    s = await loaded(saves)
    expect(s.meta.quantumNodes).toEqual({})
    expect(s.meta.treeResets).toBe(1)
    p.dispose()
  })
})

describe('codec do prestígio', () => {
  it('preserva nós desconhecidos do catálogo (decisão documentada)', () => {
    const state = createInitialState(0)
    state.meta.quantumNodes = { removido: 2 }
    const r = decodeSave(encodeSave(state, 1))
    expect(r.ok && r.state.meta.quantumNodes).toEqual({ removido: 2 })
  })

  it.each([
    ['nível negativo', { a: -1 }],
    ['nível fracionário', { a: 1.5 }],
    ['nível em texto', { a: '2' }],
  ])('rejeita meta.quantumNodes com %s', (_n, nodes) => {
    const env = JSON.parse(encodeSave(createInitialState(0), 1))
    env.state.meta.quantumNodes = nodes
    expect(decodeSave(JSON.stringify(env)).ok).toBe(false)
  })

  it('rejeita treeResets e reboots inválidos', () => {
    for (const edit of [(e: Env) => (e.state.meta.treeResets = -1), (e: Env) => (e.state.stats.reboots = 1.2)]) {
      const env = JSON.parse(encodeSave(createInitialState(0), 1))
      edit(env)
      expect(decodeSave(JSON.stringify(env)).ok).toBe(false)
    }
  })

  it('save v1 sem nós e sem resets carrega com o prestígio zerado', () => {
    const env = JSON.parse(encodeSave(createInitialState(0), 1))
    env.version = 1
    const r = decodeSave(JSON.stringify(env))
    expect(r.ok && r.state.meta.quantumNodes).toEqual({})
    expect(r.ok && r.state.meta.treeResets).toBe(0)
    expect(r.ok && r.state.stats.reboots).toBe(0)
  })
})
