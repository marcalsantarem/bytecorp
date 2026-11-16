import { IDBFactory } from 'fake-indexeddb'
import { afterEach, describe, expect, it } from 'vitest'
import { CATALOG } from '../core/catalog'
import type { ClockDeps } from '../core/clock'
import { GameEngine } from '../core/engine'
import { MemoryStorage } from '../core/save/storage'
import { SaveManager } from '../core/save/saveManager'
import { createInitialState } from '../core/state'
import { IndexedDbStorage } from '../platform/indexedDbStorage'
import { boot, type BootResult, type GameSession, type PageLifecycle } from './bootstrap'
import { MAX_AWAY_MS } from './offlineSession'

const HOUR = 3_600_000
const T0 = 1_000_000_000_000

// Estado com uma produção fixa de 10 B/s (um equipamento e nada mais).
function seededState() {
  const state = createInitialState(T0)
  const first = CATALOG.equipment[0]!
  state.run.equipment[first.id] = 1
  return { state, first }
}

async function seedSave(storage: MemoryStorage, savedAt: number) {
  const { state } = seededState()
  await new SaveManager(storage, () => savedAt).save(new GameEngine(CATALOG, state))
  return state
}

class FakeLifecycle implements PageLifecycle {
  hidden = false
  private vis: (() => void)[] = []
  isHidden = () => this.hidden
  onVisibilityChange = (cb: () => void) => {
    this.vis.push(cb)
    return () => {
      this.vis = this.vis.filter((c) => c !== cb)
    }
  }
  onPageHide = () => () => {}
  set(hidden: boolean) {
    this.hidden = hidden
    for (const cb of [...this.vis]) cb()
  }
}

function deps(wall: { t: number }, lifecycle = new FakeLifecycle()) {
  const raw = { t: 0 }
  const clock: ClockDeps = { now: () => raw.t, setInterval: () => 0, clearInterval: () => {} }
  return { raw, lifecycle, deps: { now: () => wall.t, clock, lifecycle } }
}

const sessions: GameSession[] = []
async function ready(storage: MemoryStorage, d: ReturnType<typeof deps>['deps']): Promise<GameSession> {
  const r: BootResult = await boot(storage, d)
  if (r.kind !== 'ready') throw new Error('corrupt')
  sessions.push(r.session)
  return r.session
}

afterEach(() => {
  for (const s of sessions.splice(0)) s.stop()
})

describe('produção offline ao carregar', () => {
  it('credita 1 h de ausência uma só vez e deixa o resultado pendente', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 + HOUR }
    const s = await ready(storage, deps(wall).deps)
    const perSecond = s.engine.production.total
    expect(perSecond.gt(0)).toBe(true)
    const result = s.offline.consume()
    expect(result?.creditedMs).toBe(HOUR)
    expect(result?.bytes.eq(perSecond.mul(3600))).toBe(true)
    expect(s.engine.state.run.bytes.gte(perSecond.mul(3600))).toBe(true)
    expect(s.offline.consume()).toBeNull()
  })

  it('recarregar logo depois não credita de novo (savedAt regravado)', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 + HOUR }
    const first = await ready(storage, deps(wall).deps)
    first.stop()
    wall.t += 5_000
    const second = await ready(storage, deps(wall).deps)
    expect(second.offline.consume()).toBeNull()
  })

  it('ausência menor que o mínimo não credita', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 + 30_000 }
    const s = await ready(storage, deps(wall).deps)
    expect(s.offline.consume()).toBeNull()
    expect(s.engine.state.run.bytes.eq(0)).toBe(true)
  })

  it('relógio retrocedido: ausência 0 e savedAt regravado', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0 + 10 * HOUR)
    const wall = { t: T0 }
    const s = await ready(storage, deps(wall).deps)
    expect(s.offline.consume()).toBeNull()
    const loaded = await new SaveManager(storage).load()
    expect('ok' in loaded && loaded.ok && loaded.savedAt).toBe(T0)
  })

  it('limite de 8 h e ausência acima de 1 ano sem erro', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 + 20 * HOUR }
    const s = await ready(storage, deps(wall).deps)
    const r = s.offline.consume()!
    expect(r.creditedMs).toBe(8 * HOUR)
    expect(r.cappedMs).toBe(12 * HOUR)

    const storage2 = new MemoryStorage()
    await seedSave(storage2, T0)
    const s2 = await ready(storage2, deps({ t: T0 + 5 * MAX_AWAY_MS }).deps)
    const r2 = s2.offline.consume()!
    expect(r2.awayMs).toBe(MAX_AWAY_MS)
    expect(r2.creditedMs).toBe(8 * HOUR)
  })

  it('funciona sobre IndexedDB (fake-indexeddb)', async () => {
    const idb = new IndexedDbStorage(new IDBFactory())
    await new SaveManager(idb, () => T0).save(new GameEngine(CATALOG, seededState().state))
    const wall = { t: T0 + HOUR }
    const r = await boot(idb, deps(wall).deps)
    if (r.kind !== 'ready') throw new Error('corrupt')
    sessions.push(r.session)
    expect(r.session.offline.consume()?.creditedMs).toBe(HOUR)
  })
})

