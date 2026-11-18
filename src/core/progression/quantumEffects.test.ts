import { describe, expect, it } from 'vitest'
import { BASE_CATALOG as CATALOG } from '../catalog'
import type { Catalog, Effect, QuantumNodeDef } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'

const node = (id: string, effect: Effect): QuantumNodeDef => ({
  id,
  path: 'alpha',
  nameKey: 'stage.solo_hacker',
  descriptionKey: 'stage.solo_hacker',
  icon: 'cpu',
  baseCost: 1,
  costGrowth: 1.0001,
  effectPerLevel: effect,
  prerequisites: [],
  maxLevel: null,
  position: { x: 0, y: 0 },
})

const catalog: Catalog = {
  ...CATALOG,
  quantumNodes: [
    node('prod', { kind: 'globalProductionPercent', value: 50 }),
    node('cflat', { kind: 'clickFlat', value: 2 }),
    node('cpct', { kind: 'clickPercent', value: 100 }),
    node('disc', { kind: 'costDiscountPercent', value: 30 }),
    node('crit', { kind: 'criticalChancePercent', value: 10 }),
    node('critx', { kind: 'criticalMultiplier', value: 3 }),
    node('off', { kind: 'offlineCapHours', value: 4 }),
  ],
}

const make = (random = () => 0.99) => {
  const state = createInitialState(0)
  state.meta.quantumCores = D(100)
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random })
}

describe('efeitos quânticos na economia', () => {
  it('sem árvore, nada muda e o limite offline é 8 h', () => {
    const e = make()
    expect(e.clickValue.toNumber()).toBe(1)
    expect(e.costDiscount.effective.toNumber()).toBe(0)
    expect(e.offlineCapMs).toBe(8 * 3_600_000)
  })

  it('produção global entra na camada quântica, multiplicativa com a camada 1', () => {
    const e = make()
    e.state.run.equipment[CATALOG.equipment[0]!.id] = 10
    const base = e.production.total
    e.buyQuantumNode('prod')
    e.buyQuantumNode('prod') // +100%
    expect(e.production.layers.quantum.toNumber()).toBe(100)
    expect(e.production.total.toNumber()).toBeCloseTo(base.toNumber() * 2)
  })

  it('clique fixo e percentual', () => {
    const e = make()
    e.buyQuantumNode('cflat') // (1+2) = 3
    expect(e.clickValue.toNumber()).toBe(3)
    e.buyQuantumNode('cpct') // x2
    expect(e.clickValue.toNumber()).toBe(6)
    e.buyQuantumNode('prod') // x1.5
    expect(e.clickValue.toNumber()).toBe(9)
  })

  it('desconto respeita o teto da D-13', () => {
    const e = make()
    e.buyQuantumNode('disc')
    expect(e.costDiscount.effective.toNumber()).toBe(30)
    e.buyQuantumNode('disc')
    expect(e.costDiscount.raw.toNumber()).toBe(60)
    expect(e.costDiscount.effective.toNumber()).toBe(50)
    expect(e.costDiscount.capped).toBe(true)
  })

  it('chance de crítico respeita o teto e o multiplicador soma', () => {
    const e = make()
    e.buyQuantumNode('crit') // 0.05 + 0.10
    expect(e.criticalChanceInfo.effective).toBeCloseTo(0.15)
    for (let i = 0; i < 5; i++) e.buyQuantumNode('crit')
    expect(e.criticalChanceInfo.raw).toBeCloseTo(0.65)
    expect(e.criticalChanceInfo.effective).toBe(0.25)
    e.buyQuantumNode('critx') // 5 + 3
    const crit = make(() => 0)
    crit.buyQuantumNode('critx')
    expect(crit.click().toNumber()).toBe(8)
  })

  it('limite offline soma as horas da árvore', () => {
    const e = make()
    e.buyQuantumNode('off')
    e.buyQuantumNode('off')
    expect(e.offlineCapMs).toBe(16 * 3_600_000)
  })

  it('reset da árvore remove os efeitos e o Reboot os preserva', () => {
    const e = make()
    e.buyQuantumNode('cflat')
    e.state.run.bytesEarned = D(1e9)
    expect(e.reboot().ok).toBe(true)
    expect(e.clickValue.toNumber()).toBe(3)
    expect(e.resetQuantumTree().ok).toBe(true)
    expect(e.clickValue.toNumber()).toBe(1)
  })
})
