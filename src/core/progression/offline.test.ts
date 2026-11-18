import { describe, expect, it } from 'vitest'
import { BASE_CATALOG as CATALOG } from '../catalog'
import type { Catalog, QuantumNodeDef } from '../catalog/types'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'
import { computeOffline } from './offline'

const H = 3_600_000

describe('computeOffline', () => {
  it('sem segmentos: produção x tempo', () => {
    const r = computeOffline(D(10), 60_000, 8 * H)
    expect(r.bytes.toNumber()).toBe(600)
    expect(r).toMatchObject({ awayMs: 60_000, creditedMs: 60_000, cappedMs: 0 })
    expect(r.segments).toEqual([{ durationMs: 60_000, multiplier: 1 }])
  })

  it('acima do limite credita só o limite', () => {
    const r = computeOffline(D(1), 10 * H, 8 * H)
    expect(r.bytes.toNumber()).toBe(8 * 3600)
    expect(r.cappedMs).toBe(2 * H)
    expect(computeOffline(D(1), 10 * H, 16 * H).bytes.toNumber()).toBe(10 * 3600)
  })

  it('segmentos com multiplicadores diferentes e resto a 1x', () => {
    const r = computeOffline(D(2), 100_000, 8 * H, [
      { durationMs: 10_000, multiplier: 3 },
      { durationMs: 20_000, multiplier: 2 },
    ])
    // 2*3*10 + 2*2*20 + 2*1*70
    expect(r.bytes.toNumber()).toBe(60 + 80 + 140)
    expect(r.segments).toHaveLength(3)
  })

  it('o limite corta os segmentos no fim', () => {
    const r = computeOffline(D(1), 100_000, 15_000, [{ durationMs: 10_000, multiplier: 2 }])
    expect(r.bytes.toNumber()).toBe(20 + 5)
    expect(r.cappedMs).toBe(85_000)
  })

  it('tempo zero, negativo, NaN ou limite inválido rende 0', () => {
    for (const t of [0, -5, NaN, -Infinity]) {
      const r = computeOffline(D(5), t, H)
      expect(r.bytes.toNumber()).toBe(0)
      expect(r.awayMs).toBe(0)
    }
    expect(computeOffline(D(5), H, NaN).bytes.toNumber()).toBe(0)
  })

  it('Decimal grande', () => {
    const r = computeOffline(D('1e300'), 8 * H, 8 * H)
    expect(r.bytes.eq(D('1e300').mul(28800))).toBe(true)
  })
})

const offNode: QuantumNodeDef = {
  id: 'off',
  path: 'alpha',
  nameKey: 'stage.solo_hacker',
  descriptionKey: 'stage.solo_hacker',
  icon: 'cpu',
  baseCost: 1,
  costGrowth: 1.0001,
  effectPerLevel: { kind: 'offlineCapHours', value: 4 },
  prerequisites: [],
  maxLevel: null,
  position: { x: 0, y: 0 },
}

function engineWithProduction() {
  const state = createInitialState(0)
  state.meta.quantumCores = D(10)
  state.run.equipment[CATALOG.equipment[0]!.id] = 10
  const catalog: Catalog = { ...CATALOG, quantumNodes: [offNode] }
  return new GameEngine(catalog, state, { ...DEFAULT_CONFIG })
}

describe('GameEngine.applyOffline', () => {
  it('credita bytes, estatísticas e emite offlineApplied', () => {
    const e = engineWithProduction()
    const seen: unknown[] = []
    e.events.on('offlineApplied', (r) => seen.push(r))
    const rev = e.revision
    const perSec = e.production.total
    const r = e.applyOffline(1000)
    expect(r.bytes.eq(perSec)).toBe(true)
    expect(e.state.run.bytes.eq(perSec)).toBe(true)
    expect(e.state.run.bytesEarned.eq(perSec)).toBe(true)
    expect(e.state.stats.bytesEarnedAllTime.eq(perSec)).toBe(true)
    expect(seen).toEqual([r])
    expect(e.revision).toBeGreaterThan(rev)
  })

  it('respeita o limite da árvore Quantum', () => {
    const e = engineWithProduction()
    expect(e.applyOffline(20 * H).creditedMs).toBe(8 * H)
    e.buyQuantumNode('off')
    expect(e.applyOffline(20 * H).creditedMs).toBe(12 * H)
  })

  it('é idêntico a avançar o mesmo tempo com produção constante', () => {
    const a = engineWithProduction()
    const b = engineWithProduction()
    a.applyOffline(2 * H)
    b.advance(2 * H)
    expect(a.state.run.bytes.sub(b.state.run.bytes).abs().div(b.state.run.bytes).toNumber()).toBeLessThan(1e-9)
  })

  it('avisa a mudança de estágio por evento', () => {
    const e = engineWithProduction()
    const changes: string[] = []
    e.events.on('stageChanged', (c) => changes.push(c.to))
    e.applyOffline(8 * H)
    e.state.run.equipment[CATALOG.equipment[0]!.id] = 200
    e.invalidate()
    e.applyOffline(8 * H)
    expect(changes.length).toBeGreaterThan(0)
    expect(e.state.run.stage).toBe(changes[changes.length - 1])
  })

  it('tempo inválido não altera nada', () => {
    const e = engineWithProduction()
    expect(e.applyOffline(-1).bytes.toNumber()).toBe(0)
    expect(e.state.run.bytes.toNumber()).toBe(0)
  })
})
