import { describe, expect, it } from 'vitest'
import { CATALOG } from './catalog'
import { startClock } from './clock'
import { GameEngine } from './engine'
import { createInitialState } from './state'

function engineWith(equipment: Record<string, number>) {
  const state = createInitialState(0)
  state.run.equipment = equipment
  return new GameEngine(CATALOG, state)
}

describe('GameEngine', () => {
  it('produz pela soma da produção base dos equipamentos', () => {
    const engine = engineWith({ home_router: 2, home_server: 1 })
    expect(engine.production.total.toNumber()).toBe(5)
    engine.advance(10_000)
    expect(engine.state.run.bytes.toNumber()).toBeCloseTo(50, 9)
  })

  it('dá o mesmo resultado independentemente de como o tempo é fatiado', () => {
    const oneCall = engineWith({ home_router: 3, external_drive: 2 })
    const manyCalls = engineWith({ home_router: 3, external_drive: 2 })
    const irregular = engineWith({ home_router: 3, external_drive: 2 })

    oneCall.advance(60_000)
    for (let i = 0; i < 3600; i++) manyCalls.advance(1000 / 60) // 60 FPS
    const frames = [7, 33, 16, 250, 1, 2000, 41]
    let elapsed = 0
    for (let i = 0; elapsed < 60_000; i++) {
      const dt = Math.min(frames[i % frames.length]!, 60_000 - elapsed)
      irregular.advance(dt)
      elapsed += dt
    }

    const expected = oneCall.state.run.bytes.toNumber()
    expect(expected).toBeCloseTo(3 * 0.5 * 60 + 2 * 32 * 60, 6)
    expect(manyCalls.state.run.bytes.toNumber()).toBeCloseTo(expected, 6)
    expect(irregular.state.run.bytes.toNumber()).toBeCloseTo(expected, 6)
    expect(manyCalls.state.stats.playTimeMs).toBeCloseTo(60_000, 6)
  })

  it('separa o que foi gasto do total gerado na execução', () => {
    const engine = engineWith({ home_router: 2 })
    engine.advance(10_000)
    engine.state.run.bytes = engine.state.run.bytes.sub(4)
    expect(engine.state.run.bytes.toNumber()).toBeCloseTo(6, 9)
    expect(engine.state.run.bytesEarned.toNumber()).toBeCloseTo(10, 9)
  })

  it('credita cliques e registra a origem nas estatísticas', () => {
    const engine = engineWith({})
    const clicks: boolean[] = []
    engine.events.on('click', ({ critical }) => clicks.push(critical))
    engine.click()
    engine.click()
    expect(engine.state.run.bytes.toNumber()).toBe(2)
    expect(engine.state.stats.clicks).toBe(2)
    expect(engine.state.stats.bytesFromClicks.toNumber()).toBe(2)
    expect(engine.state.stats.bytesFromProduction.toNumber()).toBe(0)
    expect(clicks).toEqual([false, false])
  })

  it('recalcula a produção depois de invalidate', () => {
    const engine = engineWith({ home_router: 1 })
    expect(engine.production.total.toNumber()).toBe(0.5)
    engine.state.run.equipment.home_router = 4
    expect(engine.production.total.toNumber()).toBe(0.5)
    engine.invalidate()
    expect(engine.production.total.toNumber()).toBe(2)
  })

  it('ignora deltas nulos ou negativos', () => {
    const engine = engineWith({ home_router: 1 })
    const revision = engine.revision
    engine.advance(0)
    engine.advance(-500)
    engine.advance(Number.NaN)
    expect(engine.state.run.bytes.toNumber()).toBe(0)
    expect(engine.revision).toBe(revision)
  })
})

describe('startClock', () => {
  it('avança o núcleo pelo tempo de relógio, não pelo número de disparos', () => {
    const engine = engineWith({ home_server: 1 })
    let now = 0
    let fire: () => void = () => {}
    const stop = startClock(engine, {
      now: () => now,
      setInterval: (fn) => ((fire = fn), 1),
      clearInterval: () => {},
    })
    now = 2500 // um único disparo atrasado, como em aba em segundo plano
    fire()
    expect(engine.state.run.bytes.toNumber()).toBeCloseTo(10, 9)
    stop()
  })
})
