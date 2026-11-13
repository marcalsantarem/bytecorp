// Tempo de retorno estimado das melhorias comuns. Reaproveita a simulação gananciosa de
// equipamentos (1 clique/s, sem melhorias) e, no instante em que o total gerado atinge o
// desbloqueio de cada melhoria, calcula o retorno com a taxa daquele momento. Provisório.
// Uso: node tools/simular-melhorias.mjs
import { readFileSync } from 'node:fs'
const num = (s) => Number(s.replace(/_/g, ''))
const read = (f) => readFileSync(new URL(`../src/core/catalog/${f}`, import.meta.url), 'utf8')
const items = [...read('equipment.ts').matchAll(/id: '(\w+)',[\s\S]*?baseCost: ([\d_]+),\s*costGrowth: ([\d.]+),\s*baseProduction: ([\d_.]+),\s*unlock: ([^\n]+)/g)].map((m) => ({
  cost: num(m[2]), growth: Number(m[3]), prod: num(m[4]),
  unlock: m[5].includes('always') ? 0 : num(m[5].match(/amount: ([\d_]+)/)[1]), owned: 0,
}))
const ups = [...read('upgrades.ts').matchAll(/id: '(\w+)'.*?cost: ([\d_.e]+), effect: \{ kind: '(\w+)', value: ([\d.]+) \}, unlockBytesEarnedInRun: ([\d_.e]+)/g)].map((m) => ({
  id: m[1], cost: num(m[2]), kind: m[3], value: Number(m[4]), unlock: num(m[5]), t: null, rate: 0,
}))
let t = 0, bytes = 0, earned = 0
const rate = () => 1 + items.reduce((a, i) => a + i.owned * i.prod, 0)
const price = (i) => i.cost * i.growth ** i.owned
const mark = () => { for (const u of ups) if (u.t === null && earned >= u.unlock) { u.t = t; u.rate = rate() } }
mark()
while (ups.some((u) => u.t === null) && t < 1e9) {
  const open = items.filter((i) => earned >= i.unlock)
  const best = open.sort((a, b) => price(a) / a.prod - price(b) / b.prod)[0]
  const r = rate()
  let dt = Math.max(0, price(best) - bytes) / r
  const ev = [...items.filter((i) => earned < i.unlock).map((i) => (i.unlock - earned) / r), ...ups.filter((u) => u.t === null).map((u) => (u.unlock - earned) / r)]
  const e = Math.min(Infinity, ...ev)
  const buy = e >= dt
  if (!buy) dt = e
  t += dt; bytes += dt * r; earned += dt * r; mark()
  if (buy) { bytes -= price(best); best.owned++ }
}
const fmt = (s) => (s < 120 ? `${s.toFixed(0)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : s < 172800 ? `${(s / 3600).toFixed(1)} h` : `${(s / 86400).toFixed(1)} d`)
console.log('id                  tipo                    custo  desbloqueio-em  retorno')
let bonus = 0, flat = 0, pct = 0
for (const u of ups) {
  // Ganho em B/s equivalente. Global: taxa * valor/(100+bônus anterior). Clique: 1 clique/s.
  // Clique: valor (1+fixo)*(1+%) por clique, 1 clique/s, em ordem de custo. Desconto: parte da taxa que deixa de ser gasta (taxa * v/100).
  let gain
  if (u.kind === 'globalProductionPercent') { gain = u.rate * u.value / (100 + bonus); bonus += u.value }
  else if (u.kind === 'clickFlat') { gain = u.value * (1 + pct / 100); flat += u.value }
  else if (u.kind === 'clickPercent') { gain = (1 + flat) * u.value / 100; pct += u.value }
  else gain = u.rate * u.value / 100
  console.log(`${u.id.padEnd(19)} ${u.kind.padEnd(24)} ${u.cost.toExponential(1).padStart(7)} ${fmt(u.t).padStart(12)} ${fmt(u.cost / gain).padStart(10)}`)
}
