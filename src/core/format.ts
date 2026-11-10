import { D, type Decimal, type DecimalSource } from './decimal'

export type Locale = 'pt-BR' | 'en'

// Base 1000 (GDD 4.7). RB e QB são os prefixos SI ronna e quetta, usados
// provisoriamente até a definição das unidades fictícias posteriores a Yotta.
// Acima da última unidade, a formatação passa para notação científica.
export const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB'] as const

const MAX_FRACTION_DIGITS = 2

const formatters = new Map<Locale, Intl.NumberFormat>()

function fractionFormatter(locale: Locale): Intl.NumberFormat {
  let f = formatters.get(locale)
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: MAX_FRACTION_DIGITS,
      useGrouping: false,
    })
    formatters.set(locale, f)
  }
  return f
}

// Trunca em vez de arredondar: o saldo exibido nunca pode superar o real,
// senão o jogador veria um custo "alcançável" com o botão ainda desabilitado.
function truncate(value: number): number {
  const factor = 10 ** MAX_FRACTION_DIGITS
  return Math.floor(value * factor + 1e-9) / factor
}

function formatSmall(value: number, locale: Locale): string {
  return fractionFormatter(locale).format(truncate(value))
}

function formatScientific(value: Decimal, locale: Locale): string {
  return `${formatSmall(value.mantissa, locale)}e${value.exponent}`
}

export function formatBytes(source: DecimalSource, locale: Locale): string {
  const value = D(source)
  if (value.sign() < 0) return `-${formatBytes(value.neg(), locale)}`
  if (value.lt(1000)) return `${formatSmall(value.toNumber(), locale)} ${BYTE_UNITS[0]}`

  const unitIndex = Math.floor(value.exponent / 3)
  if (unitIndex >= BYTE_UNITS.length) return `${formatScientific(value, locale)} ${BYTE_UNITS[0]}`

  const scaled = value.div(D(10).pow(unitIndex * 3)).toNumber()
  return `${formatSmall(scaled, locale)} ${BYTE_UNITS[unitIndex]}`
}

export function formatBytesPerSecond(source: DecimalSource, locale: Locale): string {
  return `${formatBytes(source, locale)}/s`
}

const SCIENTIFIC_COUNT_THRESHOLD = 1e15

// Contagens sem unidade (Quantum Cores, quantidades, cliques).
export function formatCount(source: DecimalSource, locale: Locale): string {
  const value = D(source)
  if (value.abs().gte(SCIENTIFIC_COUNT_THRESHOLD)) return formatScientific(value, locale)
  return new Intl.NumberFormat(locale, { maximumFractionDigits: MAX_FRACTION_DIGITS }).format(truncate(value.toNumber()))
}