describe('volta à aba', () => {
  async function fresh() {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 }
    const d = deps(wall)
    const s = await ready(storage, d.deps)
    return { s, wall, d }
  }

  it('aba oculta por 1 h sem o motor avançar credita uma vez', async () => {
    const { s, wall, d } = await fresh()
    d.lifecycle.set(true)
    wall.t += HOUR
    d.lifecycle.set(false)
    const r = s.offline.consume()!
    expect(r.awayMs).toBe(HOUR)
    d.lifecycle.set(true)
    d.lifecycle.set(false)
    expect(s.offline.consume()).toBeNull()
  })

  it('não conta duas vezes o que o motor já avançou', async () => {
    const { s, wall, d } = await fresh()
    d.lifecycle.set(true)
    wall.t += HOUR
    s.engine.advance(40 * 60_000)
    d.lifecycle.set(false)
    expect(s.offline.consume()!.awayMs).toBe(20 * 60_000)
  })

  it('oculta por menos que o mínimo não credita', async () => {
    const { s, wall, d } = await fresh()
    d.lifecycle.set(true)
    wall.t += 30_000
    d.lifecycle.set(false)
    expect(s.offline.consume()).toBeNull()
  })

  it('lacuna do relógio do motor vira offline e não é paga de novo ao voltar', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 }
    const raw = { t: 0 }
    let tick: () => void = () => {}
    const clock: ClockDeps = { now: () => raw.t, setInterval: (fn) => ((tick = fn), 0), clearInterval: () => {} }
    const lifecycle = new FakeLifecycle()
    const s = await ready(storage, { now: () => wall.t, clock, lifecycle })
    const before = s.engine.state.stats.playTimeMs
    lifecycle.set(true)
    wall.t += HOUR
    raw.t += HOUR
    tick()
    expect(s.engine.state.stats.playTimeMs).toBe(before)
    lifecycle.set(false)
    expect(s.offline.consume()!.awayMs).toBe(HOUR)
  })

  it('créditos seguidos antes da leitura somam', async () => {
    const { s, wall, d } = await fresh()
    for (let i = 0; i < 2; i++) {
      d.lifecycle.set(true)
      wall.t += HOUR
      d.lifecycle.set(false)
    }
    expect(s.offline.consume()!.awayMs).toBe(2 * HOUR)
  })
})


