import Decimal, { type DecimalSource } from 'break_infinity.js'

// Representação numérica única do jogo. Valores passam de 1e24 (Yotta),
// além do inteiro seguro de Number, então toda grandeza econômica usa Decimal.
export { Decimal }
export type { DecimalSource }

export const D = (value: DecimalSource): Decimal => new Decimal(value)

export const ZERO = D(0)
export const ONE = D(1)
