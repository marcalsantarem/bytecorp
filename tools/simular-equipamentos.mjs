// Estimativa do tempo até a primeira unidade de cada equipamento do M1.
// 1 clique/s (1 Byte por clique), compra gananciosa: entre os itens desbloqueados,
// compra o de menor custo/produção quando possível. Valores provisórios.
// Uso: node tools/simular-equipamentos.mjs   (lê src/core/catalog/equipment.ts por regex)
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/core/catalog/equipment.ts', import.meta.url), 'utf8')
const num = (s) => Number(s.replace(/_/g, ''))
const items = [...src.matchAll(/id: '(\w+)',[\s\S]*?baseCost: ([\d_]+),\s*costGrowth: ([\d.]+),\s*baseProduction: ([\d_.]+),\s*unlock: ([^\n]+)/g)].map((m) => ({
  id: m[1], cost: num(m[2]), growth: Number(m[3]), prod: num(m[4]),
  unlock: m[5].includes('always') ? 0 : num(m[5].match(/amount: ([\d_]+)/)[1]),
  owned: 0, first: null,
}))

let t = 0, bytes = 0, earned = 0
const rate = () => 1 + items.reduce((a, i) => a + i.owned * i.prod, 0)
const price = (i) => i.cost * i.growth ** i.owned
while (items.some((i) => i.first === null) && t < 1e7) {
  const open = items.filter((i) => earned >= i.unlock)
  const best = open.sort((a, b) => price(a) / a.prod - price(b) / b.prod)[0]
  const r = rate()
  // Próximo evento: acumular para a compra, ou o próximo desbloqueio que muda a escolha.
  const need = Math.max(0, price(best) - bytes)
  let dt = need / r
  const next = items.filter((i) => earned < i.unlock).map((i) => (i.unlock - earned) / r)
  const nextUnlock = Math.min(Infinity, ...next)
  if (nextUnlock < dt) { dt = nextUnlock; t += dt; bytes += dt * r; earned += dt * r; continue }
  t += dt; bytes += dt * r; earned += dt * r
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
