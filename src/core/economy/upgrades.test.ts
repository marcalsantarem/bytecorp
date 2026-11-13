import { describe, expect, it } from 'vitest'
import type { Catalog, UpgradeDef } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { activeUpgradeEffects } from './upgrades'

const up = (id: string, cost: number, unlock: number, over: Partial<UpgradeDef> = {}): UpgradeDef => ({
  id,
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  icon: 'zap',
  cost,
  effect: { kind: 'globalProductionPercent', value: 10 },
  unlockBytesEarnedInRun: unlock,
  ...over,
})

const catalog: Catalog = {
  stages: [{ id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } }],
  equipment: [],
  agents: [],
  upgrades: [
    up('big', 500, 1000, { effect: { kind: 'clickFlat', value: 2 } }),
    up('cheap', 50, 100),
    up('mid', 200, 100, { effect: { kind: 'costDiscountPercent', value: 5 } }),
  ],
  quantumNodes: [],
}

function engine(bytes: number, earned = bytes) {
  const state = createInitialState(0)
  state.run.bytes = D(bytes)
  state.run.bytesEarned = D(earned)
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
}

describe('melhorias comuns', () => {
  it('bloqueada não compra, mesmo com saldo', () => {
    const e = engine(5000, 10)
    expect(e.upgradeInfo('cheap')?.status).toBe('locked')
    expect(e.buyUpgrade('cheap')).toBe(false)
    expect(e.state.run.bytes.toNumber()).toBe(5000)
  })

  it('libera pelo total gerado e gastar Bytes não bloqueia de novo', () => {
    const e = engine(0, 0)
    expect(e.upgradeInfo('cheap')?.status).toBe('locked')
    e.state.run.bytesEarned = D(100)
    e.state.run.bytes = D(60)
    expect(e.upgradeInfo('cheap')?.status).toBe('available')
    e.buyUpgrade('cheap')
    e.state.run.bytes = D(0)
    expect(e.upgradeInfo('mid')?.status).toBe('available')
  })

  it('compra debita o custo exato, marca como comprada, emite evento e não repete', () => {
    const e = engine(300, 300)
    const seen: unknown[] = []
    e.events.on('upgradePurchased', (p) => seen.push(p))
    const rev = e.revision
    expect(e.buyUpgrade('cheap')).toBe(true)
    expect(e.state.run.bytes.toNumber()).toBe(250)
    expect(e.state.run.upgrades).toEqual(['cheap'])
    expect(e.upgradeInfo('cheap')?.status).toBe('purchased')
    expect(e.revision).toBeGreaterThan(rev)
    expect(seen).toEqual([{ id: 'cheap', cost: 50 }])
    expect(e.buyUpgrade('cheap')).toBe(false)
    expect(e.state.run.bytes.toNumber()).toBe(250)
    expect(e.upgradeList().some((u) => u.id === 'cheap')).toBe(true)
  })

  it('sem saldo não compra; id inexistente também não', () => {
    const e = engine(49, 300)
    expect(e.buyUpgrade('cheap')).toBe(false)
    expect(e.buyUpgrade('nope')).toBe(false)
    expect(e.state.run.upgrades).toEqual([])
  })

  it('desconto de custo não altera o preço da melhoria', () => {
    const e = engine(1000, 1000)
    expect(e.buyUpgrade('mid')).toBe(true)
    expect(e.upgradeInfo('cheap')?.cost).toBe(50)
    const before = e.state.run.bytes.toNumber()
    e.buyUpgrade('cheap')
    expect(before - e.state.run.bytes.toNumber()).toBe(50)
  })

  it('lista ordenada por custo, com estado e requisito', () => {
    const l = engine(0, 150).upgradeList()
    expect(l.map((u) => u.id)).toEqual(['cheap', 'mid', 'big'])
    expect(l.map((u) => u.status)).toEqual(['available', 'available', 'locked'])
    expect(l[2]?.unlockBytesEarnedInRun).toBe(1000)
  })

  it('várias liberam no mesmo instante', () => {
    const e = engine(0, 99)
    e.state.run.bytesEarned = D(100)
    expect(e.upgradeList().filter((u) => u.status === 'available').map((u) => u.id)).toEqual(['cheap', 'mid'])
  })

  it('efeitos ativos refletem só as compradas', () => {
    const e = engine(1000, 1000)
    expect(activeUpgradeEffects(e.state, catalog)).toEqual([])
    e.buyUpgrade('mid')
    expect(activeUpgradeEffects(e.state, catalog)).toEqual([{ kind: 'costDiscountPercent', value: 5 }])
  })
})