describe('aceleradores durante a ausência', () => {
  async function withAccelerator(remainingMs: number, wallOffset: number) {
    const storage = new MemoryStorage()
    const { state } = seededState()
    state.meta.accelerators.active = { id: 'acc-1', multiplier: 5, remainingMs }
    await new SaveManager(storage, () => T0).save(new GameEngine(CATALOG, state))
    const wall = { t: T0 + wallOffset }
    const d = deps(wall)
    const s = await ready(storage, d.deps)
    return { s, storage, wall, d }
  }

  it('1 h de ausência com 5x de 30 min: 30 min x5 + 30 min x1, acelerador expirado', async () => {
    const { s } = await withAccelerator(30 * 60_000, HOUR)
    const base = s.engine.productionBase
    const r = s.offline.consume()!
    expect(r.bytes.eq(base.mul(1800 * 5 + 1800))).toBe(true)
    expect(s.engine.state.meta.accelerators.active).toBeNull()
  })

  it('acelerador maior que a ausência continua ativo com o tempo restante', async () => {
    const { s } = await withAccelerator(2 * HOUR, HOUR)
    const base = s.engine.productionBase
    expect(s.offline.consume()!.bytes.eq(base.mul(3600 * 5))).toBe(true)
    expect(s.engine.state.meta.accelerators.active?.remainingMs).toBe(HOUR)
  })

  it('dois créditos seguidos descontam o temporizador entre eles', async () => {
    const { s, wall, d } = await withAccelerator(90 * 60_000, 0)
    s.offline.consume()
    const base = s.engine.productionBase
    d.lifecycle.set(true)
    wall.t += HOUR
    d.lifecycle.set(false)
    expect(s.engine.state.meta.accelerators.active?.remainingMs).toBe(30 * 60_000)
    d.lifecycle.set(true)
    wall.t += HOUR
    d.lifecycle.set(false)
    const r = s.offline.consume()!
    expect(r.bytes.eq(base.mul(3600 * 5 + 1800 * 5 + 1800))).toBe(true)
    expect(s.engine.state.meta.accelerators.active).toBeNull()
  })

  it('sem acelerador, credita como antes', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const s = await ready(storage, deps({ t: T0 + HOUR }).deps)
    expect(s.offline.consume()!.bytes.eq(s.engine.productionBase.mul(3600))).toBe(true)
  })

  it('recarregar logo depois não credita de novo nem desconta o acelerador outra vez', async () => {
    const { s, storage, wall } = await withAccelerator(2 * HOUR, HOUR)
    s.stop()
    wall.t += 5_000
    const second = await ready(storage, deps(wall).deps)
    expect(second.offline.consume()).toBeNull()
    expect(second.engine.state.meta.accelerators.active?.remainingMs).toBe(HOUR)
  })
})

describe('stageBefore e concessões do resultado pendente', () => {
  // 0,5 B/s: 8 h (o limite) rendem 14.400 B, o bastante para sair do estágio inicial (1e4).
  it('estágio muda na ausência: stageBefore é o anterior e há uma concessão', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const s = await ready(storage, deps({ t: T0 + 8 * HOUR }).deps)
    const d = s.offline.consumeDetail()!
    expect(d.stageBefore).toBe('solo_hacker')
    expect(s.engine.state.run.stage).not.toBe('solo_hacker')
    expect(d.grants).toBeGreaterThanOrEqual(1)
    expect(s.offline.consumeDetail()).toBeNull()
  })

  it('concessão durante a ausência entra no inventário e na contagem', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const s = await ready(storage, deps({ t: T0 + 8 * HOUR }).deps)
    const d = s.offline.peekDetail()!
    const inv = s.engine.state.meta.accelerators.inventory.length + (s.engine.state.meta.accelerators.active ? 1 : 0)
    expect(d.grants).toBe(inv)
    expect(s.offline.peek()).toBe(d.result)
  })

  it('créditos seguidos: stageBefore do primeiro e concessões somadas', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const wall = { t: T0 }
    const d = deps(wall)
    const s = await ready(storage, d.deps)
    for (let i = 0; i < 2; i++) {
      d.lifecycle.set(true)
      wall.t += 8 * HOUR
      d.lifecycle.set(false)
    }
    const detail = s.offline.consumeDetail()!
    expect(detail.stageBefore).toBe('solo_hacker')
    expect(detail.result.awayMs).toBe(16 * HOUR)
    const inv = s.engine.state.meta.accelerators.inventory.length + (s.engine.state.meta.accelerators.active ? 1 : 0)
    expect(detail.grants).toBe(inv)
  })

  it('sem mudança de estágio: stageBefore igual ao atual e zero concessões', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const s = await ready(storage, deps({ t: T0 + 5 * 60_000 }).deps)
    const d = s.offline.consumeDetail()!
    expect(d.stageBefore).toBe(s.engine.state.run.stage)
    expect(d.grants).toBe(0)
  })

  it('consume() segue devolvendo só o resultado', async () => {
    const storage = new MemoryStorage()
    await seedSave(storage, T0)
    const s = await ready(storage, deps({ t: T0 + HOUR }).deps)
    expect(s.offline.consume()?.creditedMs).toBe(HOUR)
  })
})
