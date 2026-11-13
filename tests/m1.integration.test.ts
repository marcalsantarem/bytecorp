import { describe, expect, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import { D } from '../src/core/decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../src/core/engine'
import { bulkCost, maxAffordable, unitCost } from '../src/core/economy'
import { SAVE_VERSION, encodeSave } from '../src/core/save/codec'
import { SaveManager, type LoadResult } from '../src/core/save/saveManager'
import { MemoryStorage, SAVE_KEY } from '../src/core/save/storage'
import { createInitialState } from '../src/core/state'
import { createPersistence } from '../src/app/purchaseSave'

function newEngine(config: Partial<EngineConfig> = {}) {
  return new GameEngine(CATALOG, createInitialState(0), { ...DEFAULT_CONFIG, random: () => 0.99, ...config })
}

function fund(engine: GameEngine, bytes: number, earned = bytes) {
  engine.state.run.bytes = D(bytes)
  engine.state.run.bytesEarned = D(earned)
}

const isOk = (r: LoadResult) => 'ok' in r && r.ok

describe('catálogo real: custos', () => {
  it('tem 35 equipamentos', () => expect(CATALOG.equipment).toHaveLength(35))

  for (const discount of [0, 10, 50, 99, 100]) {
    it(`custo unitário inteiro e >= 1 para N de 0 a 200 (desconto ${discount}%)`, () => {
      for (const e of CATALOG.equipment) {
        for (let n = 0; n <= 200; n++) {
          const c = unitCost(e.baseCost, e.costGrowth, n, discount)
          expect(c.gte(1), `${e.id} n=${n}`).toBe(true)
          // Igualdade exata (D-1): o Decimal deve reconstruir exatamente o inteiro.
          const x = c.toNumber()
          expect(Number.isInteger(x), `${e.id} n=${n} inteiro (${x})`).toBe(true)
          // Acima do inteiro seguro (ver cost.ts) só vale Number.isInteger.
          if (x <= Number.MAX_SAFE_INTEGER) expect(c.eq(D(Math.floor(x))), `${e.id} n=${n} eq`).toBe(true)
        }
      }
    })
  }
})

describe('catálogo real: MAX', () => {
  const balances = [0, 1, 14, 15, 99, 1_000, 123_456, 5e7, 3e12]
  for (const discount of [0, 25]) {
    it(`nunca gasta mais que o saldo e q+1 não caberia (desconto ${discount}%)`, () => {
      for (const e of CATALOG.equipment) {
        for (const owned of [0, 7, 60]) {
          for (const b of balances) {
            const balance = D(b)
            const q = maxAffordable(e.baseCost, e.costGrowth, owned, balance, discount)
            expect(bulkCost(e.baseCost, e.costGrowth, owned, q, discount).lte(balance), `${e.id} ${owned} ${b}`).toBe(true)
            expect(bulkCost(e.baseCost, e.costGrowth, owned, q + 1, discount).gt(balance), `${e.id} ${owned} ${b} +1`).toBe(true)
          }
        }
      }
    })
  }

  it('compra MAX pelo motor sem saldo negativo e com o custo exato', () => {
    for (const e of CATALOG.equipment) {
      const engine = newEngine()
      fund(engine, 987_654, 1e12) // tudo desbloqueado
      const before = engine.state.run.bytes
      const q = engine.buyEquipment(e.id, 'max')
      const spent = before.sub(engine.state.run.bytes)
      expect(engine.state.run.bytes.gte(0), e.id).toBe(true)
      expect(spent.eq(bulkCost(e.baseCost, e.costGrowth, 0, q)), e.id).toBe(true)
      expect(engine.state.run.equipment[e.id] ?? 0).toBe(q)
    }
  })
})

describe('catálogo real: ocultar, revelar, desbloquear', () => {
  for (const e of CATALOG.equipment) {
    it(`${e.id}: só compra ao atingir o requisito`, () => {
      const engine = newEngine()
      fund(engine, 1e19, 0) // saldo enorme, nada gerado na execução
      const req = e.unlock
      if (req.kind === 'always') {
        expect(engine.equipmentInfo(e.id)!.status).toBe('unlocked')
        expect(engine.buyEquipment(e.id, 'x1')).toBe(1)
        return
      }
      expect(req.kind).toBe('bytesEarnedInRun')
      if (req.kind !== 'bytesEarnedInRun') return
      expect(engine.equipmentInfo(e.id)!.status).not.toBe('unlocked')
      expect(engine.buyEquipment(e.id, 'x1')).toBe(0)
      expect(engine.buyEquipment(e.id, 'max')).toBe(0)
      expect(engine.equipmentInfo(e.id)!.modes.max.quantity).toBe(0)
      if (e.reveal.kind === 'bytesEarnedInRun') {
        engine.state.run.bytesEarned = D(e.reveal.amount)
        expect(engine.equipmentInfo(e.id)!.status).toBe('revealed')
        expect(engine.buyEquipment(e.id, 'x1')).toBe(0)
      }
      engine.state.run.bytesEarned = D(req.amount * 0.999999) // -1 some em 1e18+ (precisão de double)
      expect(engine.buyEquipment(e.id, 'x1')).toBe(0)
      engine.state.run.bytesEarned = D(req.amount)
      expect(engine.equipmentInfo(e.id)!.status).toBe('unlocked')
      expect(engine.buyEquipment(e.id, 'x1')).toBe(1)
    })
  }

  it('id inexistente não compra', () => expect(newEngine().buyEquipment('nope', 'x1')).toBe(0))
})

describe('crítico com aleatoriedade fixa', () => {
  it('ganho, estatísticas e evento', () => {
    const engine = newEngine({ random: () => 0 })
    const events: { gained: number; critical: boolean }[] = []
    engine.events.on('click', (e) => events.push({ gained: e.gained.toNumber(), critical: e.critical }))
    const base = engine.clickValue.toNumber()
    const g = engine.click()
    const expected = base * DEFAULT_CONFIG.criticalMultiplier
    expect(g.toNumber()).toBe(expected)
    expect(events).toEqual([{ gained: expected, critical: true }])
    const s = engine.state.stats
    expect([s.clicks, s.criticalClicks]).toEqual([1, 1])
    expect(s.bytesFromClicks.toNumber()).toBe(expected)
    expect(engine.state.run.bytes.toNumber()).toBe(expected)
    expect(engine.state.run.bytesEarned.toNumber()).toBe(expected)
    expect(s.bytesEarnedAllTime.toNumber()).toBe(expected)
  })

  it('sem crítico quando o sorteio está no limite', () => {
    const engine = newEngine({ random: () => DEFAULT_CONFIG.criticalChance })
    const g = engine.click()
    expect(g.toNumber()).toBe(engine.clickValue.toNumber())
    expect(engine.state.stats.criticalClicks).toBe(0)
    expect(engine.state.stats.clicks).toBe(1)
  })
})

describe('independência de fatiamento (com compras no meio)', () => {
  function run(slices: number[]) {
    const engine = newEngine()
    fund(engine, 200, 200)
    engine.buyEquipment('home_router', 'x10')
    // Compras em marcos fixos de tempo de jogo, independentes do fatiamento.
    const events: [number, () => void][] = [
      [5_000, () => engine.buyEquipment('home_router', 'max')],
      [20_000, () => engine.buyEquipment('home_server', 'x1')],
      [45_000, () => engine.buyEquipment('wifi_mesh', 'max')],
    ]
    const total = 90_000
    let t = 0
    let ei = 0
    let i = 0
    while (t < total) {
      let dt = Math.min(slices[i++ % slices.length]!, total - t)
      const next = events[ei]
      if (next && t + dt > next[0]) dt = next[0] - t
      if (dt > 0) engine.advance(dt)
      t += dt
      if (next && t >= next[0]) {
        next[1]()
        ei++
      }
    }
    return engine
  }

  it('dá o mesmo resultado', () => {
    const a = run([90_000])
    const b = run([1000 / 60])
    const c = run([7, 33, 16, 250, 1, 2000, 41])
    for (const x of [b, c]) {
      expect(x.state.run.bytes.toNumber()).toBeCloseTo(a.state.run.bytes.toNumber(), 3)
      expect(x.state.run.bytesEarned.toNumber()).toBeCloseTo(a.state.run.bytesEarned.toNumber(), 3)
      expect(x.state.run.equipment).toEqual(a.state.run.equipment)
      expect(x.state.stats.playTimeMs).toBeCloseTo(90_000, 3)
    }
  })
})

describe('ciclo jogo, compra, gravação, carregamento', () => {
  it('o estado e a produção voltam iguais', async () => {
    const engine = newEngine({ random: () => 0 })
    for (let i = 0; i < 40; i++) engine.click()
    engine.advance(12_345)
    engine.state.run.bytes = engine.state.run.bytes.add(5_000)
    engine.state.run.bytesEarned = engine.state.run.bytesEarned.add(5_000)
    engine.buyEquipment('home_router', 'x10')
    engine.buyEquipment('home_server', 'x1')
    engine.advance(3_000)

    const saves = new SaveManager(new MemoryStorage(), () => 777)
    await saves.save(engine)
    const loaded = await saves.load()
    if (!('ok' in loaded) || !loaded.ok) throw new Error('save não carregou')
    expect(loaded.savedAt).toBe(777)

    const fresh = newEngine()
    fresh.replaceState(loaded.state)
    expect(encodeSave(fresh.state, 1)).toBe(encodeSave(engine.state, 1))
    expect(fresh.production.total.toString()).toBe(engine.production.total.toString())
    const view = (g: GameEngine) => g.equipmentList().map((i) => [i.id, i.status, i.owned, i.nextCost.toString()])
    expect(view(fresh)).toEqual(view(engine))
    engine.advance(10_000)
    fresh.advance(10_000)
    expect(fresh.state.run.bytes.toString()).toBe(engine.state.run.bytes.toString())
  })

  it('a gravação após compra persiste o estado', async () => {
    const engine = newEngine()
    fund(engine, 1000)
    const storage = new MemoryStorage()
    const persistence = createPersistence(engine, new SaveManager(storage), 5)
    engine.buyEquipment('home_router', 'x10')
    await new Promise((r) => setTimeout(r, 50))
    persistence.dispose()
    const text = await storage.get(SAVE_KEY)
    expect(text).not.toBeNull()
    expect(JSON.parse(text!).state.run.equipment).toEqual({ home_router: 10 })
  })
})

describe('saves inválidos', () => {
  async function loadFrom(text: string) {
    const storage = new MemoryStorage()
    await storage.set(SAVE_KEY, text)
    return new SaveManager(storage).load()
  }

  it('vazio', async () => expect(await new SaveManager(new MemoryStorage()).load()).toEqual({ kind: 'empty' }))

  it('corrompido é rejeitado sem lançar', async () => {
    for (const text of ['{nao json', '', 'null', '[]', '{"version":1}', '{"version":"x","savedAt":0,"state":{}}']) {
      expect(isOk(await loadFrom(text)), text).toBe(false)
    }
  })

  it('estado com campos errados é rejeitado', async () => {
    const a = JSON.parse(encodeSave(createInitialState(0), 1))
    a.state.run.bytes = 'abc'
    expect(isOk(await loadFrom(JSON.stringify(a)))).toBe(false)
    const b = JSON.parse(encodeSave(createInitialState(0), 1))
    b.state.run.equipment = { home_router: -3 }
    expect(isOk(await loadFrom(JSON.stringify(b)))).toBe(false)
  })

  it('versão futura é rejeitada', async () => {
    const env = JSON.parse(encodeSave(createInitialState(0), 1))
    env.version = SAVE_VERSION + 1
    expect(await loadFrom(JSON.stringify(env))).toMatchObject({ ok: false, reason: 'unsupportedVersion' })
  })
})
