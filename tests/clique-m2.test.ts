import { describe, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import type { Catalog } from '../src/core/catalog/types'
import { fmtTime, simulateCurve, type CurveResult } from './helpers/curva'

// Peso do clique na curva (T-063, BRF-045). Fora do npm test padrão:
//   CLIQUE_REPORT=1 npx vitest run tests/clique-m2.test.ts --reporter=verbose
// CLIQUE_PROPOSTAS=1 também mede as propostas de ajuste (cópias do catálogo, sem alterar o real).

const STAGES = ['garage_company', 'startup_lab', 'data_center', 'corporate_network', 'quantum_facility', 'mega_corporation']
const RATES = process.env.CLIQUE_RATES ? process.env.CLIQUE_RATES.split(',').map(Number) : [0, 0.5, 1, 2, 3, 5, 10]
// Com 0 cliques/s o jogo não sai do zero (Bytes iniciais 0), então 0 usa 30 s de partida a 1 clique/s.
const BOOT = 30
const out = (t: string) => console.log(t)
const mins = (r: CurveResult) => (r.reachedMega ? (r.seconds / 60).toFixed(1) : '>240')

function table(title: string, cat: Catalog, base?: CurveResult) {
  const rows = [`\n### ${title}`, '| cliques/s | ' + STAGES.slice(1).map((s) => s).join(' | ') + ' | Mega (min) | desvio vs 1/s |', '|' + '---|'.repeat(STAGES.length + 2)]
  const res: Record<number, CurveResult> = {}
  for (const rate of RATES) {
    const r = simulateCurve(cat, { clicksPerSecond: rate, bootstrapSeconds: rate === 0 ? BOOT : 0 })
    res[rate] = r
  }
  const ref = base ?? res[1]!
  for (const rate of RATES) {
    const r = res[rate]!
    rows.push(`| ${rate} | ${STAGES.slice(1).map((s) => fmtTime(r.stageAt[s])).join(' | ')} | ${mins(r)} | ${r.reachedMega ? ((r.seconds / ref.seconds - 1) * 100).toFixed(1) + '%' : '?'} |`)
  }
  out(rows.join('\n'))
  return res
}

const isClickUp = (c: Catalog, id: string) => {
  const k = c.upgrades.find((u) => u.id === id)?.effect.kind
  return k === 'clickFlat' || k === 'clickPercent'
}

function clickBuys(rate: number, r: CurveResult, c: Catalog) {
  const ups = c.upgrades.filter((u) => u.effect.kind === 'clickFlat' || u.effect.kind === 'clickPercent').map((u) => `${u.id} ${fmtTime(r.upgradeAt[u.id]?.t)}`)
  const ag = c.agents.filter((a) => a.primary.kind === 'clickPercent').map((a) => `${a.id} contrata ${fmtTime(r.agentFirstHire[a.id]?.t)}, nível ${r.agentsFinal[a.id]?.level}, ${r.levels[a.id] ?? 0} evoluções`)
  return `${rate}/s: ${ups.join('; ')}; ${ag.join('; ')}`
}

describe.skipIf(!process.env.CLIQUE_REPORT)('peso do clique', () => {
  it('tempos por ritmo e fatia da renda', () => {
    const res = table('catálogo atual', CATALOG)
    const r1 = res[1]!
    out('\nFatia da renda dos cliques ao abrir cada estágio (1/s): ' + STAGES.map((s) => `${s} ${((r1.clickShareAtStage[s] ?? 0) * 100).toFixed(2)}%`).join('; ') + `; final ${(r1.finalClickShare * 100).toFixed(2)}%`)
    for (const rate of RATES) out('Fatia ' + rate + '/s: ' + STAGES.map((s) => ((res[rate]!.clickShareAtStage[s] ?? 0) * 100).toFixed(1) + '%').join(' / ') + ` final ${(res[rate]!.finalClickShare * 100).toFixed(1)}%`)
    for (const rate of RATES) out(clickBuys(rate, res[rate]!, CATALOG))
    void isClickUp
  }, 1_800_000)

  it.skipIf(!process.env.CLIQUE_PROPOSTAS)('propostas (cópias do catálogo)', () => {
    const base = simulateCurve(CATALOG)
    const over = (f: (c: Catalog) => void) => {
      const c = structuredClone(CATALOG)
      f(c)
      return c
    }
    const flat = (c: Catalog, k: number) => c.upgrades.forEach((u) => { if (u.effect.kind === 'clickFlat' && u.effect.value > 100) u.effect.value *= k })
    const prod = (c: Catalog, k: number) => c.upgrades.forEach((u) => { if (u.effect.kind === 'globalProductionPercent') u.effect.value *= k })
    const props: [string, (c: Catalog) => void][] = [
      ['P1 clickFlat grandes x0,5', (c) => flat(c, 0.5)],
      ['P2 clickFlat grandes x0,25', (c) => flat(c, 0.25)],
      ['P3 clickFlat grandes x0,1', (c) => flat(c, 0.1)],
      ['P4 clickFlat grandes x0,5 e produção global das melhorias x1,15', (c) => { flat(c, 0.5); prod(c, 1.15) }],
      ['P5 clickFlat grandes x0,25 e produção global das melhorias x1,3', (c) => { flat(c, 0.25); prod(c, 1.3) }],
    ]
    // PK: clickFlat x0,25 e produção global x CLIQUE_K (calibração da P5, T-064).
    if (process.env.CLIQUE_K) props.push([`PK clickFlat x0,25 e produção global x${process.env.CLIQUE_K}`, (c) => { flat(c, Number(process.env.CLIQUE_F ?? 0.25)); prod(c, Number(process.env.CLIQUE_K)) }])
    // CLIQUE_PROPOSTAS=P4,P5 mede só as citadas; =1 mede todas.
    const only = process.env.CLIQUE_PROPOSTAS === '1' ? null : process.env.CLIQUE_PROPOSTAS!.split(',')
    for (const [name, f] of props) if (!only || only.some((o) => name.startsWith(o + ' '))) table(name, over(f), base)
  }, 3_600_000)
})
