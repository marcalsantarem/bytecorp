import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'

const MIN = 60_000

function make() {
  const state = createInitialState(0)
  state.run.equipment[CATALOG.equipment[0]!.id] = 10
  return new GameEngine(CATALOG, state, { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 1 })
}

function accel(e: GameEngine, multiplier: number, remainingMs: number) {
  const id = `a${e.state.meta.accelerators.inventory.length}`
  e.state.meta.accelerators.inventory.push({ id, multiplier, remainingMs })
  e.activateAccelerator(id, { replace: 'discard' })
}

describe('temporários na produção e no clique (T-067)', () => {
  it('2x e 5x multiplicam produção e clique, sem acumular entre aceleradores', () => {
    const e = make()
    const p = e.production.total.toNumber()
    const c = e.clickValue.toNumber()
    accel(e, 2, 10 * MIN)
    expect(e.production.total.toNumber()).toBeCloseTo(p * 2, 9)
    expect(e.clickValue.toNumber()).toBeCloseTo(c * 2, 9)
    accel(e, 5, 10 * MIN)
    expect(e.production.total.toNumber()).toBeCloseTo(p * 5, 9)
    expect(e.clickValue.toNumber()).toBeCloseTo(c * 5, 9)
    expect(e.productionBase.toNumber()).toBeCloseTo(p, 9)
  })

  it('crítico incide sobre o clique já acelerado', () => {
    const e = make()
    const c = e.clickValue.toNumber()
    accel(e, 5, 10 * MIN)
    const before = e.state.run.bytes
    const gained = e.click()
    expect(gained.toNumber()).toBeCloseTo(c * 5, 9)
    expect(e.state.run.bytes.sub(before).toNumber()).toBeCloseTo(c * 5, 9)
  })

  it('acelerador e bônus se multiplicam', () => {
    const e = make()
    const p = e.production.total.toNumber()
    accel(e, 2, 10 * MIN)
    e.grantTemporaryBonus({ id: 'b', multiplier: 1.5, remainingMs: 10 * MIN })
    expect(e.production.total.toNumber()).toBeCloseTo(p * 3, 9)
  })

  it('expira no meio de um advance e o resultado não depende do fatiamento', () => {
    const run = (chunks: number[]) => {
      const e = make()
      accel(e, 5, 30_000)
      for (const c of chunks) e.advance(c)
      return e
    }
    const p = make().production.total.toNumber()
    const a = run([60_000])
    const b = run(Array(600).fill(100))
    const expected = p * (30 * 5 + 30)
    expect(a.state.run.bytes.toNumber()).toBeCloseTo(expected, 6)
    expect(b.state.run.bytes.toNumber()).toBeCloseTo(expected, 6)
    expect(a.production.total.toNumber()).toBeCloseTo(p, 9)
  })

  it('offline: 5x de 30 min com 1 h fora credita 30x5 + 30x1 e não dobra', () => {
    const e = make()
    const p = e.production.total.toNumber()
    accel(e, 5, 30 * MIN)
    const segs = e.offlineSegments(60 * MIN)
    const r = e.applyOffline(60 * MIN, segs)
    expect(r.bytes.toNumber()).toBeCloseTo(p * 60 * (30 * 5 + 30), 6)
    expect(e.state.meta.accelerators.active).toBeNull()
    expect(e.production.total.toNumber()).toBeCloseTo(p, 9)
  })

  it('offline com acelerador que sobra: usa a base, não a produção acelerada', () => {
    const e = make()
    const p = e.production.total.toNumber()
    accel(e, 2, 60 * MIN)
    const segs = e.offlineSegments(30 * MIN)
    const r = e.applyOffline(30 * MIN, segs)
    expect(r.bytes.toNumber()).toBeCloseTo(p * 30 * 60 * 2, 6)
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(30 * MIN)
  })
})
