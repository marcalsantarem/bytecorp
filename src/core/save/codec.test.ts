import { describe, expect, it } from 'vitest'
import { D } from '../decimal'
import { createInitialState } from '../state'
import { decodeSave, encodeSave, SAVE_VERSION } from './codec'
import { MemoryStorage } from './storage'
import { SaveManager } from './saveManager'
import { CATALOG } from '../catalog'
import { GameEngine } from '../engine'

function sampleState() {
  const state = createInitialState(1000)
  state.run.bytes = D('1.5e40')
  state.run.bytesEarned = D('3e40')
  state.run.stage = 'data_center'
  state.run.equipment = { home_router: 12 }
  state.run.agents = { kai: { count: 3, level: 2 } }
  state.run.upgrades = ['u1']
  state.meta.quantumCores = D(42)
  state.meta.quantumNodes = { a1: 3 }
  state.stats.clicks = 99
  state.stats.playTimeMs = 123_456.5
  return state
}

describe('codec do save', () => {
  it('preserva o estado em ida e volta, inclusive números acima de Yotta', () => {
    const state = sampleState()
    const result = decodeSave(encodeSave(state, 5000))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.savedAt).toBe(5000)
    expect(result.state.run.bytes.eq(state.run.bytes)).toBe(true)
    expect(result.state.run.bytesEarned.toString()).toBe('3e+40')
    expect(result.state.run.agents).toEqual({ kai: { count: 3, level: 2 } })
    expect(result.state.meta.quantumCores.toNumber()).toBe(42)
    expect(result.state.stats.playTimeMs).toBe(123_456.5)
  })

  it('identifica JSON ilegível como corrompido', () => {
    expect(decodeSave('{not json')).toMatchObject({ ok: false, reason: 'corrupt' })
  })

  it('rejeita estrutura inválida informando o campo', () => {
    const envelope = JSON.parse(encodeSave(sampleState(), 0))
    envelope.state.run.equipment.home_router = -1
    const result = decodeSave(JSON.stringify(envelope))
    expect(result).toMatchObject({ ok: false, reason: 'invalid' })
    if (!result.ok) expect(result.detail).toContain('run.equipment.home_router')
  })

  it('rejeita estágio desconhecido e Decimal inválido', () => {
    const a = JSON.parse(encodeSave(sampleState(), 0))
    a.state.run.stage = 'moon_base'
    expect(decodeSave(JSON.stringify(a))).toMatchObject({ ok: false, reason: 'invalid' })

    const b = JSON.parse(encodeSave(sampleState(), 0))
    b.state.run.bytes = 'abc'
    expect(decodeSave(JSON.stringify(b))).toMatchObject({ ok: false, reason: 'invalid' })
  })

  it('preserva aceleradores e bônus temporários em ida e volta', () => {
    const state = sampleState()
    state.meta.accelerators = {
      active: { id: 'acc-3', multiplier: 5, remainingMs: 61_000 },
      inventory: [{ id: 'acc-4', multiplier: 2, remainingMs: 900_000 }],
      granted: ['stage:garage_company', 'reboot:1'],
      nextItemId: 5,
    }
    state.meta.temporaryBonuses = [{ id: 'ach', multiplier: 1.5, remainingMs: 5000 }]
    const result = decodeSave(encodeSave(state, 0))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.meta.accelerators).toEqual(state.meta.accelerators)
    expect(result.state.meta.temporaryBonuses).toEqual(state.meta.temporaryBonuses)
  })

  it('migra a versão 1 sem os campos novos', () => {
    const envelope = JSON.parse(encodeSave(sampleState(), 0))
    envelope.version = 1
    delete envelope.state.meta.accelerators
    delete envelope.state.meta.temporaryBonuses
    const result = decodeSave(JSON.stringify(envelope))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.meta.accelerators).toEqual({ active: null, inventory: [], granted: [], nextItemId: 1 })
    expect(result.state.meta.temporaryBonuses).toEqual([])
    expect(result.state.meta.quantumNodes).toEqual({ a1: 3 })
  })

  it('rejeita aceleradores inválidos informando o campo', () => {
    const base = () => JSON.parse(encodeSave(sampleState(), 0))
    const a = base()
    a.state.meta.accelerators.active = { id: 'x', multiplier: 2, remainingMs: 0 }
    const ra = decodeSave(JSON.stringify(a))
    expect(ra).toMatchObject({ ok: false, reason: 'invalid' })
    if (!ra.ok) expect(ra.detail).toContain('meta.accelerators.active.remainingMs')

    const b = base()
    delete b.state.meta.temporaryBonuses
    expect(decodeSave(JSON.stringify(b))).toMatchObject({ ok: false, reason: 'invalid' })

    const c = base()
    c.state.meta.accelerators.inventory = [{ id: 'x', multiplier: -1, remainingMs: 5 }]
    expect(decodeSave(JSON.stringify(c))).toMatchObject({ ok: false, reason: 'invalid' })
  })

  it('rejeita save de versão futura', () => {
    const envelope = JSON.parse(encodeSave(sampleState(), 0))
    envelope.version = SAVE_VERSION + 1
    expect(decodeSave(JSON.stringify(envelope))).toMatchObject({ ok: false, reason: 'unsupportedVersion' })
  })
})

describe('SaveManager', () => {
  it('distingue slot vazio, salva e carrega', async () => {
    const manager = new SaveManager(new MemoryStorage(), () => 777)
    expect(await manager.load()).toEqual({ kind: 'empty' })

    const engine = new GameEngine(CATALOG, sampleState())
    await manager.save(engine)
    const loaded = await manager.load()
    expect(loaded).toMatchObject({ ok: true, savedAt: 777 })

    await manager.clear()
    expect(await manager.load()).toEqual({ kind: 'empty' })
  })
})
