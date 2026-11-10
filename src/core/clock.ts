import type { GameEngine } from './engine'

export interface ClockDeps {
  now: () => number
  setInterval: (fn: () => void, ms: number) => unknown
  clearInterval: (handle: unknown) => void
}

export const TICK_INTERVAL_MS = 100

// Dirige o núcleo pelo relógio real, separado de requestAnimationFrame: a cena
// pode cair de FPS ou parar sem afetar a economia (GDD 19.1 e 24.4).
// Lacunas longas (aba em segundo plano) entram no advance normal; o cálculo
// offline com limite de 8 h fica com o Offline System (M4).
export function startClock(engine: GameEngine, deps: ClockDeps): () => void {
  let last = deps.now()
  const handle = deps.setInterval(() => {
    const now = deps.now()
    const dt = now - last
    last = now
    engine.advance(dt)
  }, TICK_INTERVAL_MS)
  return () => deps.clearInterval(handle)
}

export const browserClock: ClockDeps = {
  now: () => performance.now(),
  setInterval: (fn, ms) => globalThis.setInterval(fn, ms),
  clearInterval: (handle) => globalThis.clearInterval(handle as number),
}
