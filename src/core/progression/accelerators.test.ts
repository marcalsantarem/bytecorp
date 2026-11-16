import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../engine'
import { createInitialState, type GameState } from '../state'
import type { AcceleratorGrantTable } from './accelerators'

const MIN = 60_000

function make(config: Partial<EngineConfig> = {}, setup?: (s: GameState) => void) {
  const state = createInitialState(0)
  state.run.equipment[CATALOG.equipment[0]!.id] = 10
  setup?.(state)
  return new GameEngine(CATALOG, state, { ...DEFAULT_CONFIG, random: () => 0.99, rebootReward: () => 1, ...config })
}

function give(e: GameEngine, multiplier: number, remainingMs: number, id = `t${e.state.meta.accelerators.inventory.length}`) {
  e.state.meta.accelerators.inventory.push({ id, multiplier, remainingMs })
  return id
}

describe('aceleradores: ativação', () => {
  it('ativa o item do inventário quando não há ativo', () => {
    const e = make()
    const id = give(e, 2, 15 * MIN)
    const seen: string[] = []
    e.events.on('acceleratorActivated', (p) => seen.push(`${p.item.id}:${p.replaced}`))
    const r = e.activateAccelerator(id)
    expect(r).toMatchObject({ ok: true, replaced: 'none', previous: null })
    expect(e.state.meta.accelerators.active).toEqual({ id, multiplier: 2, remainingMs: 15 * MIN })
    expect(e.state.meta.accelerators.inventory).toEqual([])
    expect(seen).toEqual([`${id}:none`])
    expect(e.temporaryMultiplier).toBe(2)
  })

  it('item inexistente não lança nem altera nada', () => {
    const e = make()
    expect(e.activateAccelerator('x')).toEqual({ ok: false, reason: 'notFound' })
  })

  it('com ativo e sem opção pede decisão sem alterar o estado', () => {
    const e = make()
    const a = give(e, 2, 30 * MIN)
    const b = give(e, 5, 15 * MIN)
    e.activateAccelerator(a)
    const before = JSON.stringify(e.state.meta.accelerators)
    const r = e.activateAccelerator(b)
    expect(r).toMatchObject({
      ok: false,
      needsDecision: true,
      current: { id: a, multiplier: 2 },
      incoming: { id: b, multiplier: 5 },
    })
    expect(JSON.stringify(e.state.meta.accelerators)).toBe(before)
  })

  it("'discard' perde o tempo restante do anterior", () => {
    const e = make()
    const a = give(e, 2, 30 * MIN)
    const b = give(e, 5, 15 * MIN)
    e.activateAccelerator(a)
    e.advance(10 * MIN)
    const r = e.activateAccelerator(b, { replace: 'discard' })
    expect(r).toMatchObject({ ok: true, replaced: 'discard' })
    expect(e.state.meta.accelerators.active?.id).toBe(b)
    expect(e.state.meta.accelerators.inventory).toEqual([])
    expect(e.temporaryMultiplier).toBe(5)
  })

  it("'store' devolve o anterior ao inventário com o tempo restante", () => {
    const e = make()
    const a = give(e, 5, 30 * MIN)
    const b = give(e, 2, 15 * MIN)
    e.activateAccelerator(a)
    e.advance(10 * MIN)
    const stored: string[] = []
    e.events.on('acceleratorStored', (p) => stored.push(`${p.item.id}:${p.item.remainingMs}`))
    e.activateAccelerator(b, { replace: 'store' })
    expect(e.state.meta.accelerators.active?.id).toBe(b)
    expect(e.state.meta.accelerators.inventory.filter((i) => i.id === a)).toEqual([{ id: a, multiplier: 5, remainingMs: 20 * MIN }])
    expect(stored).toEqual([`${a}:${20 * MIN}`])
  })

  it('aceleradores não acumulam: só o ativo conta', () => {
    const e = make()
    e.activateAccelerator(give(e, 2, 15 * MIN))
    give(e, 5, 15 * MIN)
    expect(e.temporaryMultiplier).toBe(2)
  })

  it('itens do inventário não expiram', () => {
    const e = make({ acceleratorGrants: { stage: {}, reboot: [] } })
    give(e, 2, 15 * MIN)
    e.advance(10 * 60 * MIN)
    expect(e.state.meta.accelerators.inventory).toEqual([{ id: 't0', multiplier: 2, remainingMs: 15 * MIN }])
  })
})

