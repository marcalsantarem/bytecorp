import type { ClockDeps } from '../core/clock'
import type { GameEngine } from '../core/engine'
import type { OfflineResult } from '../core/progression/offline'

// Mínimo de ausência para creditar (evita pagar recargas rápidas), em ms.
export const MIN_OFFLINE_MS = 60_000
// Ausência acima disto é tratada como este valor (relógio absurdo).
export const MAX_AWAY_MS = 365 * 24 * 3_600_000

// Resultado offline ainda não mostrado. A interface montada depois do bootstrap
// lê com consume(); créditos seguidos antes da leitura são somados.
export class PendingOffline {
  private result: OfflineResult | null = null

  set(next: OfflineResult): void {
    const prev = this.result
    this.result = prev
      ? {
          awayMs: prev.awayMs + next.awayMs,
          creditedMs: prev.creditedMs + next.creditedMs,
          cappedMs: prev.cappedMs + next.cappedMs,
          bytes: prev.bytes.add(next.bytes),
          segments: [...prev.segments, ...next.segments],
        }
      : next
  }

  peek(): OfflineResult | null {
    return this.result
  }

  // Entrega o resultado pendente uma única vez.
  consume(): OfflineResult | null {
    const r = this.result
    this.result = null
    return r
  }

  clear(): void {
    this.result = null
  }
}

// Ausência saneada: NaN ou negativa = 0; acima de 1 ano = 1 ano.
export function sanitizeAway(awayMs: number): number {
  if (!Number.isFinite(awayMs) || awayMs <= 0) return 0
  return Math.min(awayMs, MAX_AWAY_MS)
}

// Credita a ausência no engine (uma chamada de applyOffline) e a deixa pendente.
// Devolve null se for menor ou igual a zero ou menor que o mínimo.
export function creditAway(
  engine: GameEngine,
  pending: PendingOffline,
  awayMs: number,
  minMs: number = MIN_OFFLINE_MS,
): OfflineResult | null {
  const away = sanitizeAway(awayMs)
  if (away <= 0 || away < minMs) return null
  const result = engine.applyOffline(away)
  pending.set(result)
  return result
}

// Relógio do motor que não avança em lacunas longas (suspensão do aparelho ou
// aba congelada): a lacuna é entregue a onGap, que a credita como offline.
// Assim o clock nunca paga a mesma ausência que o Offline System paga.
export function guardedClock(base: ClockDeps, thresholdMs: number, onGap: (gapMs: number) => void): ClockDeps {
  let rawLast = base.now()
  let virtual = rawLast
  return {
    ...base,
    now: () => {
      const raw = base.now()
      const dt = raw - rawLast
      rawLast = raw
      if (dt >= thresholdMs) onGap(dt)
      else if (dt > 0) virtual += dt
      return virtual
    },
  }
}

// Mede a ocultação da aba pelo relógio de parede e credita só o que o motor não
// avançou nem já creditou como lacuna.
export class AwayTracker {
  private hiddenAt: number | null = null
  private playAtHide = 0
  private creditedSinceHide = 0

  constructor(
    private readonly engine: GameEngine,
    private readonly pending: PendingOffline,
    private readonly now: () => number = Date.now,
    private readonly minMs: number = MIN_OFFLINE_MS,
  ) {}

  hidden(): void {
    if (this.hiddenAt !== null) return
    this.hiddenAt = this.now()
    this.playAtHide = this.engine.state.stats.playTimeMs
    this.creditedSinceHide = 0
  }

  // Lacuna creditada pelo guardedClock enquanto oculta.
  gapCredited(awayMs: number): void {
    if (this.hiddenAt !== null) this.creditedSinceHide += awayMs
  }

  // Devolve o resultado creditado, ou null se nada foi creditado.
  visible(): OfflineResult | null {
    if (this.hiddenAt === null) return null
    const wall = sanitizeAway(this.now() - this.hiddenAt)
    this.hiddenAt = null
    if (wall <= this.minMs) return null
    const advanced = this.engine.state.stats.playTimeMs - this.playAtHide
    const deficit = wall - advanced - this.creditedSinceHide
    return creditAway(this.engine, this.pending, deficit, 1)
  }
}
