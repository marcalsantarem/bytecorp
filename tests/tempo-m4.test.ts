import { describe, expect, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import type { Catalog, QuantumNodeDef } from '../src/core/catalog/types'
import { D } from '../src/core/decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../src/core/engine'
import { creditAway, PendingOffline } from '../src/app/offlineSession'
import { boot } from '../src/app/bootstrap'
import { SaveManager } from '../src/core/save/saveManager'
import { MemoryStorage } from '../src/core/save/storage'
import { nodeLevelCost, nodeStatus } from '../src/core/progression/quantum'
import { createInitialState, type GameState } from '../src/core/state'
import { fmtTime, simulateCurve } from './helpers/curva'

// QA do M4 (T-074, BRF-075): aceleradores e produção offline contra o motor real.
// Relatório completo (inclui a árvore inteira, vários minutos): TEMPO_REPORT=1 npx vitest run tests/tempo-m4.test.ts --reporter=verbose
//
// Políticas de uso do acelerador (o jogador clica 1 vez por segundo, como no curva-m2):
//   none      : nunca ativa (referência; igual ao curva-m2 e ao prestigio-m3)
//   onReceive : ativa na hora que recebe a concessão, só se não houver um ativo (o que chega
//               com outro ativo fica guardado e, nesta política, não é usado)
//   chain     : a cada segundo, se não há ativo, ativa o primeiro do inventário (encadeia tudo,
//               inclusive o que sobrou de runs anteriores). Nunca substitui um ativo.
// `only` restringe a política às concessões de uma fonte (ex.: 'stage:data_center'), para medir
// o ganho isolado de cada concessão.

const report = !!process.env.TEMPO_REPORT
const out = (text: string) => console.log(text)

type Use = 'none' | 'onReceive' | 'chain'

function accelerate(use: Use, only?: string) {
  const sourceOf = new Map<string, string>()
  const stats = { activated: 0, activatedMinutes: 0, grantedMinutes: 0 }
  const tryActivate = (e: GameEngine) => {
    const acc = e.state.meta.accelerators
    if (acc.active) return
    const item = acc.inventory.find((i) => !only || sourceOf.get(i.id) === only)
    if (!item) return
    const r = e.activateAccelerator(item.id)
    if (r.ok) {
      stats.activated++
      stats.activatedMinutes += item.remainingMs / 60000
    }
  }
  const onEngine = (e: GameEngine) => {
    e.events.on('acceleratorGranted', ({ source, items }) => {
      for (const i of items) {
        sourceOf.set(i.id, source)
        stats.grantedMinutes += i.remainingMs / 60000
      }
      if (use === 'onReceive') tryActivate(e)
    })
  }
  const tick = (e: GameEngine) => {
    if (use === 'chain') tryActivate(e)
  }
  return { onEngine, tick, stats }
}

const RUN_CAP_SECONDS = 3 * 3600
const TREE_CAP_SECONDS = 60 * 3600
const MAX_RUNS = 60

function run1(use: Use, only?: string) {
  const acc = accelerate(use, only)
  const r = simulateCurve(CATALOG, {
    onEngine: acc.onEngine,
    stopWhen: (e) => {
      acc.tick(e)
      return e.state.run.stage === 'mega_corporation'
    },
  })
  return { seconds: r.seconds, stageAt: r.stageAt, stats: acc.stats, engine: r.engine }
}

// Árvore completa, política da árvore do prestigio-m3: comprar sempre o nó disponível mais barato
// e fazer Reboot ao abrir Mega Corporation.
function cheapestAvailable(state: GameState, catalog: Catalog): { def: QuantumNodeDef; cost: number } | undefined {
  let best: { def: QuantumNodeDef; cost: number } | undefined
  for (const def of catalog.quantumNodes) {
    if (nodeStatus(def, state) !== 'available') continue
    const cost = nodeLevelCost(def, state.meta.quantumNodes[def.id] ?? 0)
    if (!best || cost < best.cost) best = { def, cost }
  }
  return best
}
function spendCores(engine: GameEngine): void {
  for (;;) {
    const next = cheapestAvailable(engine.state, engine.catalog)
    if (!next || engine.state.meta.quantumCores.lt(next.cost)) return
    if (!engine.buyQuantumNode(next.def.id).ok) return
  }
}
function treeComplete(state: GameState, catalog: Catalog): boolean {
  return (
    catalog.quantumNodes.filter((n) => n.maxLevel !== null).every((n) => (state.meta.quantumNodes[n.id] ?? 0) >= (n.maxLevel ?? 0)) &&
    (state.meta.quantumNodes.alpha_core ?? 0) >= 5
  )
}

function playTree(use: Use, opts: { config?: Partial<EngineConfig> } = {}) {
  const catalog = CATALOG
  const state = createInitialState(0)
  const acc = accelerate(use)
  const runs: { n: number; seconds: number; reward: number }[] = []
  let total = 0
  let stuck = false
  for (let n = 1; n <= MAX_RUNS && total < TREE_CAP_SECONDS; n++) {
    const r = simulateCurve(catalog, {
      state,
      seed: n,
      maxSeconds: RUN_CAP_SECONDS,
      onEngine: acc.onEngine,
      config: opts.config,
      stopWhen: (e) => {
        acc.tick(e)
        return e.state.run.stage === 'mega_corporation'
      },
    })
    const e = r.engine
    runs.push({ n, seconds: r.seconds, reward: e.rebootRewardNow })
    total += r.seconds
    if (e.state.run.stage !== 'mega_corporation' || e.rebootRewardNow < 1) {
      stuck = true
      break
    }
    e.reboot()
    spendCores(e)
    if (treeComplete(state, catalog)) break
  }
  return { runs, total, stuck, complete: treeComplete(state, catalog), stats: acc.stats, leftover: state.meta.accelerators.inventory.length }
}

describe('aceleradores na run 1 contra o motor real', () => {
  // Cada simulação da run 1 leva cerca de 15 a 25 s; as três referências ficam sempre ligadas.
  const base = run1('none')
  const eager = run1('onReceive')
  const chained = run1('chain')

  it('sem aceleradores a run 1 mantém a curva do M2 (Mega entre 65 e 85 min)', () => {
    if (report) out(`\nRun 1 sem acelerador: Mega em ${fmtTime(base.seconds)}`)
    expect(base.seconds / 60).toBeGreaterThanOrEqual(65)
    expect(base.seconds / 60).toBeLessThanOrEqual(85)
  }, 300_000)

  it('ao receber e encadeando encurtam a run 1, e encadear não é pior que ao receber', () => {
    const pct = (x: number) => (100 * (1 - x / base.seconds)).toFixed(1)
    if (report) {
      out(
        `\nRun 1: sem ${fmtTime(base.seconds)}; ao receber ${fmtTime(eager.seconds)} (-${pct(eager.seconds)}%, ${eager.stats.activated} itens, ${eager.stats.activatedMinutes} min de janela); encadeando ${fmtTime(chained.seconds)} (-${pct(chained.seconds)}%, ${chained.stats.activated} itens, ${chained.stats.activatedMinutes} min de janela, ${chained.stats.grantedMinutes} min concedidos)`,
      )
      for (const [name, r] of [['sem', base], ['ao receber', eager], ['encadeando', chained]] as const)
        out(`  ${name.padEnd(11)} ${Object.entries(r.stageAt).map(([s, t]) => `${s}:${fmtTime(t)}`).join('  ')}`)
    }
    expect(eager.seconds).toBeLessThan(base.seconds)
    expect(chained.seconds).toBeLessThanOrEqual(eager.seconds)
    // Faixa protegida: o ganho da run 1 fica entre 10% e 50% mesmo encadeando tudo (estimativa do AG07: até 45%).
    expect(1 - chained.seconds / base.seconds).toBeGreaterThanOrEqual(0.1)
    expect(1 - chained.seconds / base.seconds).toBeLessThanOrEqual(0.5)
  }, 300_000)

  it('a concessão de cada marco aparece uma vez e a soma bate com a tabela (7 itens: 6 estágios e o Reboot)', () => {
    const granted = chained.engine.state.meta.accelerators.granted
    expect(new Set(granted).size).toBe(granted.length)
    // Mega Corporation foi aberto: as seis concessões de estágio existem, sem a do Reboot (ainda não houve).
    expect([...granted].sort()).toEqual(Object.keys(ACCELERATOR_STAGES).map((s) => `stage:${s}`).sort())
  })

  it.skipIf(!report)('ganho isolado de cada concessão na run 1 (relatório)', () => {
    const lines = ['\n== Ganho isolado por concessão (run 1, só aquela concessão ativada) ==']
    for (const stage of Object.keys(ACCELERATOR_STAGES)) {
      const r = run1('chain', `stage:${stage}`)
      const g = ACCELERATOR_STAGES[stage]!
      lines.push(
        `${stage.padEnd(18)} ${g.padEnd(8)} Mega ${fmtTime(r.seconds).padStart(9)}  ganho ${fmtTime(base.seconds - r.seconds).padStart(9)} (${(100 * (1 - r.seconds / base.seconds)).toFixed(1)}%)  janela usada ${r.stats.activated ? 'sim' : 'não (concedido depois do fim)'}`,
      )
    }
    out(lines.join('\n'))
  }, 3_600_000)
})

const ACCELERATOR_STAGES: Record<string, string> = {
  garage_company: '2x/15',
  startup_lab: '2x/15',
  data_center: '2x/30',
  corporate_network: '5x/15',
  quantum_facility: '5x/15',
  mega_corporation: '5x/30',
}

describe('árvore completa com aceleradores (relatório)', () => {
  it.skipIf(!report)('quantos Reboots e horas, com e sem aceleradores', () => {
    const lines = ['\n== Árvore completa, Reboot ao abrir Mega (política do prestigio-m3) ==']
    const res: Record<string, ReturnType<typeof playTree>> = {}
    for (const use of ['none', 'onReceive', 'chain'] as Use[]) {
      const t = playTree(use)
      res[use] = t
      lines.push(
        `${use.padEnd(10)} ${t.runs.length} runs, árvore ${t.complete ? 'completa' : 'INCOMPLETA'}${t.stuck ? ' (PAROU)' : ''}, total ${fmtTime(t.total)}; itens ativados ${t.stats.activated} (${t.stats.activatedMinutes} min), concedidos ${t.stats.grantedMinutes} min, sobraram ${t.leftover}`,
      )
      lines.push(`           duração por run: ${t.runs.map((r) => fmtTime(r.seconds)).join(', ')}`)
    }
    for (const use of ['onReceive', 'chain'])
      lines.push(`ganho ${use}: ${(100 * (1 - res[use]!.total / res.none!.total)).toFixed(1)}% do tempo total`)
    out(lines.join('\n'))
  }, 3_600_000)

  it.skipIf(!report)('alavancas: tabelas de concessão alternativas (relatório, encadeando, árvore completa)', () => {
    const G = DEFAULT_CONFIG.acceleratorGrants
    const g = (multiplier: 2 | 5, durationMin: 15 | 30 | 60) => [{ multiplier, durationMin }]
    const variants: [string, Partial<EngineConfig>][] = [
      ['tabela atual', {}],
      ['sem concessão de Reboot', { acceleratorGrants: { ...G, reboot: [] } }],
      ['5x só em Mega; resto 2x/15 e 2x/30', { acceleratorGrants: { stage: { garage_company: g(2, 15), startup_lab: g(2, 15), data_center: g(2, 30), corporate_network: g(2, 15), quantum_facility: g(2, 15), mega_corporation: g(5, 30) }, reboot: [] } }],
      ['tudo 2x (15/15/30/15/15/30), sem Reboot', { acceleratorGrants: { stage: { garage_company: g(2, 15), startup_lab: g(2, 15), data_center: g(2, 30), corporate_network: g(2, 15), quantum_facility: g(2, 15), mega_corporation: g(2, 30) }, reboot: [] } }],
    ]
    const lines = [['', '== Alavancas (encadeando, árvore completa) =='].join(String.fromCharCode(10))]
    const none = playTree('none').total
    for (const [name, config] of variants) {
      const t = playTree('chain', { config })
      lines.push(`${name.padEnd(40)} ${t.runs.length} runs, total ${fmtTime(t.total)}, ganho ${(100 * (1 - t.total / none)).toFixed(1)}%, itens ativados ${t.stats.activated} (${t.stats.activatedMinutes} min), sobraram ${t.leftover}; runs: ${t.runs.map((r) => fmtTime(r.seconds)).join(', ')}`)
    }
    out(lines.join(String.fromCharCode(10)))
  }, 3_600_000)
})

describe('produção offline contra o motor real', () => {
  const HOUR = 3_600_000
  const base = () => {
    const s = createInitialState(0)
    s.run.equipment = { [CATALOG.equipment[0]!.id]: 10, [CATALOG.equipment[1]!.id]: 3 }
    s.run.bytes = D(0)
    s.run.bytesEarned = D(0)
    return new GameEngine(CATALOG, s, { ...DEFAULT_CONFIG, random: () => 0.99, maxStepMs: 1000 })
  }
  const withAcc = (multiplier: number, minutes: number) => {
    const e = base()
    e.state.meta.accelerators.inventory.push({ id: 'acc-t', multiplier, remainingMs: minutes * 60000 })
    expect(e.activateAccelerator('acc-t').ok).toBe(true)
    return e
  }
  // Mesmo estado jogado com advance (produção constante, sem clique nem compra), por referência.
  const viaAdvance = (e: GameEngine, ms: number) => {
    e.advance(ms)
    return e.state.run.bytes.toNumber()
  }
  const viaOffline = (e: GameEngine, away: number) => {
    const segs = e.offlineSegments(away)
    const r = e.applyOffline(away, segs)
    return { bytes: e.state.run.bytes.toNumber(), r }
  }
  const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(1e-6, Math.abs(b) * 1e-9))

  it('1 h sem acelerador: offline igual a advance', () => {
    const adv = viaAdvance(base(), HOUR)
    const off = viaOffline(base(), HOUR)
    near(off.bytes, adv)
    expect(off.r.creditedMs).toBe(HOUR)
    expect(off.r.cappedMs).toBe(0)
  })

  it('8 h creditadas por inteiro e 20 h limitadas a 8 h (12 h cortadas)', () => {
    const adv8 = viaAdvance(base(), 8 * HOUR)
    const o8 = viaOffline(base(), 8 * HOUR)
    near(o8.bytes, adv8)
    expect(o8.r.cappedMs).toBe(0)
    const o20 = viaOffline(base(), 20 * HOUR)
    near(o20.bytes, adv8)
    expect(o20.r.creditedMs).toBe(8 * HOUR)
    expect(o20.r.cappedMs).toBe(12 * HOUR)
  })

  it('acelerador 2x/15 ativo e ausência de 1 h: 15 min em dobro e o resto normal, igual a advance', () => {
    const adv = viaAdvance(withAcc(2, 15), HOUR)
    const e = withAcc(2, 15)
    const off = viaOffline(e, HOUR)
    near(off.bytes, adv)
    const plain = viaOffline(base(), HOUR).bytes
    near(off.bytes, plain * (1 + 15 / 60))
    expect(e.state.meta.accelerators.active).toBeNull()
  })

  it('acelerador que expira no meio (5x com 5 min restantes, ausência de 1 h)', () => {
    const e = withAcc(5, 5)
    const off = viaOffline(e, HOUR)
    near(off.bytes, viaOffline(base(), HOUR).bytes * (1 + (4 * 5) / 60))
    near(off.bytes, viaAdvance(withAcc(5, 5), HOUR))
    expect(e.state.meta.accelerators.active).toBeNull()
  })

  it('acelerador de 60 min com ausência de 10 h: credita 8 h, 60 min em 5x, e o tempo é descontado pela ausência inteira', () => {
    const e = withAcc(5, 60)
    const off = viaOffline(e, 10 * HOUR)
    near(off.bytes, viaOffline(base(), 8 * HOUR).bytes * (1 + 4 / 8))
    expect(off.r.creditedMs).toBe(8 * HOUR)
    expect(off.r.cappedMs).toBe(2 * HOUR)
    expect(e.state.meta.accelerators.active).toBeNull()
  })

  it('tempo do acelerador depois da ausência: 2x/15 e ausência de 5 min deixa 10 min; o do inventário não corre', () => {
    const e = withAcc(2, 15)
    e.state.meta.accelerators.inventory.push({ id: 'acc-i', multiplier: 5, remainingMs: 30 * 60000 })
    viaOffline(e, 5 * 60000)
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(10 * 60000)
    expect(e.state.meta.accelerators.inventory[0]?.remainingMs).toBe(30 * 60000)
  })

  it('acelerador ativo com ausência de 20 h (limite): expira e produção volta ao normal', () => {
    const e = withAcc(2, 60)
    viaOffline(e, 20 * HOUR)
    expect(e.state.meta.accelerators.active).toBeNull()
    expect(e.temporaryMultiplier).toBe(1)
  })

  it('bônus temporário e acelerador juntos nos trechos corretos', () => {
    const e = withAcc(2, 30)
    e.grantTemporaryBonus({ id: 'b', multiplier: 3, remainingMs: 10 * 60000 })
    const off = viaOffline(e, HOUR)
    const p = viaOffline(base(), HOUR).bytes / 3600 // por segundo
    // 10 min em 6x, 20 min em 2x, 30 min em 1x.
    near(off.bytes, p * (600 * 6 + 1200 * 2 + 1800))
  })

  it('creditAway: ausência abaixo de 60 s não credita nem mexe nos temporizadores', () => {
    const e = withAcc(2, 15)
    const pending = new PendingOffline()
    expect(creditAway(e, pending, 59_000)).toBeNull()
    expect(e.state.meta.accelerators.active?.remainingMs).toBe(15 * 60000)
    expect(pending.peek()).toBeNull()
  })

  it('sem crédito duplo ao recarregar: segundo boot logo depois não paga a mesma ausência', async () => {
    const storage = new MemoryStorage()
    const saves = new SaveManager(storage, () => 0)
    const s = createInitialState(0)
    s.run.equipment = { [CATALOG.equipment[0]!.id]: 10 }
    s.meta.accelerators.active = { id: 'acc-1', multiplier: 2, remainingMs: 15 * 60000 }
    s.meta.accelerators.nextItemId = 2
    const first = new GameEngine(CATALOG, s)
    await saves.save(first)
    const lifecycle = { isHidden: () => false, onVisibilityChange: () => () => {}, onPageHide: () => () => {} }
    const clock = { now: () => 0, setInterval: () => 0, clearInterval: () => {} }
    const T = 3 * HOUR
    const b1 = await boot(storage, { now: () => T, lifecycle, clock })
    if (b1.kind !== 'ready') throw new Error('boot')
    const r1 = b1.session.offline.consume()
    expect(r1).not.toBeNull()
    expect(r1!.creditedMs).toBe(T)
    const bytes1 = b1.session.engine.state.run.bytes.toNumber()
    // 15 min a 2x + 2h45 a 1x.
    const p = first.productionBase.toNumber()
    near(bytes1, p * (900 * 2 + (T / 1000 - 900)))
    expect(b1.session.engine.state.meta.accelerators.active).toBeNull()
    b1.session.stop()
    await new Promise((r) => setTimeout(r, 20))
    // Recarregar 5 s depois: nada a creditar e o saldo continua o mesmo.
    const b2 = await boot(storage, { now: () => T + 5000, lifecycle, clock })
    if (b2.kind !== 'ready') throw new Error('boot2')
    expect(b2.session.offline.consume()).toBeNull()
    near(b2.session.engine.state.run.bytes.toNumber(), bytes1)
    b2.session.stop()
  })
})
