import { describe, expect, it } from 'vitest'
import type { Catalog, EquipmentDef } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { bulkCost, maxAffordable, purchasableQuantity, unitCost } from './cost'
import { equipmentStatus } from './requirements'

const eq = (id: string, over: Partial<EquipmentDef> = {}): EquipmentDef => ({
  id,
  category: 'networking',
  nameKey: 'equipment.home_router.name',
  descriptionKey: 'equipment.home_router.desc',
  icon: 'router',
  baseCost: 10,
  costGrowth: 1.15,
  baseProduction: 1,
  unlock: { kind: 'always' },
  reveal: { kind: 'always' },
  ...over,
})

const catalog: Catalog = {
  stages: [
    { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
    // Inalcançável aqui: os testes deste arquivo definem o estágio à mão.
    {
      id: 'garage_company',
      order: 1,
      nameKey: 'stage.garage_company',
      requirement: { kind: 'bytesEarnedInRun', amount: 1e300 },
    },
  ],
  equipment: [
    eq('a'),
    eq('b', {
      baseCost: 100,
      unlock: { kind: 'bytesEarnedInRun', amount: 1000 },
      reveal: { kind: 'bytesEarnedInRun', amount: 100 },
    }),
    eq('c', {
      unlock: { kind: 'equipmentOwned', equipment: 'a', count: 2 },
      reveal: { kind: 'stageReached', stage: 'garage_company' },
    }),
  ],
  agents: [],
  upgrades: [],
  quantumNodes: [],
}

function engine(bytes: number, earned = bytes) {
  const state = createInitialState(0)
  state.run.bytes = D(bytes)
  state.run.bytesEarned = D(earned)
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
}

describe('custo', () => {
  it('cresce com N e é inteiro', () => {
    const costs = [0, 1, 2, 10, 50].map((n) => unitCost(10, 1.15, n).toNumber())
    expect(costs).toEqual([...costs].sort((x, y) => x - y))
    expect(costs[0]).toBe(10)
    expect(costs[1]).toBe(11)
    costs.forEach((c) => expect(Number.isInteger(c)).toBe(true))
  })

  it('aplica o desconto por unidade e nunca fica abaixo de 1', () => {
    expect(unitCost(10, 1.15, 0, 50).toNumber()).toBe(5)
    expect(unitCost(10, 1.15, 0, 150).toNumber()).toBe(1)
    expect(unitCost(10, 1.15, 5, 100).toNumber()).toBe(1)
    expect(bulkCost(10, 1.15, 0, 3, 150).toNumber()).toBe(3)
  })

  it('D-1: custo unitário é inteiro exato (n=102 e 103, descontos 0/10/50/99)', () => {
    for (const d of [0, 10, 50, 99]) {
      for (const n of [102, 103]) {
        const c = unitCost(15, 1.15, n, d)
        const x = c.toNumber()
        expect(Number.isInteger(x), `n=${n} d=${d} (${x})`).toBe(true)
        expect(c.eq(Math.floor(x)), `n=${n} d=${d} eq`).toBe(true)
      }
    }
    expect(unitCost(15, 1.15, 102).toNumber()).toBe(23295443)
    expect(unitCost(15, 1.15, 103).toNumber()).toBe(26789759)
  })

  it('MAX nunca gasta mais que o saldo e mais uma unidade não caberia', () => {
    for (const discount of [0, 30, 150]) {
      // Com desconto de 150% cada unidade custa 1: saldos grandes iriam até o limite do MAX.
      for (const balance of discount > 100 ? [0, 9, 57, 1234] : [0, 9, 10, 57, 1234, 987654, 1e12]) {
        for (const owned of [0, 7, 40]) {
          const q = maxAffordable(10, 1.15, owned, D(balance), discount)
          expect(bulkCost(10, 1.15, owned, q, discount).lte(balance)).toBe(true)
          expect(bulkCost(10, 1.15, owned, q + 1, discount).gt(balance)).toBe(true)
        }
      }
    }
  })

  it('x10 recusa (quantidade 0) sem saldo para as dez', () => {
    const ten = bulkCost(10, 1.15, 0, 10)
    expect(purchasableQuantity('x10', 10, 1.15, 0, ten.sub(1))).toBe(0)
    expect(purchasableQuantity('x10', 10, 1.15, 0, ten)).toBe(10)
  })
})

describe('estado de desbloqueio', () => {
  it('muda com bytesEarnedInRun', () => {
    const b = catalog.equipment[1]!
    const at = (earned: number) => equipmentStatus(b, engine(0, earned).state, catalog)
    expect(at(0)).toBe('hidden')
    expect(at(100)).toBe('revealed')
    expect(at(1000)).toBe('unlocked')
  })

  it('avalia equipmentOwned e stageReached', () => {
    const c = catalog.equipment[2]!
    const e = engine(0)
    expect(equipmentStatus(c, e.state, catalog)).toBe('hidden')
    e.state.run.stage = 'garage_company'
    expect(equipmentStatus(c, e.state, catalog)).toBe('revealed')
    e.state.run.equipment.a = 2
    expect(equipmentStatus(c, e.state, catalog)).toBe('unlocked')
  })
})

describe('GameEngine: compra de equipamentos', () => {
  it('compra x1, debita, atualiza produção e emite purchase', () => {
    const e = engine(100)
    const events: unknown[] = []
    e.events.on('purchase', (p) => events.push(p))
    expect(e.production.total.toNumber()).toBe(0)
    expect(e.buyEquipment('a', 'x1')).toBe(1)
    expect(e.state.run.bytes.toNumber()).toBe(90)
    expect(e.state.run.equipment.a).toBe(1)
    expect(e.production.total.toNumber()).toBe(1)
    expect(events).toEqual([{ id: 'a', quantity: 1, cost: D(10) }])
  })

  it('x10 não compra sem saldo para todas', () => {
    const e = engine(100)
    expect(e.buyEquipment('a', 'x10')).toBe(0)
    expect(e.state.run.bytes.toNumber()).toBe(100)
    expect(e.state.run.equipment.a).toBeUndefined()
  })

  it('MAX compra o máximo sem reserva de saldo', () => {
    const e = engine(100)
    const q = e.buyEquipment('a', 'max')
    expect(q).toBeGreaterThan(1)
    expect(e.state.run.bytes.gte(0)).toBe(true)
    expect(e.state.run.bytes.lt(unitCost(10, 1.15, q))).toBe(true)
  })

  it('não compra equipamento bloqueado ou inexistente', () => {
    const e = engine(1e6, 0)
    expect(e.buyEquipment('b', 'x1')).toBe(0)
    expect(e.buyEquipment('c', 'x1')).toBe(0)
    expect(e.buyEquipment('zzz', 'x1')).toBe(0)
    expect(e.state.run.bytes.toNumber()).toBe(1e6)
  })

  it('equipmentList segue a ordem do catálogo e informa modos e produção', () => {
    const e = engine(100)
    const list = e.equipmentList()
    expect(list.map((i) => i.id)).toEqual(['a', 'b', 'c'])
    const a = list[0]!
    expect(a.status).toBe('unlocked')
    expect(a.nextCost.toNumber()).toBe(10)
    expect(a.unitProduction.toNumber()).toBe(1)
    expect(a.modes.x1.quantity).toBe(1)
    expect(a.modes.x10.quantity).toBe(0)
    expect(a.modes.x10.cost.toNumber()).toBe(bulkCost(10, 1.15, 0, 10).toNumber())
    expect(a.modes.max.quantity).toBeGreaterThan(1)
    expect(list[1]!.modes.max.quantity).toBe(0)
    expect(e.equipmentInfo('nada')).toBeUndefined()
  })
})
