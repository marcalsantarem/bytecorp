import { describe, expect, it } from 'vitest'
import type { AchievementDef, AchievementRequirement } from '../catalog/achievements'
import { CATALOG } from '../catalog'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../engine'
import { createInitialState, type GameState } from '../state'
import { requirementProgress, validateAchievements, type AchievementContext } from './achievements'
import { isMessageKey } from '../../i18n'

const K = 'stage.solo_hacker' as AchievementDef['nameKey']
const MIN = 60_000

function def(id: string, requirement: AchievementRequirement, extra: Partial<AchievementDef> = {}): AchievementDef {
  return {
    id,
    category: 'production',
    rarity: 'bronze',
    requirement,
    nameKey: K,
    descriptionKey: K,
    reward: { kind: 'bytes', amount: 10 },
    ...extra,
  }
}

// Catálogo mínimo de teste (o real é da T-078).
const DEFS: AchievementDef[] = [
  def('bytes_100', { kind: 'bytesEarnedAllTime', amount: 100 }, { reward: { kind: 'bytes', amount: 50 } }),
  def('clicks_3', { kind: 'clicks', amount: 3 }, { category: 'clicks', reward: { kind: 'temporaryBonus', multiplier: 2, minutes: 15 } }),
  def('reboot_1', { kind: 'reboots', amount: 1 }, { category: 'reboots', rarity: 'silver', reward: { kind: 'quantumCores', amount: 2 } }),
  def('secret_time', { kind: 'playTimeMs', amount: 5000 }, { category: 'milestones', secret: true, hintKey: K }),
  def('router_2', { kind: 'equipmentOwned', equipment: 'home_router', amount: 2 }, { category: 'equipment' }),
]

function make(config: Partial<EngineConfig> = {}, defs: AchievementDef[] = DEFS, state: GameState = createInitialState(0)) {
  return new GameEngine({ ...CATALOG, achievements: defs }, state, { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 1, ...config })
}

describe('requisitos', () => {
  function ctxOf(state: GameState): AchievementContext {
    return { state, catalog: CATALOG, bytesPerSecond: () => D(7), rebootRewardNow: () => 4 }
  }
  const cur = (req: AchievementRequirement, state: GameState) => requirementProgress(req, ctxOf(state)).current.toNumber()
  const tgt = (req: AchievementRequirement, state: GameState) => requirementProgress(req, ctxOf(state)).target.toNumber()

  it('lê o progresso de cada tipo a partir do estado', () => {
    const s = createInitialState(0)
    s.stats.bytesEarnedAllTime = D(500)
    s.run.bytesEarned = D(200)
    s.stats.clicks = 9
    s.stats.criticalClicks = 2
    s.run.equipment = { home_router: 3, home_server: 1 }
    s.run.agents = { echo_ai: { count: 2, level: 4 }, kai_ver_3: { count: 1, level: 7 }, ghost: { count: 0, level: 9 } }
    s.stats.reboots = 5
    s.meta.quantumCores = D(3)
    s.meta.quantumNodes = { alpha_core: 2, beta_input: 1 }
    s.meta.treeResets = 2
    s.stats.playTimeMs = 1234
    s.run.stage = 'startup_lab'

    expect(cur({ kind: 'bytesEarnedAllTime', amount: 1 }, s)).toBe(500)
    expect(cur({ kind: 'bytesEarnedInRun', amount: 1 }, s)).toBe(200)
    expect(cur({ kind: 'bytesPerSecond', amount: 1 }, s)).toBe(7)
    expect(cur({ kind: 'clicks', amount: 1 }, s)).toBe(9)
    expect(cur({ kind: 'criticalClicks', amount: 1 }, s)).toBe(2)
    expect(cur({ kind: 'equipmentTotal', amount: 1 }, s)).toBe(4)
    expect(cur({ kind: 'equipmentOwned', equipment: 'home_router', amount: 1 }, s)).toBe(3)
    expect(cur({ kind: 'agentsTotal', amount: 1 }, s)).toBe(3)
    expect(cur({ kind: 'agentsDistinct', amount: 1 }, s)).toBe(2)
    expect(cur({ kind: 'agentLevel', amount: 1 }, s)).toBe(7)
    expect(cur({ kind: 'agentLevel', agent: 'echo_ai', amount: 1 }, s)).toBe(4)
    expect(cur({ kind: 'agentLevel', agent: 'ghost', amount: 1 }, s)).toBe(0)
    expect(cur({ kind: 'reboots', amount: 1 }, s)).toBe(5)
    expect(cur({ kind: 'coresInRun', amount: 1 }, s)).toBe(4)
    expect(cur({ kind: 'quantumCoresTotal', amount: 1 }, s)).toBeGreaterThanOrEqual(3)
    expect(cur({ kind: 'quantumNodeLevels', amount: 1 }, s)).toBe(3)
    expect(cur({ kind: 'quantumNode', node: 'alpha_core', amount: 1 }, s)).toBe(2)
    expect(cur({ kind: 'treeResets', amount: 1 }, s)).toBe(2)
    expect(cur({ kind: 'playTimeMs', amount: 1 }, s)).toBe(1234)
    expect(cur({ kind: 'stageReached', stage: 'startup_lab' }, s)).toBe(3)
    expect(tgt({ kind: 'stageReached', stage: 'startup_lab' }, s)).toBe(3)
    expect(tgt({ kind: 'stageReached', stage: 'data_center' }, s)).toBe(4)
  })

  it('quantumCoresTotal soma os cores gastos na árvore', () => {
    const s = createInitialState(0)
    s.meta.quantumNodes = { alpha_core: 1 }
    expect(cur({ kind: 'quantumCoresTotal', amount: 1 }, s)).toBe(1)
  })
})

