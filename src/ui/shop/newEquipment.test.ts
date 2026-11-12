import { describe, expect, it } from 'vitest'
import { categoriesWithNewEquipment } from './newEquipment'

const info = (status: string, owned: number, quantity: number) => ({ status, owned, modes: { x1: { quantity } } })
const defs = [{ category: 'networking' as const }, { category: 'networking' as const }, { category: 'storage' as const }]

describe('categoriesWithNewEquipment', () => {
  it('sem saldo nenhum ponto', () => {
    const r = categoriesWithNewEquipment(defs, [info('unlocked', 0, 0), info('unlocked', 0, 0), info('revealed', 0, 0)])
    expect(r.size).toBe(0)
  })
  it('item novo comprável marca', () => {
    const r = categoriesWithNewEquipment(defs, [info('unlocked', 0, 1), info('hidden', 0, 0), info('hidden', 0, 0)])
    expect([...r]).toEqual(['networking'])
  })
  it('item já comprado não marca mesmo com saldo', () => {
    expect(categoriesWithNewEquipment(defs, [info('unlocked', 2, 5), info('hidden', 0, 0), info('hidden', 0, 0)]).size).toBe(0)
  })
  it('item novo sem saldo não marca', () => {
    expect(categoriesWithNewEquipment(defs, [info('unlocked', 0, 0), info('hidden', 0, 0), info('hidden', 0, 0)]).size).toBe(0)
  })
  it('item revealed não marca', () => {
    expect(categoriesWithNewEquipment(defs, [info('hidden', 0, 0), info('hidden', 0, 0), info('revealed', 0, 3)]).size).toBe(0)
  })
  it('categoria com item antigo e outro novo comprável marca', () => {
    const r = categoriesWithNewEquipment(defs, [info('unlocked', 3, 4), info('unlocked', 0, 1), info('hidden', 0, 0)])
    expect([...r]).toEqual(['networking'])
  })
  it('categoria só com itens comprados não marca', () => {
    expect(categoriesWithNewEquipment(defs, [info('unlocked', 1, 2), info('unlocked', 4, 2), info('unlocked', 1, 2)]).size).toBe(0)
  })
})
