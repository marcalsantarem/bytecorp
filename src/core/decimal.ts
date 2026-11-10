import Decimal, { type DecimalSource } from 'break_infinity.js'

// Representação numérica única do jogo. Valores passam de 1e24 (Yotta),
// além do inteiro seguro de Number, então toda grandeza econômica usa Decimal.
export { Decimal }
export type { DecimalSource }

export const D = (value: DecimalSource): Decimal => new Decimal(value)

export const ZERO = D(0)
export const ONE = D(1)

// break_infinity.toNumber() calcula mantissa × 10^expoente em ponto flutuante, então
// D(23295443).toNumber() devolve 23295442.999999996 (defeito D-1). Para magnitudes até
// 1e15, relê o par mantissa/expoente como literal decimal, que o parser arredonda
// corretamente; fora dessa faixa mantém o comportamento original.
const originalToNumber = Decimal.prototype.toNumber
Decimal.prototype.toNumber = function toNumber(this: Decimal): number {
  const e = this.exponent
  if (e >= 0 && e <= 15 && Number.isFinite(this.mantissa)) return parseFloat(`${this.mantissa}e${e}`)
  return originalToNumber.call(this)
}
