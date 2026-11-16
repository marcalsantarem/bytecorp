import { describe, expect, it } from 'vitest'
import { CATALOG, validateCatalog } from '../catalog'
import type { Catalog, QuantumNodeDef } from '../catalog/types'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { D } from '../decimal'
import { createInitialState } from '../state'

const node = (over: Partial<QuantumNodeDef> & { id: string }): QuantumNodeDef => ({
  path: 'alpha',
  nameKey: 'stage.solo_hacker',
  descriptionKey: 'stage.solo_hacker',
  icon: 'cpu',
  baseCost: 2,
  costGrowth: 2,
  effectPerLevel: { kind: 'globalProductionPercent', value: 10 },
  prerequisites: [],
  maxLevel: 3,
  position: { x: 0, y: 0 },
  ...over,
})

const TEST_CATALOG: Catalog = {
  ...CATALOG,
  quantumNodes: [
    node({ id: 'a' }),
    node({ id: 'b', prerequisites: ['a'], baseCost: 3, effectPerLevel: { kind: 'costDiscountPercent', value: 2 }, maxLevel: null }),
    node({ id: 'c', path: 'beta', maxLevel: 1, effectPerLevel: { kind: 'globalProductionPercent', value: 5 } }),
  ],
}

function engine(cores: number) {
  const state = createInitialState(0)
  state.meta.quantumCores = D(cores)
  return new GameEngine(TEST_CATALOG, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
}

describe('árvore Quantum', () => {
  it('compra um nível por vez, desconta cores e emite evento', () => {
    const e = engine(10)
    const seen: unknown[] = []
    e.events.on('quantumNodePurchased', (p) => seen.push(p))
    expect(e.buyQuantumNode('a')).toEqual({ ok: true, level: 1, cost: 2 })
    expect(e.buyQuantumNode('a')).toEqual({ ok: true, level: 2, cost: 4 })
    expect(e.state.meta.quantumNodes).toEqual({ a: 2 })
    expect(e.state.meta.quantumCores.toNumber()).toBe(4)
    expect(seen).toEqual([
      { id: 'a', level: 1, cost: 2 },
      { id: 'a', level: 2, cost: 4 },
    ])
  })

  it('invalida a produção ao comprar', () => {
    const e = engine(10)
    const rev = e.revision
    e.buyQuantumNode('a')
    expect(e.revision).toBeGreaterThan(rev)
  })

  it('exige pré-requisito com ao menos um nível', () => {
    const e = engine(50)
    expect(e.buyQuantumNode('b')).toEqual({ ok: false, reason: 'locked' })
    expect(e.quantumNodeInfo('b')?.status).toBe('locked')
    e.buyQuantumNode('a')
    expect(e.quantumNodeInfo('b')?.status).toBe('available')
    expect(e.buyQuantumNode('b')).toMatchObject({ ok: true, level: 1, cost: 3 })
  })

  it('respeita o nível máximo; maxLevel null não tem limite', () => {
    const e = engine(1000)
    expect(e.buyQuantumNode('c').ok).toBe(true)
    expect(e.buyQuantumNode('c')).toEqual({ ok: false, reason: 'maxed' })
    expect(e.quantumNodeInfo('c')?.status).toBe('maxed')
    e.buyQuantumNode('a')
    for (let i = 0; i < 8; i++) expect(e.buyQuantumNode('b').ok).toBe(true)
    expect(e.state.meta.quantumNodes.b).toBe(8)
  })

  it('recusa sem saldo e não altera nada; id inexistente também', () => {
    const e = engine(1)
    const events: unknown[] = []
    e.events.on('quantumNodePurchased', (p) => events.push(p))
    expect(e.buyQuantumNode('a')).toEqual({ ok: false, reason: 'insufficient' })
    expect(e.buyQuantumNode('zzz')).toEqual({ ok: false, reason: 'unknown' })
    expect(e.state.meta.quantumCores.toNumber()).toBe(1)
    expect(e.state.meta.quantumNodes).toEqual({})
    expect(events).toEqual([])
  })

  it('custo exponencial arredondado para baixo, mínimo 1', () => {
    const cat: Catalog = { ...CATALOG, quantumNodes: [node({ id: 'x', baseCost: 1, costGrowth: 1.5, maxLevel: null })] }
    const state = createInitialState(0)
    state.meta.quantumCores = D(100)
    const e = new GameEngine(cat, state)
    const costs = Array.from({ length: 5 }, () => (e.buyQuantumNode('x') as { cost: number }).cost)
    expect(costs).toEqual([1, 1, 2, 3, 5])
  })

  it('quantumEffects agrega por tipo (valor x nível)', () => {
    const e = engine(100)
    expect(e.quantumEffects).toEqual({})
    e.buyQuantumNode('a')
    e.buyQuantumNode('a')
    e.buyQuantumNode('b')
    e.buyQuantumNode('c')
    expect(e.quantumEffects).toEqual({ globalProductionPercent: 25, costDiscountPercent: 2 })
  })

  it('reset devolve os cores gastos, zera níveis e cobra custo crescente', () => {
    const e = engine(20)
    e.buyQuantumNode('a') // 2
    e.buyQuantumNode('a') // 4
    e.buyQuantumNode('c') // 2
    expect(e.state.meta.quantumCores.toNumber()).toBe(12)
    expect(e.quantumCoresSpent).toBe(8)
    expect(e.quantumTreeResetCost).toBe(3)
    const seen: unknown[] = []
    e.events.on('quantumTreeReset', (p) => seen.push(p))
    expect(e.resetQuantumTree()).toEqual({ ok: true, refunded: 8, cost: 3, resetNumber: 1 })
    expect(e.state.meta.quantumNodes).toEqual({})
    expect(e.state.meta.quantumCores.toNumber()).toBe(17)
    expect(e.state.meta.treeResets).toBe(1)
    expect(e.quantumEffects).toEqual({})
    expect(seen).toEqual([{ refunded: 8, cost: 3, resetNumber: 1 }])
    expect(e.quantumTreeResetCost).toBe(6)
    expect(e.resetQuantumTree()).toMatchObject({ ok: true, cost: 6, refunded: 0, resetNumber: 2 })
    expect(e.state.meta.quantumCores.toNumber()).toBe(11)
    expect(e.quantumTreeResetCost).toBe(9)
  })

  it('reset aceita se a devolução cobre o custo (gastou tudo)', () => {
    const e = engine(6)
    e.buyQuantumNode('a') // 2
    e.buyQuantumNode('a') // 4 -> saldo 0, gasto 6
    expect(e.state.meta.quantumCores.toNumber()).toBe(0)
    expect(e.resetQuantumTree()).toEqual({ ok: true, refunded: 6, cost: 3, resetNumber: 1 })
    expect(e.state.meta.quantumCores.toNumber()).toBe(3)
  })

  it('reset recusa se saldo + devolução < custo e não altera o estado', () => {
    const e = engine(2)
    e.buyQuantumNode('a') // gasta 2, saldo 0; 0 + 2 < 3
    const before = e.state.meta.quantumCores.toNumber()
    const nodes = { ...e.state.meta.quantumNodes }
    let fired = false
    e.events.on('quantumTreeReset', () => (fired = true))
    expect(before).toBeLessThan(3)
    expect(e.resetQuantumTree()).toEqual({ ok: false, reason: 'insufficient' })
    expect(e.state.meta.quantumCores.toNumber()).toBe(before)
    expect(e.state.meta.quantumNodes).toEqual(nodes)
    expect(e.state.meta.treeResets).toBe(0)
    expect(fired).toBe(false)
  })

  it('o custo do reset é configurável', () => {
    const state = createInitialState(0)
    state.meta.quantumCores = D(10)
    const e = new GameEngine(TEST_CATALOG, state, { ...DEFAULT_CONFIG, treeResetCost: (n) => 1 + n * n })
    expect(e.resetQuantumTree()).toMatchObject({ ok: true, cost: 1 })
    expect(e.quantumTreeResetCost).toBe(2)
  })

  it('o Reboot preserva a árvore e os resets', () => {
    const e = engine(10)
    e.buyQuantumNode('a')
    e.state.run.bytesEarned = D(1e6)
    e.state.meta.treeResets = 2
    expect(e.reboot().ok).toBe(true)
    expect(e.state.meta.quantumNodes).toEqual({ a: 1 })
    expect(e.state.meta.treeResets).toBe(2)
  })
})

describe('validateCatalog (nós Quantum)', () => {
  const check = (nodes: QuantumNodeDef[]) => validateCatalog({ ...CATALOG, quantumNodes: nodes })

  it('aceita o catálogo de teste', () => {
    expect(validateCatalog(TEST_CATALOG)).toEqual([])
  })

  it('detecta pré-requisito inexistente, próprio e ciclo', () => {
    expect(check([node({ id: 'a', prerequisites: ['nope'] })]).join()).toContain('inexistente')
    expect(check([node({ id: 'a', prerequisites: ['a'] })]).join()).toContain('si mesmo')
    expect(check([node({ id: 'a', prerequisites: ['b'] }), node({ id: 'b', prerequisites: ['a'] })]).join()).toContain('ciclo')
  })

  it('detecta nível máximo, efeito, posição, custo e chave inválidos', () => {
    expect(check([node({ id: 'a', maxLevel: 0 })]).join()).toContain('nível máximo')
    expect(check([node({ id: 'a', maxLevel: 1.5 })]).join()).toContain('nível máximo')
    expect(check([node({ id: 'a', effectPerLevel: { kind: 'clickFlat', value: NaN } })]).join()).toContain('efeito')
    expect(check([node({ id: 'a', position: { x: NaN, y: 0 } })]).join()).toContain('posição')
    expect(check([node({ id: 'a', baseCost: 0 })]).join()).toContain('custo base')
    expect(check([node({ id: 'a', costGrowth: 1 })]).join()).toContain('fator')
    expect(check([node({ id: 'a', nameKey: 'nao.existe' as never })]).join()).toContain('i18n')
    expect(check([node({ id: 'a' }), node({ id: 'a' })]).join()).toContain('duplicado')
  })
})
