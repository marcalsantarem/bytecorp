import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistence, PURCHASE_SAVE_DELAY_MS } from '../../app/purchaseSave'
import { resetGame } from '../../app/resetGame'
import type { AchievementDef } from '../catalog/achievements'
import { CATALOG } from '../catalog'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { decodeSave, encodeSave, SAVE_VERSION } from './codec'
import { SaveManager } from './saveManager'
import { MemoryStorage } from './storage'

const K = 'stage.solo_hacker' as AchievementDef['nameKey']
const DEFS: AchievementDef[] = [
  { id: 'clicks_3', category: 'clicks', rarity: 'bronze', requirement: { kind: 'clicks', amount: 3 }, nameKey: K, descriptionKey: K, reward: { kind: 'bytes', amount: 10 } },
  { id: 'reboot_1', category: 'reboots', rarity: 'silver', requirement: { kind: 'reboots', amount: 1 }, nameKey: K, descriptionKey: K, reward: { kind: 'quantumCores', amount: 2 } },
]
const config = { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 1 }

function sample() {
  const s = createInitialState(1000)
  s.meta.achievements = ['clicks_3']
  s.meta.achievementUnlocks = { clicks_3: { at: 5000, playTimeMs: 1234.5 } }
  s.meta.achievementRewardsDelivered = ['clicks_3']
  s.meta.achievementQueue = ['clicks_3']
  s.meta.tutorial = { completedSteps: ['click', 'buy'], dismissed: true }
  return s
}

function decoded(text: string) {
  const r = decodeSave(text)
  if (!r.ok) throw new Error(r.detail)
  return r.state
}

describe('save de conquistas e tutorial (v3)', () => {
  it('versão atual é 3', () => expect(SAVE_VERSION).toBe(3))

  it('ida e volta preserva conquistas, fila, recompensas e tutorial', () => {
    const back = decoded(encodeSave(sample(), 1))
    expect(back.meta.achievements).toEqual(['clicks_3'])
    expect(back.meta.achievementUnlocks).toEqual({ clicks_3: { at: 5000, playTimeMs: 1234.5 } })
    expect(back.meta.achievementRewardsDelivered).toEqual(['clicks_3'])
    expect(back.meta.achievementQueue).toEqual(['clicks_3'])
    expect(back.meta.tutorial).toEqual({ completedSteps: ['click', 'buy'], dismissed: true })
  })

  it('migra a versão 2 com valores iniciais e sem pagar recompensa de novo', () => {
    const env = JSON.parse(encodeSave(sample(), 0))
    env.version = 2
    for (const k of ['achievementUnlocks', 'achievementRewardsDelivered', 'achievementQueue', 'tutorial']) delete env.state.meta[k]
    const s = decoded(JSON.stringify(env))
    expect(s.meta.achievements).toEqual(['clicks_3'])
    expect(s.meta.achievementUnlocks).toEqual({})
    expect(s.meta.achievementQueue).toEqual([])
    expect(s.meta.achievementRewardsDelivered).toEqual(['clicks_3'])
    expect(s.meta.tutorial).toEqual({ completedSteps: [], dismissed: false })
    const e = new GameEngine({ ...CATALOG, achievements: DEFS }, s, config)
    e.advance(100)
    expect(e.state.run.bytes.toNumber()).toBe(0)
  })

  it('rejeita campos inválidos informando o caminho', () => {
    const bad = (mutate: (m: Record<string, unknown>) => void) => {
      const env = JSON.parse(encodeSave(sample(), 0))
      mutate(env.state.meta)
      return decodeSave(JSON.stringify(env))
    }
    for (const [path, mutate] of [
      ['meta.achievementUnlocks.clicks_3.at', (m: Record<string, unknown>) => ((m.achievementUnlocks as Record<string, { at: unknown }>).clicks_3!.at = 'x')],
      ['meta.achievementQueue', (m: Record<string, unknown>) => (m.achievementQueue = [1])],
      ['meta.achievementRewardsDelivered', (m: Record<string, unknown>) => delete m.achievementRewardsDelivered],
      ['meta.tutorial.dismissed', (m: Record<string, unknown>) => ((m.tutorial as { dismissed: unknown }).dismissed = 'sim')],
      ['meta.tutorial', (m: Record<string, unknown>) => delete m.tutorial],
    ] as const) {
      const r = bad(mutate)
      expect(r).toMatchObject({ ok: false, reason: 'invalid' })
      if (!r.ok) expect(r.detail).toContain(path)
    }
  })

  it('ids de conquista desconhecidos carregam sem erro e não desbloqueiam nada', () => {
    const s = sample()
    s.meta.achievements = ['fantasma', 'clicks_3']
    s.meta.achievementUnlocks = { fantasma: { at: 1, playTimeMs: 1 } }
    s.meta.achievementQueue = ['fantasma']
    const e = new GameEngine({ ...CATALOG, achievements: DEFS }, decoded(encodeSave(s, 0)), config)
    expect(() => {
      e.advance(1000)
      e.click()
      e.dismissAchievementNotification()
      e.achievementList()
    }).not.toThrow()
    expect(e.state.meta.achievements).toContain('clicks_3')
  })

  it('Reboot preserva conquistas, estatísticas e tutorial', () => {
    const s = sample()
    s.stats.playTimeMs = 9000
    s.stats.clicks = 7
    const e = new GameEngine({ ...CATALOG, achievements: DEFS }, s, config)
    e.reboot()
    const m = e.state.meta
    expect(m.achievements).toContain('clicks_3')
    expect(m.achievementUnlocks.clicks_3).toEqual({ at: 5000, playTimeMs: 1234.5 })
    expect(m.achievementRewardsDelivered).toContain('clicks_3')
    expect(m.tutorial).toEqual({ completedSteps: ['click', 'buy'], dismissed: true })
    expect(e.state.stats.playTimeMs).toBeGreaterThanOrEqual(9000)
    expect(e.state.stats.clicks).toBe(7)
  })
})

describe('gravação após conquista e Novo jogo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('desbloquear conquista agenda gravação; Novo jogo zera tudo', async () => {
    const e = new GameEngine({ ...CATALOG, achievements: DEFS }, createInitialState(0), config)
    const saves = new SaveManager(new MemoryStorage())
    const persistence = createPersistence(e, saves)
    e.click()
    e.click()
    e.click()
    expect(e.state.meta.achievements).toEqual(['clicks_3'])
    await vi.advanceTimersByTimeAsync(PURCHASE_SAVE_DELAY_MS + 10)
    const loaded = await saves.load()
    if (!('ok' in loaded) || !loaded.ok) throw new Error('save ausente')
    expect(loaded.state.meta.achievements).toEqual(['clicks_3'])
    expect(loaded.state.meta.achievementQueue).toEqual(['clicks_3'])

    e.state.meta.tutorial = { completedSteps: ['click'], dismissed: true }
    await resetGame(e, persistence, 5)
    const after = await saves.load()
    if (!('ok' in after) || !after.ok) throw new Error('save ausente')
    for (const s of [e.state, after.state]) {
      expect(s.meta.achievements).toEqual([])
      expect(s.meta.achievementUnlocks).toEqual({})
      expect(s.meta.achievementQueue).toEqual([])
      expect(s.meta.tutorial).toEqual({ completedSteps: [], dismissed: false })
      expect(s.stats.playTimeMs).toBe(0)
    }
    persistence.dispose()
  })
})
