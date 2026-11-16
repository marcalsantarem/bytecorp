import { describe, expect, it } from 'vitest'
import { CATALOG, validateCatalog } from './index'
import type { Effect } from './types'

const nodes = CATALOG.quantumNodes
const cost = (base: number, growth: number, level: number) => Math.max(1, Math.floor(base * growth ** level))
const finiteTotal = (kind: Effect['kind']) =>
  nodes.filter((n) => n.effectPerLevel.kind === kind && n.maxLevel !== null).reduce((s, n) => s + n.effectPerLevel.value * n.maxLevel!, 0)

describe('catálogo da árvore Quantum (T-039)', () => {
  it('é válido e tem 3 caminhos com raiz sem pré-requisito', () => {
    expect(validateCatalog(CATALOG)).toEqual([])
    expect(nodes.length).toBeGreaterThanOrEqual(12)
    for (const path of ['alpha', 'beta', 'gamma'] as const) {
      expect(nodes.filter((n) => n.path === path && n.prerequisites.length === 0)).toHaveLength(1)
    }
  })

  it('respeita os tetos da D-13 somando todos os níveis', () => {
    expect(finiteTotal('costDiscountPercent')).toBeLessThanOrEqual(50)
    expect(5 + finiteTotal('criticalChancePercent')).toBeLessThanOrEqual(25)
  })

  it('posições são únicas e raízes ficam perto do centro', () => {
    expect(new Set(nodes.map((n) => `${n.position.x},${n.position.y}`)).size).toBe(nodes.length)
    for (const n of nodes.filter((n) => n.prerequisites.length === 0)) {
      expect(Math.abs(n.position.x) + Math.abs(n.position.y)).toBeLessThanOrEqual(2)
    }
  })

  it('o primeiro Reboot (3 cores) compra nós iniciais, mas não a árvore', () => {
    const roots = nodes.filter((n) => n.prerequisites.length === 0)
    expect(roots.every((n) => cost(n.baseCost, n.costGrowth, 0) <= 3)).toBe(true)
    const total = nodes.filter((n) => n.maxLevel !== null).reduce((s, n) => s + Array.from({ length: n.maxLevel! }, (_, l) => cost(n.baseCost, n.costGrowth, l)).reduce((a, b) => a + b, 0), 0)
    expect(total).toBeGreaterThan(130)
  })
})