describe('aceleradores: tempo', () => {
  it('conta por advance e expira com evento', () => {
    const e = make()
    const id = give(e, 2, 15 * MIN)
    e.activateAccelerator(id)
    const expired: string[] = []
    e.events.on('acceleratorExpired', (p) => expired.push(p.item.id))
    e.advance(14 * MIN)
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(MIN)
    expect(expired).toEqual([])
    e.advance(MIN)
    expect(e.state.meta.accelerators.active).toBeNull()
    expect(expired).toEqual([id])
    expect(e.temporaryMultiplier).toBe(1)
  })

  it('expira dentro de um único advance grande, uma só vez', () => {
    const e = make()
    const expired: string[] = []
    e.events.on('acceleratorExpired', (p) => expired.push(p.item.id))
    e.activateAccelerator(give(e, 5, 15 * MIN))
    e.advance(3 * 60 * MIN)
    expect(expired).toHaveLength(1)
    expect(e.state.meta.accelerators.active).toBeNull()
  })

  it('passos finos e um passo grande dão o mesmo resultado', () => {
    const a = make()
    const b = make()
    for (const e of [a, b]) {
      e.activateAccelerator(give(e, 2, 15 * MIN))
      e.grantTemporaryBonus({ id: 'x', multiplier: 3, remainingMs: 7 * MIN })
    }
    a.advance(20 * MIN)
    for (let i = 0; i < 20 * 60; i++) b.advance(1000)
    expect(a.state.meta.accelerators).toEqual(b.state.meta.accelerators)
    expect(a.state.meta.temporaryBonuses).toEqual(b.state.meta.temporaryBonuses)
    expect(a.state.stats.playTimeMs).toBe(b.state.stats.playTimeMs)
  })

  it('o passo é cortado no vencimento (revisão e evento no instante certo)', () => {
    const e = make({ maxStepMs: 60 * MIN })
    const multipliers: number[] = []
    e.events.on('acceleratorExpired', () => multipliers.push(e.temporaryMultiplier))
    e.activateAccelerator(give(e, 2, 90_500))
    e.advance(5 * MIN)
    expect(multipliers).toEqual([1])
    expect(e.state.stats.playTimeMs).toBe(5 * MIN)
  })

  it('avisa uma vez quando faltar o limiar configurável (padrão 30 s)', () => {
    const e = make()
    const warns: number[] = []
    e.events.on('acceleratorEnding', (p) => warns.push(p.remainingMs))
    e.activateAccelerator(give(e, 2, 2 * MIN))
    e.advance(MIN)
    expect(warns).toEqual([])
    e.advance(35_000)
    expect(warns).toEqual([30_000])
    e.advance(5_000)
    expect(warns).toEqual([30_000])

    const f = make({ acceleratorEndingMs: 10_000 })
    const w2: number[] = []
    f.events.on('acceleratorEnding', (p) => w2.push(p.remainingMs))
    f.activateAccelerator(give(f, 2, MIN))
    f.advance(45_000)
    expect(w2).toEqual([])
    f.advance(10_000)
    expect(w2).toEqual([10_000])
  })
})

describe('aceleradores: offline', () => {
  it('devolve o multiplicador enquanto durar e depois 1, e reduz o tempo restante', () => {
    const e = make()
    e.activateAccelerator(give(e, 5, 15 * MIN))
    const away = 60 * MIN
    const perSec = e.productionBase
    const segments = e.offlineSegments(away)
    expect(segments).toEqual([{ durationMs: 15 * MIN, multiplier: 5 }])
    expect(e.state.meta.accelerators.active).toBeNull()
    const r = e.applyOffline(away, segments)
    const expected = perSec.mul((15 * 60 * 5) + 45 * 60)
    expect(r.bytes.sub(expected).abs().div(expected).toNumber()).toBeLessThan(1e-9)
  })

  it('com tempo sobrando no acelerador, só desconta', () => {
    const e = make()
    e.activateAccelerator(give(e, 2, 60 * MIN))
    expect(e.offlineSegments(20 * MIN)).toEqual([{ durationMs: 20 * MIN, multiplier: 2 }])
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(40 * MIN)
  })

  it('o limite offline corta o fim da ausência, mas o tempo do acelerador corre inteiro', () => {
    const e = make()
    e.activateAccelerator(give(e, 2, 10 * 60 * MIN))
    const away = 9 * 60 * MIN
    const segments = e.offlineSegments(away)
    const r = e.applyOffline(away, segments)
    expect(r.creditedMs).toBe(8 * 60 * MIN)
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(MIN * 60)
  })

  it('sem acelerador nem bônus não há segmentos; ausência inválida não altera nada', () => {
    const e = make()
    expect(e.offlineSegments(60 * MIN)).toEqual([])
    e.activateAccelerator(give(e, 2, MIN))
    expect(e.offlineSegments(-5)).toEqual([])
    expect(e.offlineSegments(NaN)).toEqual([])
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(MIN)
  })

  it('combina acelerador e bônus com vencimentos diferentes (D-17)', () => {
    const e = make()
    e.activateAccelerator(give(e, 2, 10 * MIN))
    e.grantTemporaryBonus({ id: 'b', multiplier: 3, remainingMs: 4 * MIN })
    const expired: string[] = []
    e.events.on('temporaryBonusExpired', (p) => expired.push(p.bonus.id))
    e.events.on('acceleratorExpired', () => expired.push('acc'))
    expect(e.offlineSegments(30 * MIN)).toEqual([
      { durationMs: 4 * MIN, multiplier: 6 },
      { durationMs: 6 * MIN, multiplier: 2 },
    ])
    expect(expired.sort()).toEqual(['acc', 'b'])
  })
})

