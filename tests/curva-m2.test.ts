import { describe, expect, it } from 'vitest'
import { CATALOG } from '../src/core/catalog'
import type { Catalog } from '../src/core/catalog/types'
import { fmtTime, simulateCurve, type CurveResult } from './helpers/curva'

// Protege a curva do M2 (T-062, BRF-044): primeira run completa até Mega Corporation em cerca de
// 75 min (tolerância de 15%: 64 a 86 min) contra o motor real, com comprador guloso (tests/helpers/curva.ts).
// Relatório e sensibilidade: CURVA_REPORT=1 npx vitest run tests/curva-m2.test.ts --reporter=verbose

const STAGES = ['garage_company', 'startup_lab', 'data_center', 'corporate_network', 'quantum_facility', 'mega_corporation']
const DISCOUNT_CAP = 50
const out = (text: string) => console.log(text)

function report(title: string, r: CurveResult) {
  const lines = [`\n== ${title}: Mega ${fmtTime(r.reachedMega ? r.seconds : undefined)} ==`]
  let prev = 0
  for (const s of STAGES) {
    const t = r.stageAt[s]
    lines.push(`${s.padEnd(18)} ${fmtTime(t).padStart(9)}  razão ${prev && t ? (t / prev).toFixed(2) : '-'}  desconto ${(r.discountAtStage[s] ?? 0).toFixed(1)}%`)
    if (t) prev = t
  }
  for (const [id, a] of Object.entries(r.agentFirstHire)) lines.push(`agente ${id.padEnd(10)} ${fmtTime(a.t).padStart(9)} custo ${a.cost.toExponential(1)} retorno ${fmtTime(a.payback)} renda ${a.income.toExponential(1)} x${a.mult.toFixed(1)}`)
  for (const u of CATALOG.upgrades) {
    const x = r.upgradeAt[u.id]
    lines.push(`melhoria ${u.id.padEnd(22)} ${fmtTime(x?.t).padStart(9)} custo ${u.cost.toExponential(1)} retorno ${fmtTime(x?.payback)} renda ${x ? x.income.toExponential(1) : '-'} x${x ? x.mult.toFixed(1) : '-'}`)
  }
  lines.push(`evoluções: ${JSON.stringify(r.levels)}`)
  lines.push(`agentes no fim: ${JSON.stringify(r.agentsFinal)}`)
  lines.push(`desconto final ${r.finalDiscount.toFixed(1)}% (bruto ${r.finalRawDiscount.toFixed(1)}%), crítico ${(r.finalCrit * 100).toFixed(1)}%`)
  const gaps = [...r.purchases].sort((a, b) => b.gap - a.gap).slice(0, 5)
  lines.push('maiores esperas: ' + gaps.map((g) => `${fmtTime(g.gap)} até ${g.id} em ${fmtTime(g.t)}`).join('; '))
  console.log(lines.join('\n'))
}