describe('desbloqueio', () => {
  it('desbloqueia por Bytes, entrega a recompensa uma vez e emite o evento', () => {
    const e = make()
    const seen: string[] = []
    e.events.on('achievementUnlocked', (p) => seen.push(p.id))
    e.state.stats.bytesEarnedAllTime = D(100)
    e.advance(1000)
    expect(e.state.meta.achievements).toEqual(['bytes_100'])
    expect(e.state.run.bytes.toNumber()).toBe(50)
    e.advance(1000)
    e.click()
    expect(seen).toEqual(['bytes_100'])
    expect(e.state.run.bytes.toNumber()).toBeGreaterThanOrEqual(50)
    expect(e.state.meta.achievementRewardsDelivered).toEqual(['bytes_100'])
    expect(e.state.meta.achievementUnlocks?.bytes_100?.playTimeMs).toBe(1000)
  })

  it('cliques e bônus temporário de 15 min (evento e multiplicador)', () => {
    const e = make()
    const bonuses: string[] = []
    e.events.on('temporaryBonusGranted', (p) => bonuses.push(p.bonus.id))
    e.click()
    e.click()
    expect(e.state.meta.achievements).not.toContain('clicks_3')
    e.click()
    expect(e.state.meta.achievements).toContain('clicks_3')
    expect(bonuses).toEqual(['achievement:clicks_3'])
    expect(e.state.meta.temporaryBonuses).toEqual([{ id: 'achievement:clicks_3', multiplier: 2, remainingMs: 15 * MIN }])
    expect(e.temporaryMultiplier).toBe(2)
  })

  it('bônus de conquistas diferentes se multiplicam', () => {
    const e = make({}, [
      def('a', { kind: 'clicks', amount: 1 }, { reward: { kind: 'temporaryBonus', multiplier: 2, minutes: 30 } }),
      def('b', { kind: 'clicks', amount: 1 }, { reward: { kind: 'temporaryBonus', multiplier: 3, minutes: 60 } }),
    ])
    e.click()
    expect(e.temporaryMultiplier).toBe(6)
  })

  it('compra de equipamento dispara a avaliação', () => {
    const e = make()
    e.state.run.bytes = D(1e6)
    e.buyEquipment('home_router', 'x1')
    expect(e.state.meta.achievements).not.toContain('router_2')
    e.buyEquipment('home_router', 'x1')
    expect(e.state.meta.achievements).toContain('router_2')
  })

  it('uma recompensa que atinge outra conquista encadeia', () => {
    const e = make({}, [
      def('first', { kind: 'clicks', amount: 1 }, { reward: { kind: 'quantumCores', amount: 3 } }),
      def('chain', { kind: 'quantumCoresTotal', amount: 3 }),
    ])
    e.click()
    expect(e.state.meta.achievements).toEqual(['first', 'chain'])
  })

  it('é idempotente: reavaliar e recarregar o estado não repete a recompensa', () => {
    const e = make()
    e.state.stats.bytesEarnedAllTime = D(100)
    e.advance(1000)
    const bytes = e.state.run.bytes.toNumber()
    const rewards = [...e.state.meta.achievementRewardsDelivered!]
    e.replaceState(e.state)
    e.advance(1)
    e.click()
    expect(e.state.meta.achievements.filter((id) => id === 'bytes_100')).toHaveLength(1)
    expect(e.state.meta.achievementRewardsDelivered).toEqual(rewards)
    expect(e.state.run.bytes.toNumber()).toBeGreaterThanOrEqual(bytes)
    expect(e.state.run.bytes.toNumber()).toBeLessThan(bytes + 10)
  })

  it('estado sem os campos novos é normalizado ao carregar', () => {
    const s = createInitialState(0)
    const legacy = s.meta as Partial<typeof s.meta>
    delete legacy.achievementUnlocks
    delete legacy.achievementRewardsDelivered
    delete legacy.achievementQueue
    const e = make({}, DEFS, s)
    expect(e.state.meta.achievementQueue).toBeUndefined()
    e.click()
    e.click()
    e.click()
    expect(e.state.meta.achievementQueue).toEqual(['clicks_3'])
  })
})

