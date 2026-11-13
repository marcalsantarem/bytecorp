import { describe, expect, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import type { Catalog } from '../src/core/catalog/types'
import { D, type Decimal } from '../src/core/decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../src/core/engine'
import { bulkCost, maxAffordable, unitCost } from '../src/core/economy'
import { criticalChance, criticalMultiplier } from '../src/core/production'
import { encodeSave } from '../src/core/save/codec'
import { SaveManager } from '../src/core/save/saveManager'
import { MemoryStorage, SAVE_KEY } from '../src/core/save/storage'
import { createInitialState } from '../src/core/state'
import { createPersistence } from '../src/app/purchaseSave'
import { resetGame } from '../src/app/resetGame'

function newEngine(config: Partial<EngineConfig> = {}, catalog: Catalog = CATALOG) {
  return new GameEngine(catalog, createInitialState(0), { ...DEFAULT_CONFIG, random: () => 0.99, ...config })
}

// Dinheiro e total gerado; o estágio acompanha no próximo advance/compra (checkStage).
function fund(engine: GameEngine, bytes: number, earned = bytes) {
  engine.state.run.bytes = D(bytes)
  engine.state.run.bytesEarned = D(earned)
  engine.advance(1)
}

const base = (id: string) => CATALOG.equipment.find((e) => e.id === id)!.baseProduction
const agentDef = (id: string) => CATALOG.agents.find((a) => a.id === id)!
const upgradeDef = (id: string) => CATALOG.upgrades.find((u) => u.id === id)!
const num = (d: Decimal) => d.toNumber()
const close = (a: number, b: number) => expect(Math.abs(a - b) <= Math.abs(b) * 1e-9 + 1e-12, `${a} vs ${b}`).toBe(true)

// Estado "à mão": compra sem custo, sem passar pelas regras.
function setup(engine: GameEngine, o: {
  equipment?: Record<string, number>
  agents?: Record<string, { count: number; level: number }>
  upgrades?: string[]
  earned?: number
  bytes?: number
}) {
  const { run } = engine.state
  run.equipment = o.equipment ?? {}
  run.agents = o.agents ?? {}
  run.upgrades = o.upgrades ?? []
  run.bytesEarned = D(o.earned ?? 1e13)
  run.bytes = D(o.bytes ?? 0)
  engine.advance(1) // sincroniza o estágio
  run.bytes = D(o.bytes ?? 0)
  engine.invalidate()
}

describe('M2 fórmula global (D-10) com catálogo real', () => {
  it('produção, clique e rastreio por origem batem com o cálculo manual', () => {
    const engine = newEngine()
    setup(engine, {
      equipment: { home_router: 10, home_server: 3 },
      agents: { echo_ai: { count: 3, level: 2 }, kai_ver_3: { count: 2, level: 3 } },
      upgrades: ['macro_script', 'neural_macro', 'overclock_basic', 'task_scheduler', 'ergonomic_keys'],
    })
    const p0 = 10 * base('home_router') + 3 * base('home_server')
    const kai = 2 * 2 * (1 + 0.5 * 2) // 8 pp, agente
    const ups = 5 + 10 // 15 pp, melhorias
    const mult = 1 + (kai + ups) / 100
    const { production } = engine
    close(num(production.base), p0)
    close(num(production.layers.bonus.agents), kai)
    close(num(production.layers.bonus.upgrades), ups)
    close(num(production.layers.bonus.total), kai + ups)
    expect(num(production.layers.quantum)).toBe(0)
    expect(num(production.layers.temporary)).toBe(1)
    close(num(production.multiplier), mult)
    close(num(production.total), p0 * mult)
    expect(num(production.bySource.agents)).toBe(0) // agentes só agem por bônus
    close(num(production.bySource.equipment), p0)

    // Clique: (1 + 1 + 10) × (1 + (3×5×1,5 + 50)/100) × global.
    const echo = 3 * 5 * (1 + 0.5 * 1)
    close(num(engine.clickValue), (1 + 1 + 10) * (1 + (echo + 50) / 100) * mult)
    // Mesmo multiplicador global no passivo e no clique: produção por unidade.
    close(num(engine.equipmentInfo('home_router')!.unitProduction), base('home_router') * mult)
  })

  it('soma dentro da camada: dois agentes e melhorias não se multiplicam entre si', () => {
    const engine = newEngine()
    setup(engine, {
      equipment: { home_router: 20 },
      agents: { kai_ver_3: { count: 1, level: 1 }, neo_gen_5: { count: 1, level: 1 } },
      upgrades: ['overclock_basic', 'task_scheduler', 'distributed_cache'],
    })
    // 2 + 5 + 5 + 10 + 15 = 37 pp, aditivo.
    close(num(engine.production.total), 20 * base('home_router') * 1.37)
  })

  it('crítico sobre o clique final e clickValue sem crítico', () => {
    const engine = newEngine({ random: () => 0 })
    setup(engine, { agents: { echo_ai: { count: 2, level: 1 } }, upgrades: ['macro_script'] })
    const v = num(engine.clickValue)
    close(v, 2 * (1 + 10 / 100))
    const gained = engine.click()
    close(num(gained), v * 5)
  })
})

describe('M2 descontos', () => {
  const owned = { home_router: 12 }
  const agentsDisc = { atlas_core: { count: 5, level: 3 }, echo_ai: { count: 4, level: 2 } }
  const disc = 0.4 * 5 * (1 + 0.1 * 2) + 1 // atlas (2,4) + bulk_discount (1)

  it('valem para equipamento, contratação e evolução, e não para melhorias', () => {
    const engine = newEngine()
    setup(engine, { equipment: owned, agents: agentsDisc, upgrades: ['bulk_discount'] })
    const e = engine.equipmentInfo('home_router')!
    expect(e.nextCost.eq(unitCost(15, 1.15, 12, disc))).toBe(true)
    expect(e.nextCost.lt(unitCost(15, 1.15, 12, 0))).toBe(true)
    const echo = engine.agentInfo('echo_ai')!
    const def = agentDef('echo_ai')
    expect(echo.hireCost.eq(unitCost(def.baseCost, def.costGrowth, 4, disc))).toBe(true)
    expect(echo.levelCost!.eq(unitCost(def.levelBaseCost, def.levelCostGrowth, 1, disc))).toBe(true)
    // Melhorias seguem com o custo do catálogo.
    for (const u of engine.upgradeList()) expect(u.cost).toBe(upgradeDef(u.id).cost)
  })

  it('compra real debita o custo com desconto (equipamento, contratação, evolução) e melhoria sem desconto', () => {
    const engine = newEngine()
    setup(engine, { equipment: owned, agents: agentsDisc, upgrades: ['bulk_discount'], bytes: 1e12 })
    const e = engine.equipmentInfo('home_router')!.nextCost
    const h = engine.agentInfo('echo_ai')!.hireCost
    const l = engine.agentInfo('echo_ai')!.levelCost!
    let b = engine.state.run.bytes
    expect(engine.buyEquipment('home_router', 'x1')).toBe(1)
    expect(b.sub(engine.state.run.bytes).eq(e)).toBe(true)
    b = engine.state.run.bytes
    expect(engine.hireAgent('echo_ai')).toBe(true)
    expect(b.sub(engine.state.run.bytes).eq(h)).toBe(true)
    b = engine.state.run.bytes
    expect(engine.levelUpAgent('echo_ai')).toBe(true)
    expect(b.sub(engine.state.run.bytes).eq(l)).toBe(true)
    b = engine.state.run.bytes
    expect(engine.buyUpgrade('ergonomic_keys')).toBe(true)
    expect(b.sub(engine.state.run.bytes).eq(upgradeDef('ergonomic_keys').cost)).toBe(true)
  })

  it('com muitos agentes de desconto o custo é inteiro e >= 1', () => {
    const engine = newEngine({ maxCostDiscountPercent: 1e9 }) // sem teto, para forçar o piso
    setup(engine, { agents: { atlas_core: { count: 1000, level: 50 } } }) // desconto muito acima de 100%
    for (const e of engine.equipmentList()) {
      for (const owned of [0, 5, 80]) {
        const c = unitCost(CATALOG.equipment.find((x) => x.id === e.id)!.baseCost, 1.15, owned, 5000)
        expect(c.eq(1)).toBe(true)
      }
      expect(e.nextCost.gte(1) && Number.isInteger(num(e.nextCost))).toBe(true)
      expect(e.nextCost.eq(1)).toBe(true)
    }
    for (const a of engine.agentList()) {
      expect(a.hireCost.eq(1)).toBe(true)
      if (a.levelCost) expect(a.levelCost.eq(1)).toBe(true)
    }
  })

  for (const d of [1, 3.4, 12.7, 50, 90]) {
    it(`MAX com desconto de ${d}% não gasta mais que o saldo e +1 não caberia (equipamentos reais)`, () => {
      for (const e of CATALOG.equipment) {
        for (const owned of [0, 9, 45]) {
          for (const b of [20, 5_000, 7e6, 3e11]) {
            const q = maxAffordable(e.baseCost, e.costGrowth, owned, D(b), d)
            expect(bulkCost(e.baseCost, e.costGrowth, owned, q, d).lte(b), `${e.id} ${owned} ${b}`).toBe(true)
            expect(bulkCost(e.baseCost, e.costGrowth, owned, q + 1, d).gt(b), `${e.id} ${owned} ${b} +1`).toBe(true)
          }
        }
      }
    })
  }

  it('MAX pelo motor com desconto ativo bate com o custo exato', () => {
    for (const id of ['home_router', 'home_server']) {
      const engine = newEngine()
      setup(engine, { agents: { atlas_core: { count: 10, level: 1 } }, upgrades: ['bulk_discount'], bytes: 98_765 })
      const d = num(engine.state.run.bytes) && 0.4 * 10 + 1
      const def = CATALOG.equipment.find((e) => e.id === id)!
      const before = engine.state.run.bytes
      const q = engine.buyEquipment(id, 'max')
      expect(q).toBeGreaterThan(0)
      expect(before.sub(engine.state.run.bytes).eq(bulkCost(def.baseCost, def.costGrowth, 0, q, d))).toBe(true)
      expect(engine.state.run.bytes.gte(0)).toBe(true)
      expect(engine.state.run.bytes.lt(unitCost(def.baseCost, def.costGrowth, q, d))).toBe(true)
    }
  })
})

describe('M2 estágios', () => {
  it('avançam em ordem pelos limites reais, um evento por degrau', () => {
    const engine = newEngine()
    const seen: string[] = []
    engine.events.on('stageChanged', (e) => seen.push(`${e.from}>${e.to}`))
    const stages = [...CATALOG.stages].sort((a, b) => a.order - b.order)
    expect(engine.stageInfo.current?.id).toBe('solo_hacker')
    for (const s of stages.slice(1)) {
      if (s.requirement.kind !== 'bytesEarnedInRun') throw new Error('requisito inesperado')
      engine.state.run.bytesEarned = D(s.requirement.amount * 0.999999)
      engine.advance(1)
      expect(engine.stageInfo.next?.id, `antes de ${s.id}`).toBe(s.id)
      engine.state.run.bytesEarned = D(s.requirement.amount)
      engine.advance(1)
      expect(engine.stageInfo.current?.id).toBe(s.id)
      expect(engine.state.run.stage).toBe(s.id)
    }
    expect(seen).toHaveLength(6)
    expect(engine.stageInfo.next).toBeNull()
  })

  it('salta vários de uma vez e os desbloqueios por stageReached mudam junto', () => {
    const engine = newEngine()
    const events: string[] = []
    engine.events.on('stageChanged', (e) => events.push(e.to))
    expect(engine.agentInfo('echo_ai')!.status).not.toBe('unlocked')
    expect(engine.hireAgent('echo_ai')).toBe(false)
    engine.state.run.bytes = D(1e9)
    engine.state.run.bytesEarned = D(1.5e12)
    engine.advance(1)
    expect(events).toEqual(['garage_company', 'startup_lab', 'data_center', 'corporate_network'])
    const status = Object.fromEntries(engine.agentList().map((a) => [a.id, a.status]))
    expect(status).toEqual({
      echo_ai: 'unlocked', kai_ver_3: 'unlocked', atlas_core: 'unlocked', neo_gen_5: 'unlocked', spectre_x: 'revealed',
    })
  })

  it('nunca regride, mesmo com o total gerado menor', () => {
    const engine = newEngine()
    fund(engine, 0, 2e6)
    expect(engine.stageInfo.current?.id).toBe('startup_lab')
    engine.state.run.bytesEarned = D(0)
    engine.advance(1000)
    engine.click()
    expect(engine.stageInfo.current?.id).toBe('startup_lab')
    expect(engine.stageInfo.next?.id).toBe('data_center')
  })

  it('o estágio muda a produção (agente passa a ser contratável e bônus entra)', () => {
    const engine = newEngine()
    fund(engine, 1e9, 9_999)
    expect(engine.hireAgent('echo_ai')).toBe(false)
    engine.state.run.bytesEarned = D(1e4)
    engine.advance(1)
    expect(engine.hireAgent('echo_ai')).toBe(true)
  })
})

describe('M2 estados de agentes e melhorias', () => {
  it('agente: oculto, revelado, desbloqueado', () => {
    const engine = newEngine()
    expect(engine.agentInfo('echo_ai')!.status).toBe('hidden')
    fund(engine, 0, 2_999)
    expect(engine.agentInfo('echo_ai')!.status).toBe('hidden')
    fund(engine, 0, 3_000)
    expect(engine.agentInfo('echo_ai')!.status).toBe('revealed')
    expect(engine.hireAgent('echo_ai')).toBe(false)
    fund(engine, 5_000, 1e4)
    expect(engine.agentInfo('echo_ai')!.status).toBe('unlocked')
    expect(engine.hireAgent('echo_ai')).toBe(true)
  })

  it('Evoluir exige agente contratado, saldo e começa no nível 1', () => {
    const engine = newEngine()
    fund(engine, 1e9, 1e4)
    expect(engine.agentInfo('echo_ai')!.level).toBe(0)
    expect(engine.agentInfo('echo_ai')!.levelCost).toBeNull()
    expect(engine.levelUpAgent('echo_ai')).toBe(false)
    expect(engine.hireAgent('echo_ai')).toBe(true)
    expect(engine.agentInfo('echo_ai')!.level).toBe(1)
    expect(engine.levelUpAgent('echo_ai')).toBe(true)
    expect(engine.agentInfo('echo_ai')!.level).toBe(2)
    engine.state.run.bytes = D(0)
    expect(engine.levelUpAgent('echo_ai')).toBe(false)
    expect(engine.levelUpAgent('nope')).toBe(false)
    expect(engine.hireAgent('nope')).toBe(false)
  })

  it('contratar mais de um aumenta o custo pelo fator 1,25 e o bônus escala por quantidade e nível', () => {
    const engine = newEngine()
    fund(engine, 1e9, 1e4)
    engine.hireAgent('echo_ai')
    engine.hireAgent('echo_ai')
    expect(engine.agentInfo('echo_ai')!.hireCost.eq(unitCost(1_500, 1.25, 2))).toBe(true)
    engine.levelUpAgent('echo_ai')
    const b = engine.agentInfo('echo_ai')!.bonus
    expect(b).toEqual([{ kind: 'clickPercent', value: 2 * 5 * 1.5 }])
  })

  it('melhoria: bloqueada, disponível, comprada; compra única', () => {
    const engine = newEngine()
    const id = 'macro_script' // 50 Bytes, desbloqueia com 25 gerados
    expect(engine.upgradeInfo(id)!.status).toBe('locked')
    engine.state.run.bytes = D(1000)
    expect(engine.buyUpgrade(id)).toBe(false) // saldo não desbloqueia
    engine.state.run.bytesEarned = D(25)
    expect(engine.upgradeInfo(id)!.status).toBe('available')
    engine.state.run.bytes = D(49)
    expect(engine.buyUpgrade(id)).toBe(false)
    engine.state.run.bytes = D(120)
    expect(engine.buyUpgrade(id)).toBe(true)
    expect(engine.state.run.bytes.toNumber()).toBe(70)
    expect(engine.upgradeInfo(id)!.status).toBe('purchased')
    expect(engine.buyUpgrade(id)).toBe(false)
    expect(engine.state.run.upgrades).toEqual([id])
    expect(engine.buyUpgrade('nope')).toBe(false)
  })

  it('melhoria comprada passa a valer no clique e na produção', () => {
    const engine = newEngine()
    fund(engine, 1_000, 1_000)
    const before = num(engine.clickValue)
    engine.buyUpgrade('macro_script')
    expect(num(engine.clickValue)).toBe(before + 1)
    engine.buyEquipment('home_router', 'x10')
    const p = num(engine.production.total)
    engine.buyUpgrade('overclock_basic')
    close(num(engine.production.total), p * 1.05)
  })

  it('ordem: agentList pelo custo de contratação, upgradeList pelo custo, ambas estáveis', () => {
    const engine = newEngine()
    const a = engine.agentList()
    for (let i = 1; i < a.length; i++) expect(a[i - 1]!.hireCost.lte(a[i]!.hireCost)).toBe(true)
    const u = engine.upgradeList()
    for (let i = 1; i < u.length; i++) expect(u[i - 1]!.cost).toBeLessThanOrEqual(u[i]!.cost)
    expect(a).toHaveLength(5)
    expect(u).toHaveLength(20)
    // Com desconto aplicado a ordem dos agentes por custo continua não decrescente.
    setup(engine, { agents: { atlas_core: { count: 3, level: 2 } } })
    const b = engine.agentList()
    for (let i = 1; i < b.length; i++) expect(b[i - 1]!.hireCost.lte(b[i]!.hireCost)).toBe(true)
  })
})

describe('M2 crítico', () => {
  it('chance efetiva soma os agentes e fica entre 0 e o teto de 25% (D-13)', () => {
    const engine = newEngine()
    setup(engine, { agents: { spectre_x: { count: 10, level: 1 } } })
    close(criticalChance(engine.state, CATALOG, 0.05), 0.05 + (10 * 0.3) / 100)
    setup(engine, { agents: { spectre_x: { count: 500, level: 10 } } })
    expect(criticalChance(engine.state, CATALOG, 0.05)).toBe(0.25)
    expect(criticalChance(engine.state, CATALOG, 0.05, 1)).toBe(1)
    expect(criticalChance(engine.state, CATALOG, -3)).toBeGreaterThanOrEqual(0)
    expect(criticalChance(createInitialState(0), CATALOG, 2)).toBe(0.25)
    expect(criticalChance(createInitialState(0), CATALOG, -1)).toBe(0)
  })

  it('com chance 1 todo clique é crítico, mesmo com sorteio perto de 1', () => {
    const engine = newEngine({ random: () => 0.999999, maxCriticalChance: 1 })
    setup(engine, { agents: { spectre_x: { count: 500, level: 10 } } })
    engine.click()
    expect(engine.state.stats.criticalClicks).toBe(1)
  })

  it('multiplicador crítico soma efeitos criticalMultiplier (catálogo real não tem fonte; usa um clone)', () => {
    expect(CATALOG.upgrades.some((u) => u.effect.kind === 'criticalMultiplier')).toBe(false)
    const catalog: Catalog = {
      ...CATALOG,
      upgrades: [
        ...CATALOG.upgrades,
        { ...upgradeDef('macro_script'), id: 'crit_mult_test', effect: { kind: 'criticalMultiplier', value: 3 } },
      ],
    }
    const engine = newEngine({ random: () => 0 }, catalog)
    engine.state.run.upgrades = ['crit_mult_test']
    expect(num(criticalMultiplier(engine.state, catalog, 5))).toBe(8)
    close(num(engine.click()), 1 * 8)
  })
})

describe('M2 save e persistência', () => {
  function played() {
    const engine = newEngine()
    fund(engine, 5e9, 3e9)
    engine.buyEquipment('home_router', 'x10')
    engine.hireAgent('echo_ai')
    engine.hireAgent('echo_ai')
    engine.levelUpAgent('echo_ai')
    engine.hireAgent('kai_ver_3')
    engine.buyUpgrade('overclock_basic')
    engine.buyUpgrade('macro_script')
    engine.advance(5_000)
    return engine
  }

  it('ida e volta preserva agentes, níveis, melhorias, estágio e produção', async () => {
    const engine = played()
    expect(engine.state.run.stage).toBe('data_center')
    const saves = new SaveManager(new MemoryStorage(), () => 1)
    await saves.save(engine)
    const loaded = await saves.load()
    if (!('ok' in loaded) || !loaded.ok) throw new Error('save não carregou')
    const fresh = newEngine()
    fresh.replaceState(loaded.state)
    expect(fresh.state.run.agents).toEqual({ echo_ai: { count: 2, level: 2 }, kai_ver_3: { count: 1, level: 1 } })
    expect(fresh.state.run.upgrades).toEqual(['overclock_basic', 'macro_script'])
    expect(fresh.stageInfo.current?.id).toBe('data_center')
    expect(encodeSave(fresh.state, 1)).toBe(encodeSave(engine.state, 1))
    expect(fresh.production.total.toString()).toBe(engine.production.total.toString())
    expect(fresh.clickValue.toString()).toBe(engine.clickValue.toString())
    const view = (g: GameEngine) => [g.agentList(), g.upgradeList()].map((l) => JSON.stringify(l))
    expect(view(fresh)).toEqual(view(engine))
    engine.advance(10_000)
    fresh.advance(10_000)
    expect(fresh.state.run.bytes.toString()).toBe(engine.state.run.bytes.toString())
  })

  class CountingStorage extends MemoryStorage {
    writes = 0
    override async set(key: string, value: string) {
      if (key === SAVE_KEY) this.writes++
      await super.set(key, value)
    }
  }
  const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms))

  it('grava após contratar, evoluir, melhoria e mudança de estágio; ações mistas viram uma gravação', async () => {
    const engine = newEngine()
    const storage = new CountingStorage()
    const p = createPersistence(engine, new SaveManager(storage), 5)
    engine.state.run.bytes = D(1e9)
    engine.state.run.bytesEarned = D(1e4)
    engine.advance(1) // muda de estágio: gatilho
    await wait()
    expect(storage.writes).toBe(1)

    engine.hireAgent('echo_ai')
    await wait()
    expect(storage.writes).toBe(2)
    expect(JSON.parse((await storage.get(SAVE_KEY))!).state.run.agents).toEqual({ echo_ai: { count: 1, level: 1 } })

    engine.levelUpAgent('echo_ai')
    await wait()
    expect(storage.writes).toBe(3)
    expect(JSON.parse((await storage.get(SAVE_KEY))!).state.run.agents.echo_ai.level).toBe(2)

    engine.buyUpgrade('macro_script')
    await wait()
    expect(storage.writes).toBe(4)
    expect(JSON.parse((await storage.get(SAVE_KEY))!).state.run.upgrades).toEqual(['macro_script'])

    engine.hireAgent('echo_ai')
    engine.levelUpAgent('echo_ai')
    engine.buyUpgrade('overclock_basic')
    engine.buyEquipment('home_router', 'x1')
    await wait()
    expect(storage.writes).toBe(5)
    p.dispose()
    engine.hireAgent('echo_ai')
    await wait()
    expect(storage.writes).toBe(5)
  })

  it('resetGame volta ao estado inicial e grava o save inicial', async () => {
    const engine = played()
    const storage = new CountingStorage()
    const persistence = createPersistence(engine, new SaveManager(storage, () => 9), 5)
    await resetGame(engine, persistence, 123)
    persistence.dispose()
    expect(encodeSave(engine.state, 9)).toBe(encodeSave(createInitialState(123), 9))
    expect(engine.stageInfo.current?.id).toBe('solo_hacker')
    expect(engine.production.total.toNumber()).toBe(0)
    expect(engine.agentList().every((a) => a.count === 0 && a.level === 0)).toBe(true)
    expect(engine.upgradeList().every((u) => u.status === 'locked')).toBe(true)
    expect(await storage.get(SAVE_KEY)).toBe(encodeSave(createInitialState(123), 9))
  })
})

