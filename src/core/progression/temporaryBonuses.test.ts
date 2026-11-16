import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog'
import { DEFAULT_CONFIG, GameEngine } from '../engine'
import { createInitialState } from '../state'

const MIN = 60_000

function make() {
  return new GameEngine(CATALOG, createInitialState(0), { ...DEFAULT_CONFIG, rebootReward: () => 1 })
}

describe('bônus temporários', () => {
  it('concede, emite evento e entra no multiplicador (produto)', () => {
    const e = make()
    const seen: string[] = []
    e.events.on('temporaryBonusGranted', (p) => seen.push(`${p.bonus.id}:${p.refreshed}`))
    expect(e.temporaryMultiplier).toBe(1)
    expect(e.grantTemporaryBonus({ id: 'a', multiplier: 2, remainingMs: MIN })).toMatchObject({ ok: true, refreshed: false })
    e.grantTemporaryBonus({ id: 'b', multiplier: 3, remainingMs: MIN })
    expect(e.temporaryMultiplier).toBe(6)
    expect(seen).toEqual(['a:false', 'b:false'])
  })

  it('mesmo id renova em vez de acumular', () => {
    const e = make()
    e.grantTemporaryBonus({ id: 'a', multiplier: 2, remainingMs: MIN })
    const r = e.grantTemporaryBonus({ id: 'a', multiplier: 4, remainingMs: 5 * MIN })
    expect(r).toMatchObject({ ok: true, refreshed: true })
    expect(e.state.meta.temporaryBonuses).toEqual([{ id: 'a', multiplier: 4, remainingMs: 5 * MIN }])
  })

  it('recusa dados inválidos sem lançar', () => {
    const e = make()
    for (const bad of [
      { id: '', multiplier: 2, remainingMs: 1 },
      { id: 'a', multiplier: 0, remainingMs: 1 },
      { id: 'a', multiplier: NaN, remainingMs: 1 },
      { id: 'a', multiplier: 2, remainingMs: 0 },
      { id: 'a', multiplier: 2, remainingMs: Infinity },
    ]) {
      expect(e.grantTemporaryBonus(bad)).toEqual({ ok: false, reason: 'invalid' })
    }
    expect(e.state.meta.temporaryBonuses).toEqual([])
  })

  it('expira por tempo decorrido, com evento, também dentro de um advance grande', () => {
    const e = make()
    const expired: string[] = []
    e.events.on('temporaryBonusExpired', (p) => expired.push(p.bonus.id))
    e.grantTemporaryBonus({ id: 'a', multiplier: 2, remainingMs: 3 * MIN })
    e.grantTemporaryBonus({ id: 'b', multiplier: 3, remainingMs: 10 * MIN })
    e.advance(2 * MIN)
    expect(expired).toEqual([])
    e.advance(MIN)
    expect(expired).toEqual(['a'])
    expect(e.temporaryMultiplier).toBe(3)
    e.advance(60 * MIN)
    expect(expired).toEqual(['a', 'b'])
    expect(e.temporaryMultiplier).toBe(1)
  })

  it('passos finos e um grande são equivalentes', () => {
    const a = make()
    const b = make()
    for (const e of [a, b]) e.grantTemporaryBonus({ id: 'x', multiplier: 2, remainingMs: 90_500 })
    a.advance(2 * MIN)
    for (let i = 0; i < 120; i++) b.advance(1000)
    expect(a.state.meta.temporaryBonuses).toEqual(b.state.meta.temporaryBonuses)
  })

  it('sobrevive ao Reboot com o tempo correndo', () => {
    const e = make()
    e.grantTemporaryBonus({ id: 'ach', multiplier: 2, remainingMs: 30 * MIN })
    e.advance(5 * MIN)
    expect(e.reboot().ok).toBe(true)
    expect(e.state.meta.temporaryBonuses).toEqual([{ id: 'ach', multiplier: 2, remainingMs: 25 * MIN }])
  })

  it('não altera a produção nem o clique (T-067 ainda não aplicou)', () => {
    const e = make()
    e.state.run.equipment[CATALOG.equipment[0]!.id] = 5
    e.invalidate()
    const prod = e.production.total
    const click = e.clickValue
    e.grantTemporaryBonus({ id: 'a', multiplier: 10, remainingMs: MIN })
    expect(e.production.total.eq(prod)).toBe(true)
    expect(e.clickValue.eq(click)).toBe(true)
  })
})
