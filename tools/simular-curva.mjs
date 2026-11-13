// Simulação integrada da curva (T-031): comprador guloso com 1 clique/s, equipamentos, agentes
// (contratar e evoluir) e melhorias comuns, do início até Mega Corporation (1e18 gerados).
// Compara com a linha de base sem agentes nem melhorias. Lê os catálogos por regex. Provisório.
// Aproximação rápida (analítica, sem o motor): a referência da curva é tests/curva-m2.test.ts, que usa o GameEngine
// real e protege o alvo de 64 a 86 min. Aqui valem os tetos da D-13 (desconto 50 pp, crítico 25%).
// Uso: node tools/simular-curva.mjs
import { readFileSync } from 'node:fs'
const num = (s) => Number(String(s).replace(/_/g, ''))
const read = (f) => readFileSync(new URL(`../src/core/catalog/${f}`, import.meta.url), 'utf8')
const CRIT = { chance: 0.05, mult: 5 }

const equipment = [...read('equipment.ts').matchAll(/id: '(\w+)',[\s\S]*?baseCost: ([\d_]+),\s*costGrowth: ([\d.]+),\s*baseProduction: ([\d_.]+),\s*unlock: ([^\n]+)/g)].map((m) => ({
  id: m[1], cost: num(m[2]), growth: Number(m[3]), prod: num(m[4]),
  unlock: m[5].includes('always') ? 0 : num(m[5].match(/amount: ([\d_.e+]+)/)[1]),
}))
const stages = [...read('stages.ts').matchAll(/id: '(\w+)',.*?requirement: \{ kind: '(\w+)'(?:, amount: ([\de.+]+))?/g)].map((m, i) => ({
  id: m[1], order: i, amount: m[2] === 'always' ? 0 : Number(m[3]),
}))
const stageOrder = Object.fromEntries(stages.map((s) => [s.id, s.order]))
const agents = [...read('agents.ts').matchAll(/id: '(\w+)',[\s\S]*?baseCost: ([\d_]+),\s*costGrowth: ([\d.]+),\s*levelBaseCost: ([\d_]+),\s*levelCostGrowth: ([\d.]+),\s*primary: \{ kind: '(\w+)', value: ([\d.]+) \},[\s\S]*?bonusGrowthPerLevel: ([\d.]+),\s*unlock: \{ kind: 'stageReached', stage: '(\w+)'/g)].map((m) => ({
  id: m[1], cost: num(m[2]), growth: Number(m[3]), lvCost: num(m[4]), lvGrowth: Number(m[5]), kind: m[6], value: Number(m[7]), perLevel: Number(m[8]), stage: stageOrder[m[9]],
}))
const upgrades = [...read('upgrades.ts').matchAll(/id: '(\w+)'.*?cost: ([\d_.e+]+), effect: \{ kind: '(\w+)', value: ([\d_.e+]+) \}, unlockBytesEarnedInRun: ([\d_.e+]+)/g)].map((m) => ({
  id: m[1], cost: num(m[2]), kind: m[3], value: num(m[4]), unlock: num(m[5]),
}))

const unit = (base, g, n, d) => Math.max(1, Math.floor(base * g ** n * Math.max(0, 1 - d / 100) + 1e-6))

function run({ useAgents, useUpgrades, limit = 1e18, discountCap = 50, skip = [], scale = {} }) {
  const S = { t: 0, bytes: 0, earned: 0, eq: Object.fromEntries(equipment.map((e) => [e.id, 0])), ag: Object.fromEntries(agents.map((a) => [a.id, { n: 0, l: 0 }])), up: new Set() }
  const log = { stage: {}, agent: {}, level: [], upgrade: {}, discountAtStage: {}, buys: [] }
  const stageIdx = () => { let i = 0; for (const s of stages) if (S.earned >= s.amount) i = s.order; return i }
  const effects = (kind) => {
    let a = 0, u = 0
    for (const g of agents) { const x = S.ag[g.id]; if (g.kind === kind && x.n) a += g.value * (scale[g.id] ?? 1) * x.n * (1 + g.perLevel * (x.l - 1)) }
    for (const g of upgrades) if (g.kind === kind && S.up.has(g.id)) u += g.value
    return a + u
  }
  const view = () => {
    const p0 = equipment.reduce((s, e) => s + S.eq[e.id] * e.prod, 0)
    const mult = 1 + effects('globalProductionPercent') / 100
    const click = (1 + effects('clickFlat')) * (1 + effects('clickPercent') / 100) * mult
    const pc = Math.min(0.25, CRIT.chance + effects('criticalChancePercent') / 100)
    const income = p0 * mult + click * (1 + pc * (CRIT.mult + effects('criticalMultiplier') - 1)) // 1 clique/s
    const d = Math.min(discountCap, effects('costDiscountPercent'))
    // Renda efetiva: o desconto equivale a mais renda para quem só gasta em itens com desconto.
    return { income, d, eff: income / Math.max(0.05, 1 - Math.min(d, 95) / 100) }
  }
  const candidates = () => {
    const v = view(), si = stageIdx(), out = []
    const trial = (apply, undo, cost, kind, id) => {
      apply(); const w = view(); undo()
      const gain = w.eff - v.eff
      if (gain > 0) out.push({ kind, id, cost, gain, pay: cost / gain })
    }
    for (const e of equipment) if (S.earned >= e.unlock) trial(() => S.eq[e.id]++, () => S.eq[e.id]--, unit(e.cost, e.growth, S.eq[e.id], v.d), 'eq', e.id)
    if (useAgents) for (const g of agents) {
      if (si < g.stage || skip.includes(g.id)) continue
      const x = S.ag[g.id]
      trial(() => { x.n++; if (!x.l) x.l = 1 }, () => { x.n--; if (x.n === 0) x.l = 0 }, unit(g.cost, g.growth, x.n, v.d), 'hire', g.id)
      if (x.n) trial(() => x.l++, () => x.l--, unit(g.lvCost, g.lvGrowth, x.l - 1, v.d), 'level', g.id)
    }
    if (useUpgrades) for (const g of upgrades) if (!S.up.has(g.id) && S.earned >= g.unlock) trial(() => S.up.add(g.id), () => S.up.delete(g.id), g.cost, 'up', g.id)
    return { v, out }
  }
  const marks = () => {
    for (const s of stages) if (log.stage[s.id] === undefined && S.earned >= s.amount) { log.stage[s.id] = S.t; log.discountAtStage[s.id] = view().d }
  }
  const thresholds = () => [...equipment.map((e) => e.unlock), ...stages.map((s) => s.amount), ...upgrades.map((u) => u.unlock)].filter((x) => x > S.earned)
  marks()
  let lastBuy = 0, guard = 0
  while (S.earned < limit && S.t < 4e8 && guard++ < 400000) {
    const { v, out } = candidates()
    if (!out.length) break
    out.sort((a, b) => a.pay - b.pay)
    const best = out[0]
    const dt = Math.max(0, best.cost - S.bytes) / v.income
    const next = Math.min(Infinity, ...thresholds()) // próximo limiar de desbloqueio
    const dtEv = (next - S.earned) / v.income
    if (dtEv < dt) { S.t += dtEv; S.bytes += dtEv * v.income; S.earned += dtEv * v.income; marks(); continue }
    S.t += dt; S.bytes += dt * v.income; S.earned += dt * v.income
    S.bytes -= best.cost
    if (best.kind === 'eq') S.eq[best.id]++
    else if (best.kind === 'up') { S.up.add(best.id); log.upgrade[best.id] = { t: S.t, pay: best.pay, cost: best.cost } }
    else if (best.kind === 'hire') { const x = S.ag[best.id]; x.n++; if (!x.l) x.l = 1; log.agent[best.id] ??= { t: S.t, pay: best.pay, cost: best.cost } }
    else { S.ag[best.id].l++; log.level.push({ id: best.id, t: S.t, pay: best.pay }) }
    log.buys.push({ t: S.t, gap: S.t - lastBuy, kind: best.kind, id: best.id }); lastBuy = S.t
    marks()
  }
  log.total = S.t
  log.final = { agents: S.ag, d: view().d, up: S.up.size, income: view().income }
  return log
}

const fmt = (s) => (s == null ? '-' : s < 120 ? `${s.toFixed(0)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : s < 172800 ? `${(s / 3600).toFixed(1)} h` : `${(s / 86400).toFixed(1)} d`)
const base = run({ useAgents: false, useUpgrades: false })
const full = run({ useAgents: true, useUpgrades: true })
const onlyUp = run({ useAgents: false, useUpgrades: true })
const onlyAg = run({ useAgents: true, useUpgrades: false })

console.log('Estágio            Base   Só melh.  Só agentes  Completo  Compl./base  Desconto')
let prev = 0
for (const s of stages) {
  const f = full.stage[s.id]
  const jump = prev > 0 && f / prev > 2.6 ? '  <-- salto' : ''
  console.log(`${s.id.padEnd(18)} ${fmt(base.stage[s.id]).padStart(8)} ${fmt(onlyUp.stage[s.id]).padStart(9)} ${fmt(onlyAg.stage[s.id]).padStart(10)} ${fmt(f).padStart(9)} ${(f / base.stage[s.id] || 0).toFixed(2).padStart(10)} ${full.discountAtStage[s.id]?.toFixed(1).padStart(8)}%${jump}`)
  prev = f
}
console.log('\nAgente          1a contratação   custo   retorno')
for (const a of agents) { const x = full.agent[a.id]; console.log(`${a.id.padEnd(14)} ${fmt(x?.t).padStart(10)} ${x ? x.cost.toExponential(1).padStart(9) : '-'} ${fmt(x?.pay).padStart(10)}`) }
console.log('\nMelhoria               quando    custo   retorno')
for (const u of upgrades) { const x = full.upgrade[u.id]; console.log(`${u.id.padEnd(22)} ${fmt(x?.t).padStart(8)} ${u.cost.toExponential(1).padStart(8)} ${fmt(x?.pay).padStart(9)}${x && x.pay > full.total - x.t ? '  (não se paga até o fim)' : ''}`) }
const lv = {}
for (const l of full.level) (lv[l.id] ??= []).push(l)
console.log('\nEvoluções: ' + agents.map((a) => `${a.id} x${(lv[a.id] ?? []).length}`).join(', '))
console.log('Contratados no fim: ' + agents.map((a) => `${a.id}=${full.final.agents[a.id].n}(nv ${full.final.agents[a.id].l})`).join(', '))
console.log(`Desconto final: ${full.final.d.toFixed(1)}%  Melhorias compradas: ${full.final.up}/${upgrades.length}`)
const gaps = [...full.buys].sort((a, b) => b.gap - a.gap).slice(0, 6)
console.log('\nMaiores esperas entre compras: ' + gaps.map((g) => `${fmt(g.gap)} até ${g.id} em ${fmt(g.t)}`).join('; '))
for (const [name, o] of [['desconto limitado a 50%', { discountCap: 50 }], ['desconto limitado a 25%', { discountCap: 25 }], ['sem ATLAS_CORE', { skip: ['atlas_core'] }], ['sem agentes de produção global (KAI e NEO)', { skip: ['kai_ver_3', 'neo_gen_5'] }], ['sem KAI, NEO e desconto limitado a 25%', { skip: ['kai_ver_3', 'neo_gen_5'], discountCap: 25 }], ['KAI e NEO a 1/10 e desconto limitado a 25%', { scale: { kai_ver_3: 0.1, neo_gen_5: 0.1 }, discountCap: 25 }], ['KAI e NEO com 1/10 do valor', { scale: { kai_ver_3: 0.1, neo_gen_5: 0.1 } }], ['KAI e NEO com 1/20 do valor', { scale: { kai_ver_3: 0.05, neo_gen_5: 0.05 } }], ['KAI e NEO com 1/40 do valor', { scale: { kai_ver_3: 0.025, neo_gen_5: 0.025 } }]]) {
  const r = run({ useAgents: true, useUpgrades: true, ...o })
  console.log(`Variante ${name}: Mega ${fmt(r.total)}; estágios ` + stages.slice(1).map((s) => fmt(r.stage[s.id])).join(' / ') + `; desconto final ${r.final.d.toFixed(1)}%`)
}
console.log(`\nAté Mega Corporation: base ${fmt(base.total)}; completo ${fmt(full.total)}; só melhorias ${fmt(onlyUp.total)}; só agentes ${fmt(onlyAg.total)}`)
