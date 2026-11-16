import { D, type Decimal } from '../decimal'

// Produção offline (GDD 14): crédito por intervalos de produção constante, nunca
// segundo a segundo. Função pura; o relógio e o save ficam fora do núcleo (T-069).

// Trecho da ausência com um multiplicador próprio (acelerador ou bônus que expira).
export interface OfflineSegment {
  durationMs: number
  multiplier: number
}

export interface OfflineResult {
  // Tempo ausente informado (já saneado: negativo ou NaN = 0).
  awayMs: number
  // Tempo efetivamente creditado: min(awayMs, limite).
  creditedMs: number
  // Quanto passou do limite e não foi creditado.
  cappedMs: number
  // Bytes creditados.
  bytes: Decimal
  // Trechos creditados, em ordem, já cortados no limite; o que sobra além dos
  // segmentos informados entra como um trecho final de multiplicador 1.
  segments: OfflineSegment[]
}

function sane(ms: number): number {
  return Number.isFinite(ms) && ms > 0 ? ms : 0
}

// Os segmentos cobrem o início da ausência, em ordem; o restante corre com
// multiplicador 1. O limite corta o fim da ausência (o crédito é o início).
export function computeOffline(
  productionPerSecond: Decimal,
  awayMs: number,
  capMs: number,
  segments: readonly OfflineSegment[] = [],
): OfflineResult {
  const away = sane(awayMs)
  const credited = Math.min(away, sane(capMs))
  let left = credited
  let bytes = D(0)
  const used: OfflineSegment[] = []
  const take = (durationMs: number, multiplier: number): void => {
    const d = Math.min(left, sane(durationMs))
    if (d <= 0) return
    const m = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 0
    bytes = bytes.add(productionPerSecond.mul(m).mul(d / 1000))
    used.push({ durationMs: d, multiplier: m })
    left -= d
  }
  for (const s of segments) take(s.durationMs, s.multiplier)
  take(left, 1)
  return { awayMs: away, creditedMs: credited, cappedMs: away - credited, bytes, segments: used }
}