describe('curva do M2 contra o motor real', () => {
  const full = simulateCurve(CATALOG)

  it('Mega Corporation entre 64 e 86 min', () => {
    if (process.env.CURVA_REPORT) report('completo', full)
    expect(full.reachedMega).toBe(true)
    expect(full.seconds / 60).toBeGreaterThanOrEqual(64)
    expect(full.seconds / 60).toBeLessThanOrEqual(86)
  })

  it('razões entre estágios consecutivas até 2,5x e sem trecho parado longo', () => {
    let prev = 0
    for (const s of STAGES) {
      const t = full.stageAt[s]!
      if (prev > 0) expect(t / prev, s).toBeLessThanOrEqual(2.5)
      prev = t
    }
    expect(Math.max(...full.purchases.map((p) => p.gap))).toBeLessThanOrEqual(200)
  })

  it('todos os agentes são contratados e o desconto só chega perto do teto no fim', () => {
    for (const a of CATALOG.agents) expect(full.agentFirstHire[a.id], a.id).toBeDefined()
    expect(full.finalDiscount).toBeLessThanOrEqual(DISCOUNT_CAP)
    expect(full.finalDiscount).toBeGreaterThanOrEqual(DISCOUNT_CAP * 0.6)
    expect(full.discountAtStage.quantum_facility ?? 0).toBeLessThan(DISCOUNT_CAP * 0.8)
  })

  it('poucas melhorias ficam sem comprar', () => {
    expect(CATALOG.upgrades.filter((u) => !full.upgradeAt[u.id]).length).toBeLessThanOrEqual(3)
  })

  // 0 cliques/s (até 110 min) e 5 cliques/s (mínimo 55 min) são medidos por CLIQUE_REPORT=1 (tests/clique-m2.test.ts); aqui só a verificação barata.
  it('10 cliques/s não cai abaixo de 50 min (A-09)', () => {
    const fast = simulateCurve(CATALOG, { clicksPerSecond: 10 })
    expect(fast.reachedMega).toBe(true)
    expect(fast.seconds / 60).toBeGreaterThanOrEqual(50)
  }, 60_000)

  it.skipIf(!process.env.CURVA_REPORT)('sensibilidade (relatório)', () => {
    const over = (f: (c: Catalog) => void) => {
      const c = structuredClone(CATALOG)
      f(c)
      return c
    }
    const late = (e: { baseCost: number }) => e.baseCost > 130_000
    const mk = (k: number): [string, (c: Catalog) => void][] => {
      const p = k > 1 ? '+20%' : '-20%'
      return [
        [`custo dos equipamentos tardios ${p}`, (c) => c.equipment.filter(late).forEach((e) => (e.baseCost *= k))],
        [`produção dos equipamentos tardios ${p}`, (c) => c.equipment.filter(late).forEach((e) => (e.baseProduction *= k))],
        [`bônus de produção dos agentes ${p}`, (c) => c.agents.forEach((a) => { if (a.primary.kind === 'globalProductionPercent') a.primary.value *= k })],
        [`custos dos agentes ${p}`, (c) => c.agents.forEach((a) => { a.baseCost *= k; a.levelBaseCost *= k })],
        [`bônus de produção das melhorias ${p}`, (c) => c.upgrades.forEach((u) => { if (u.effect.kind === 'globalProductionPercent') u.effect.value *= k })],
        [`custos das melhorias ${p}`, (c) => c.upgrades.forEach((u) => { if (u.cost > 400) u.cost *= k })],
        [`desconto (agentes e melhorias) ${p}`, (c) => { c.agents.forEach((a) => { if (a.primary.kind === 'costDiscountPercent') a.primary.value *= k }); c.upgrades.forEach((u) => { if (u.effect.kind === 'costDiscountPercent') u.effect.value *= k }) }],
        [`bônus de clique ${p}`, (c) => { c.upgrades.forEach((u) => { if (u.effect.kind === 'clickFlat' || u.effect.kind === 'clickPercent') u.effect.value *= k }); c.agents.forEach((a) => { if (a.primary.kind === 'clickPercent') a.primary.value *= k }) }],
      ]
    }
    const rows = [`\nSensibilidade (base ${fmtTime(full.seconds)}):`]
    for (const [name, f] of [...mk(1.2), ...mk(0.8)]) {
      const r = simulateCurve(over(f))
      rows.push(`${name.padEnd(46)} Mega ${fmtTime(r.reachedMega ? r.seconds : undefined).padStart(9)}  (${r.reachedMega ? ((r.seconds / full.seconds - 1) * 100).toFixed(1) : '?'}%)`)
    }
    const nb = simulateCurve(CATALOG, { useAgents: false, useUpgrades: false })
    const na = simulateCurve(CATALOG, { useAgents: false })
    const nu = simulateCurve(CATALOG, { useUpgrades: false })
    rows.push(`sem agentes nem melhorias: ${fmtTime(nb.seconds)}; só melhorias: ${fmtTime(na.seconds)}; só agentes: ${fmtTime(nu.seconds)}`)
    out(rows.join('\n'))
  }, 900_000)
})
