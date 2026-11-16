import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../engine'
import { D } from '../decimal'
import { createInitialState } from '../state'

function dirtyEngine(config: Partial<EngineConfig> = {}) {
  const state = createInitialState(0)
  state.run.bytes = D(5000)
  state.run.bytesEarned = D(1e6)
  state.run.stage = 'startup_lab'
  state.run.equipment = { home_router: 3 }
  state.run.agents = { [CATALOG.agents[0]!.id]: { count: 2, level: 3 } }
  state.run.upgrades = [CATALOG.upgrades[0]!.id]
  state.meta.quantumCores = D(2)
  state.meta.quantumNodes = { n1: 1 }
  state.meta.achievements = ['a1']
  state.stats.bytesEarnedAllTime = D(9e6)
  state.stats.clicks = 40
  state.stats.playTimeMs = 123
  state.stats.reboots = 1
  return new GameEngine(CATALOG, state, { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 3, ...config })
}

describe('Reboot', () => {
  it('zera a execução e preserva meta e estatísticas', () => {
    const e = dirtyEngine()
    const r = e.reboot()
    expect(r).toEqual({ ok: true, reward: 3, rebootNumber: 2 })
    const { run, meta, stats } = e.state
    expect(run.bytes.toNumber()).toBe(0)
    expect(run.bytesEarned.toNumber()).toBe(0)
    expect(run.stage).toBe('solo_hacker')
    expect(run.equipment).toEqual({})
    expect(run.agents).toEqual({})
    expect(run.upgrades).toEqual([])
    expect(meta.quantumCores.toNumber()).toBe(5)
    expect(meta.quantumNodes).toEqual({ n1: 1 })
    expect(meta.achievements).toEqual(['a1'])
    expect(stats.reboots).toBe(2)
    expect(stats.clicks).toBe(40)
    expect(stats.playTimeMs).toBe(123)
    expect(stats.bytesEarnedAllTime.toNumber()).toBe(9e6)
  })

  it('emite o evento reboot e invalida a produção', () => {
    const e = dirtyEngine()
    const seen: unknown[] = []
    e.events.on('reboot', (p) => seen.push(p))
    expect(e.production.total.gt(0)).toBe(true)
    const rev = e.revision
    e.reboot()
    expect(seen).toEqual([{ reward: 3, rebootNumber: 2 }])
    expect(e.revision).toBeGreaterThan(rev)
    expect(e.production.total.toNumber()).toBe(0)
    expect(e.stageInfo.current?.id).toBe('solo_hacker')
  })

  it('recusa sem recompensa e não altera o estado', () => {
    for (const reward of [0, 0.9, -2, NaN]) {
      const e = dirtyEngine({ rebootReward: () => reward })
      let fired = false
      e.events.on('reboot', () => (fired = true))
      expect(e.reboot()).toEqual({ ok: false, reason: 'noReward' })
      expect(fired).toBe(false)
      expect(e.state.run.bytes.toNumber()).toBe(5000)
      expect(e.state.stats.reboots).toBe(1)
      expect(e.state.meta.quantumCores.toNumber()).toBe(2)
    }
  })

  it('o padrão provisório recusa o Reboot', () => {
    const e = new GameEngine(CATALOG, createInitialState(0))
    expect(e.rebootRewardNow).toBe(0)
    expect(e.reboot().ok).toBe(false)
  })

  it('arredonda a recompensa para baixo', () => {
    const e = dirtyEngine({ rebootReward: () => 2.9 })
    expect(e.reboot()).toMatchObject({ ok: true, reward: 2 })
  })

  it('o motor segue produzindo e comprando depois', () => {
    const e = dirtyEngine()
    e.reboot()
    for (let i = 0; i < 20; i++) e.click()
    expect(e.state.run.bytes.gt(0)).toBe(true)
    const first = CATALOG.equipment[0]!
    e.state.run.bytes = D(1000)
    expect(e.buyEquipment(first.id, 'x1')).toBe(1)
    const before = e.state.run.bytes
    e.advance(10_000)
    expect(e.state.run.bytes.gt(before)).toBe(true)
  })
})