describe('aceleradores: concessões (D-16)', () => {
  const table: AcceleratorGrantTable = {
    stage: { garage_company: [{ multiplier: 2, durationMin: 15 }], startup_lab: [{ multiplier: 5, durationMin: 30 }] },
    reboot: [{ multiplier: 2, durationMin: 60 }],
  }

  it('concede na primeira entrada em cada estágio, exceto o inicial, e emite evento', () => {
    const e = make({ acceleratorGrants: table, baseClick: 1e30 })
    const granted: string[] = []
    e.events.on('acceleratorGranted', (p) => granted.push(p.source))
    expect(e.state.meta.accelerators.inventory).toEqual([])
    e.click()
    expect(granted.slice(0, 2)).toEqual(['stage:garage_company', 'stage:startup_lab'])
    const inv = e.state.meta.accelerators.inventory
    expect(inv.map((i) => [i.multiplier, i.remainingMs])).toEqual([
      [2, 15 * MIN],
      [5, 30 * MIN],
    ])
    expect(new Set(inv.map((i) => i.id)).size).toBe(inv.length)
  })

  it('não repete a concessão ao reentrar no estágio depois de um Reboot', () => {
    const e = make({ acceleratorGrants: table, baseClick: 1e30 })
    e.click()
    const afterFirst = e.state.meta.accelerators.inventory.length
    e.reboot()
    // reboot:1 concede 1 item; o estágio volta ao inicial
    expect(e.state.meta.accelerators.inventory).toHaveLength(afterFirst + 1)
    e.click()
    expect(e.state.meta.accelerators.inventory).toHaveLength(afterFirst + 1)
    expect(e.state.meta.accelerators.granted).toContain('stage:garage_company')
  })

  it('concede um item a cada Reboot, uma vez por número', () => {
    const e = make({ acceleratorGrants: table })
    e.reboot()
    e.reboot()
    expect(e.state.meta.accelerators.granted).toEqual(['reboot:1', 'reboot:2'])
    expect(e.state.meta.accelerators.inventory).toHaveLength(2)
    // chave já registrada não repete (ex.: save restaurado)
    e.state.stats.reboots = 0
    e.reboot()
    expect(e.state.meta.accelerators.inventory).toHaveLength(2)
  })

  it('carregar um estado não concede nada', () => {
    const state = createInitialState(0)
    state.run.bytesEarned = D(1e30)
    const e = new GameEngine(CATALOG, state, { ...DEFAULT_CONFIG, acceleratorGrants: table })
    expect(e.state.meta.accelerators.inventory).toEqual([])
  })

  it('o catálogo provisório só usa 2x/5x e 15/30/60 min', () => {
    const all = [DEFAULT_CONFIG.acceleratorGrants.reboot, ...Object.values(DEFAULT_CONFIG.acceleratorGrants.stage)].flat()
    for (const g of all) {
      expect([2, 5]).toContain(g.multiplier)
      expect([15, 30, 60]).toContain(g.durationMin)
    }
  })
})

describe('Reboot preserva aceleradores e bônus (GDD 9.3, 13.3)', () => {
  it('mantém ativo, inventário e bônus, com o temporizador correndo', () => {
    const e = make({ acceleratorGrants: { stage: {}, reboot: [] } })
    const a = give(e, 5, 30 * MIN)
    const spare = give(e, 2, 15 * MIN)
    e.activateAccelerator(a)
    e.grantTemporaryBonus({ id: 'ach', multiplier: 1.5, remainingMs: 60 * MIN })
    e.advance(10 * MIN)
    const r = e.reboot()
    expect(r.ok).toBe(true)
    expect(e.state.meta.accelerators.active).toEqual({ id: a, multiplier: 5, remainingMs: 20 * MIN })
    expect(e.state.meta.accelerators.inventory).toEqual([{ id: spare, multiplier: 2, remainingMs: 15 * MIN }])
    expect(e.state.meta.temporaryBonuses).toEqual([{ id: 'ach', multiplier: 1.5, remainingMs: 50 * MIN }])
    e.advance(MIN)
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(19 * MIN)
  })
})