describe('M2 independência de frames com agentes e melhorias', () => {
  function run(slices: number[]) {
    const engine = newEngine()
    fund(engine, 5e7, 5e7)
    engine.buyEquipment('home_router', 'x10')
    const events: [number, () => void][] = [
      [4_000, () => engine.hireAgent('echo_ai')],
      [15_000, () => engine.buyUpgrade('overclock_basic')],
      [30_000, () => engine.hireAgent('kai_ver_3')],
      [31_000, () => engine.levelUpAgent('kai_ver_3')],
      [50_000, () => engine.buyEquipment('home_server', 'max')],
      [70_000, () => engine.buyUpgrade('task_scheduler')],
    ]
    const total = 120_000
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

  it('mesmo tempo, fatias diferentes, mesmo resultado', () => {
    const a = run([120_000])
    expect(a.state.run.upgrades).toEqual(['overclock_basic', 'task_scheduler'])
    expect(a.state.run.agents.kai_ver_3?.level).toBe(2)
    for (const s of [[1000 / 60], [7, 33, 16, 250, 1, 2000, 41], [999]]) {
      const x = run(s)
      close(num(x.state.run.bytes), num(a.state.run.bytes))
      close(num(x.state.run.bytesEarned), num(a.state.run.bytesEarned))
      expect(x.state.run.equipment).toEqual(a.state.run.equipment)
      expect(x.state.run.agents).toEqual(a.state.run.agents)
      expect(x.state.run.stage).toBe(a.state.run.stage)
    }
  })
})

describe('M2 números grandes', () => {
  it('custo inicial de equipamentos e melhorias até 3e18 é inteiro e a lista é ordenada', () => {
    const lastByCategory: Record<string, number> = {}
    for (const e of CATALOG.equipment) {
      const c = unitCost(e.baseCost, e.costGrowth, 0).toNumber()
      expect(Number.isInteger(c), e.id).toBe(true)
      expect(c, e.id).toBeGreaterThanOrEqual(lastByCategory[e.category] ?? 0) // ordenados por custo em cada categoria
      lastByCategory[e.category] = c
    }
    let prev = 0
    for (const u of CATALOG.upgrades) {
      expect(Number.isInteger(u.cost), u.id).toBe(true)
      expect(u.cost).toBeGreaterThan(prev)
      prev = u.cost
    }
    expect(prev).toBe(3e18)
    expect(Math.max(...CATALOG.equipment.map((e) => e.baseCost))).toBeLessThanOrEqual(4e18)
  })

  it('custos acima de 2^53 permanecem inteiros e crescentes com N (aproximados, documentado)', () => {
    for (const e of CATALOG.equipment.filter((x) => x.baseCost > 2 ** 53)) {
      let prev = 0
      for (let n = 0; n < 40; n++) {
        const c = unitCost(e.baseCost, e.costGrowth, n).toNumber()
        expect(Number.isInteger(c), `${e.id} ${n}`).toBe(true)
        expect(c).toBeGreaterThan(prev)
        prev = c
      }
    }
  })

  it('acima de 2^53 a soma perde unidades: documentado (Decimal tem ~15 dígitos)', () => {
    expect(D(1e17).add(1).eq(D(1e17))).toBe(true)
    // Comprar com saldo exato ainda funciona dentro da precisão: nunca fica negativo.
    const engine = newEngine()
    setup(engine, { earned: 1e18, bytes: 4e18 })
    const before = engine.state.run.bytes
    const q = engine.buyEquipment('planetary_mesh', 'max')
    expect(q).toBeGreaterThanOrEqual(0)
    expect(engine.state.run.bytes.gte(0)).toBe(true)
    expect(engine.state.run.bytes.lte(before)).toBe(true)
  })
})

describe('M2 tetos de bônus (D-13)', () => {
  const heavy = { atlas_core: { count: 1000, level: 50 } }

  it('desconto bruto acima do teto resulta em 50; abaixo fica inalterado', () => {
    const engine = newEngine()
    setup(engine, { agents: heavy })
    const info = engine.costDiscount
    expect(info.capped).toBe(true)
    expect(num(info.effective)).toBe(50)
    expect(num(info.raw)).toBeGreaterThan(50)
    const low = newEngine()
    setup(low, { agents: { atlas_core: { count: 5, level: 3 } } })
    expect(low.costDiscount.capped).toBe(false)
    expect(low.costDiscount.effective.eq(low.costDiscount.raw)).toBe(true)
  })

  it('todo custo usa o desconto limitado e continua inteiro e >= 1', () => {
    const engine = newEngine()
    setup(engine, { agents: heavy, bytes: 1e12 })
    for (const e of engine.equipmentList()) {
      const def = CATALOG.equipment.find((x) => x.id === e.id)!
      expect(e.nextCost.eq(unitCost(def.baseCost, def.costGrowth, 0, 50))).toBe(true)
      expect(e.modes.x10.cost.eq(bulkCost(def.baseCost, def.costGrowth, 0, 10, 50))).toBe(true)
      expect(e.nextCost.gte(1) && Number.isInteger(num(e.nextCost))).toBe(true)
    }
    const a = agentDef('echo_ai')
    const info = engine.agentInfo('echo_ai')!
    expect(info.hireCost.eq(unitCost(a.baseCost, a.costGrowth, 0, 50))).toBe(true)
    engine.hireAgent('echo_ai')
    expect(engine.agentInfo('echo_ai')!.levelCost!.eq(unitCost(a.levelBaseCost, a.levelCostGrowth, 0, 50))).toBe(true)
    for (const u of engine.upgradeList()) expect(u.cost).toBe(upgradeDef(u.id).cost)
  })

  it('MAX com desconto limitado nunca gasta mais que o saldo e +1 não caberia', () => {
    for (const id of ['home_router', 'home_server']) {
      const engine = newEngine()
      setup(engine, { agents: heavy, bytes: 98_765 })
      const def = CATALOG.equipment.find((e) => e.id === id)!
      const before = engine.state.run.bytes
      const q = engine.buyEquipment(id, 'max')
      expect(q).toBeGreaterThan(0)
      expect(before.sub(engine.state.run.bytes).eq(bulkCost(def.baseCost, def.costGrowth, 0, q, 50))).toBe(true)
      expect(engine.state.run.bytes.lt(unitCost(def.baseCost, def.costGrowth, q, 50))).toBe(true)
    }
  })

  it('teto configurável', () => {
    const engine = newEngine({ maxCostDiscountPercent: 20, maxCriticalChance: 0.1 })
    setup(engine, { agents: { atlas_core: { count: 100, level: 5 }, spectre_x: { count: 500, level: 1 } } })
    expect(num(engine.costDiscount.effective)).toBe(20)
    expect(engine.criticalChanceInfo.effective).toBe(0.1)
    expect(engine.criticalChanceInfo.raw).toBeGreaterThan(0.1)
    expect(engine.criticalChanceInfo.capped).toBe(true)
  })

  it('chance de crítico limitada a 25% com muitos SPECTRE_X (taxa real de críticos)', () => {
    let i = 0
    // Sorteio determinístico uniforme: 1000 valores em [0, 1).
    const engine = newEngine({ random: () => (i++ % 1000) / 1000 })
    setup(engine, { agents: { spectre_x: { count: 500, level: 10 } } })
    for (let n = 0; n < 1000; n++) engine.click()
    expect(engine.state.stats.criticalClicks).toBe(250)
  })

  it('resultado independe da taxa de quadros', () => {
    const run = (step: number) => {
      const engine = newEngine()
      setup(engine, { equipment: { home_router: 12 }, agents: heavy })
      for (let t = 0; t < 60_000; t += step) engine.advance(step)
      return engine.state.run.bytes
    }
    expect(run(16).sub(run(1000)).abs().lt(1e-6 * num(run(1000)))).toBe(true)
  })
})
