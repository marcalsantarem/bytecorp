// Estimativa do tempo até a primeira unidade de cada equipamento e até cada estágio.
// 1 clique/s (1 Byte por clique), compra gananciosa: entre os itens desbloqueados,
// compra o de menor custo/produção quando possível. Valores provisórios.
// Uso: node tools/simular-equipamentos.mjs   (lê equipment.ts e stages.ts por regex)
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/core/catalog/equipment.ts', import.meta.url), 'utf8')
const num = (s) => Number(s.replace(/_/g, ''))
const items = [...src.matchAll(/id: '(\w+)',[\s\S]*?baseCost: ([\d_]+),\s*costGrowth: ([\d.]+),\s*baseProduction: ([\d_.]+),\s*unlock: ([^\n]+)/g)].map((m) => ({
  id: m[1], cost: num(m[2]), growth: Number(m[3]), prod: num(m[4]),
  unlock: m[5].includes('always') ? 0 : num(m[5].match(/amount: ([\d_]+)/)[1]),
  owned: 0, first: null,
}))

const stagesSrc = readFileSync(new URL('../src/core/catalog/stages.ts', import.meta.url), 'utf8')
const stages = [...stagesSrc.matchAll(/id: '(\w+)',.*?requirement: \{ kind: '(\w+)'(?:, amount: ([\de.+]+))?/g)].map((m) => ({
  id: m[1], amount: m[2] === 'always' ? 0 : Number(m[3]), at: null,
}))

let t = 0, bytes = 0, earned = 0
const markStages = () => { for (const st of stages) if (st.at === null && earned >= st.amount) st.at = t }
markStages()
const rate = () => 1 + items.reduce((a, i) => a + i.owned * i.prod, 0)
const price = (i) => i.cost * i.growth ** i.owned
while ((items.some((i) => i.first === null) || stages.some((st) => st.at === null)) && t < 1e8) {
  const open = items.filter((i) => earned >= i.unlock)
  if (!open.length) break
  const best = open.sort((a, b) => price(a) / a.prod - price(b) / b.prod)[0]
  const r = rate()
  // Próximo evento: acumular para a compra, ou o próximo desbloqueio que muda a escolha.
  const need = Math.max(0, price(best) - bytes)
  let dt = need / r
  const next = items.filter((i) => earned < i.unlock).map((i) => (i.unlock - earned) / r)
  const nextUnlock = Math.min(Infinity, ...next)
  const pending = stages.filter((st) => st.at === null).map((st) => (st.amount - earned) / r)
  const nextStage = Math.min(Infinity, ...pending)
  if (nextStage < dt && nextStage <= nextUnlock) { dt = nextStage; t += dt; bytes += dt * r; earned += dt * r; markStages(); continue }
  if (nextUnlock < dt) { dt = nextUnlock; t += dt; bytes += dt * r; earned += dt * r; markStages(); continue }
  t += dt; bytes += dt * r; earned += dt * r; markStages()
  bytes -= price(best); best.owned++
  if (best.first === null) best.first = t
}
const fmt = (s) => (s < 120 ? `${s.toFixed(0)} s` : s < 7200 ? `${(s / 60).toFixed(1)} min` : `${(s / 3600).toFixed(1)} h`)
let prev = 0
for (const i of [...items].sort((a, b) => a.first - b.first)) {
  const jump = prev > 0 && i.first / prev > 6 ? '  <-- salto' : ''
  console.log(`${i.id.padEnd(16)} ${fmt(i.first).padStart(9)}${jump}`)
  prev = i.first
}

console.log('\nEstágio             Bytes na run     Tempo')
prev = 0
for (const st of stages) {
  const jump = prev > 0 && st.at / prev > 6 ? '  <-- salto' : ''
  console.log(`${st.id.padEnd(18)} ${st.amount.toExponential(0).padStart(14)} ${fmt(st.at).padStart(9)}${jump}`)
  prev = st.at
}