describe('Reboot e fila', () => {
  it('conquistas, recompensas e bônus sobrevivem ao Reboot; o Reboot desbloqueia e paga cores', () => {
    const e = make()
    e.click()
    e.click()
    e.click()
    e.state.run.bytesEarned = D(1e9)
    expect(e.reboot()).toMatchObject({ ok: true })
    expect(e.state.meta.achievements).toEqual(expect.arrayContaining(['clicks_3', 'reboot_1']))
    expect(e.state.meta.quantumCores.toNumber()).toBe(1 + 2)
    expect(e.state.meta.temporaryBonuses.map((b) => b.id)).toContain('achievement:clicks_3')
    expect(e.state.meta.achievementRewardsDelivered).toEqual(expect.arrayContaining(['clicks_3', 'reboot_1']))
    e.advance(1000)
    expect(e.state.meta.achievements.filter((id) => id === 'clicks_3')).toHaveLength(1)
  })

  it('fila: uma notificação por vez até ser fechada', () => {
    const e = make({}, [def('x', { kind: 'clicks', amount: 1 }), def('y', { kind: 'clicks', amount: 1 })])
    expect(e.achievementNotification).toBeNull()
    e.click()
    expect(e.achievementNotification).toBe('x')
    expect(e.dismissAchievementNotification()).toBe('x')
    expect(e.achievementNotification).toBe('y')
    expect(e.dismissAchievementNotification()).toBe('y')
    expect(e.dismissAchievementNotification()).toBeNull()
    expect(e.state.meta.achievements).toEqual(['x', 'y'])
  })
})

describe('API e secretas', () => {
  it('lista com progresso e recompensa; secreta bloqueada só dá a pista', () => {
    const e = make()
    e.advance(2000)
    const list = e.achievementList()
    expect(list.map((i) => i.id)).toEqual(DEFS.map((d) => d.id))
    const clicks = list.find((i) => i.id === 'clicks_3')!
    expect(clicks.progress?.current.toNumber()).toBe(0)
    expect(clicks.progress?.target.toNumber()).toBe(3)
    expect(clicks.reward).toEqual({ kind: 'temporaryBonus', multiplier: 2, minutes: 15 })
    const secret = list.find((i) => i.id === 'secret_time')!
    expect(secret).toMatchObject({ secret: true, unlocked: false, nameKey: null, descriptionKey: null, progress: null, reward: null, hintKey: K })
  })

  it('secreta desbloqueada revela textos, progresso cheio e recompensa', () => {
    const e = make()
    e.advance(5000)
    const secret = e.achievementInfo('secret_time')!
    expect(secret.unlocked).toBe(true)
    expect(secret.nameKey).toBe(K)
    expect(secret.progress?.current.toNumber()).toBe(5000)
    expect(secret.reward).not.toBeNull()
    expect(secret.unlockedAt?.playTimeMs).toBe(5000)
  })
})

describe('independência de quadros', () => {
  it('mesmo tempo total em passos de 7 ms ou de 1 s dá as mesmas conquistas e o mesmo saldo', () => {
    const run = (stepMs: number) => {
      const e = make({}, [
        def('t', { kind: 'playTimeMs', amount: 5000 }, { reward: { kind: 'bytes', amount: 100 } }),
        def('p', { kind: 'bytesEarnedAllTime', amount: 3 }),
      ])
      e.state.run.equipment = { home_router: 1 }
      e.invalidate()
      const total = 10_000
      for (let t = 0; t < total; t += stepMs) e.advance(Math.min(stepMs, total - t))
      return { ids: [...e.state.meta.achievements].sort(), earned: e.state.stats.bytesEarnedAllTime.toNumber(), play: e.state.stats.playTimeMs }
    }
    const a = run(7)
    const b = run(1000)
    expect(a.ids).toEqual(['p', 't'])
    expect(b.ids).toEqual(a.ids)
    expect(b.play).toBe(a.play)
    expect(a.earned).toBeCloseTo(b.earned, 6)
  })
})

describe('validateAchievements', () => {
  it('aceita o catálogo de teste e acusa defeitos', () => {
    expect(validateAchievements(DEFS, CATALOG, isMessageKey)).toEqual([])
    const bad = [
      def('d', { kind: 'clicks', amount: 0 }),
      def('d', { kind: 'equipmentOwned', equipment: 'nope', amount: 1 }),
      def('s', { kind: 'clicks', amount: 1 }, { secret: true }),
    ]
    expect(validateAchievements(bad, CATALOG, isMessageKey).length).toBeGreaterThanOrEqual(4)
  })
})
