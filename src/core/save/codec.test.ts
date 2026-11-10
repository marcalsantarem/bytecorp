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
