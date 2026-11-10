import { D, type Decimal } from '../decimal'

export type BuyMode = 'x1' | 'x10' | 'max'

// Limite de segurança para o MAX (loop de soma exata).
const MAX_BULK = 100_000

// Custo da unidade de índice n (n = quantidade já comprada): floor(C_base × k^n × (1 − d/100)),
// nunca menor que 1 Byte (GDD 4.3 e 4.6). O desconto incide em cada unidade.
export function unitCost(baseCost: number, growth: number, owned: number, discountPercent: Decimal | number = 0): Decimal {
  const factor = Math.max(0, 1 - D(discountPercent).toNumber() / 100)
  const raw = D(baseCost).mul(D(growth).pow(owned)).mul(factor).floor()
  return raw.lt(1) ? D(1) : raw
}

// Soma exata dos custos unitários de `quantity` unidades a partir de `owned`.
export function bulkCost(
  baseCost: number,
  growth: number,
  owned: number,
  quantity: number,
  discountPercent: Decimal | number = 0,
): Decimal {
  let total = D(0)
  for (let i = 0; i < quantity; i++) total = total.add(unitCost(baseCost, growth, owned + i, discountPercent))
  return total
}

// Maior quantidade q tal que bulkCost(q) <= balance. Estima por forma fechada e
// corrige com a soma exata, então nunca gasta mais que o saldo e q+1 não caberia.
export function maxAffordable(
  baseCost: number,
  growth: number,
  owned: number,
  balance: Decimal,
  discountPercent: Decimal | number = 0,
): number {
  const first = unitCost(baseCost, growth, owned, discountPercent)
  if (balance.lt(first)) return 0
  let q: number
  if (growth > 1) {
    // Série geométrica sobre o custo sem arredondamento: S = c0 (k^q − 1) / (k − 1).
    const est = balance.mul(growth - 1).div(first).add(1).log10() / Math.log10(growth)
    q = Number.isFinite(est) ? Math.max(1, Math.floor(est)) : 1
  } else {
    q = balance.div(first).floor().toNumber()
  }
  q = Math.min(q, MAX_BULK)
  while (q > 0 && bulkCost(baseCost, growth, owned, q, discountPercent).gt(balance)) q--
  while (q < MAX_BULK && bulkCost(baseCost, growth, owned, q + 1, discountPercent).lte(balance)) q++
  return q
}

// Quantidade comprável no modo, com o saldo atual. x1 e x10 são tudo ou nada:
// x10 compra 0 se não houver saldo para todas as dez.
export function purchasableQuantity(
  mode: BuyMode,
  baseCost: number,
  growth: number,
  owned: number,
  balance: Decimal,
  discountPercent: Decimal | number = 0,
): number {
  if (mode === 'max') return maxAffordable(baseCost, growth, owned, balance, discountPercent)
  const want = mode === 'x1' ? 1 : 10
  return bulkCost(baseCost, growth, owned, want, discountPercent).lte(balance) ? want : 0
}
