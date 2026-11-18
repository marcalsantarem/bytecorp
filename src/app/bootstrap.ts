import { CATALOG } from '../core/catalog'
import { browserClock, startClock, type ClockDeps } from '../core/clock'
import { GameEngine } from '../core/engine'
import { AUTOSAVE_INTERVAL_MS, SaveManager } from '../core/save/saveManager'
import type { KeyValueStorage } from '../core/save/storage'
import { createInitialState } from '../core/state'
import { AwayTracker, creditAway, guardedClock, MIN_OFFLINE_MS, PendingOffline, sanitizeAway } from './offlineSession'
import { createPersistence } from './purchaseSave'
import { resetGame } from './resetGame'

export type BootResult =
  // hasSave: havia save válido ao abrir (a tela inicial só oferece Continuar nesse caso).
  | { kind: 'ready'; session: GameSession; hasSave: boolean }
  | { kind: 'corrupt'; detail: string; startNewGame: () => Promise<GameSession> }

export interface GameSession {
  engine: GameEngine
  // Resultado offline ainda não mostrado (carga do save ou volta à aba): a UI lê com consume().
  offline: PendingOffline
  stop: () => void
  // Reinicia o jogo e o save por completo (configurações ficam intactas).
  reset: () => Promise<void>
}

// Visibilidade da página, injetável para teste.
export interface PageLifecycle {
  isHidden: () => boolean
  onVisibilityChange: (cb: () => void) => () => void
  onPageHide: (cb: () => void) => () => void
}

export const browserLifecycle: PageLifecycle = {
  isHidden: () => document.visibilityState === 'hidden',
  onVisibilityChange: (cb) => {
    document.addEventListener('visibilitychange', cb)
    return () => document.removeEventListener('visibilitychange', cb)
  },
  onPageHide: (cb) => {
    window.addEventListener('pagehide', cb)
    return () => window.removeEventListener('pagehide', cb)
  },
}

export interface BootDeps {
  // Relógio de parede (ms); mede a ausência.
  now?: () => number
  // Relógio do motor.
  clock?: ClockDeps
  lifecycle?: PageLifecycle
  // Ausência mínima para creditar offline.
  minOfflineMs?: number
}

// Liga núcleo, relógio e salvamento. Único ponto que conhece as três peças.
export async function boot(storage: KeyValueStorage, deps: BootDeps = {}): Promise<BootResult> {
  const now = deps.now ?? Date.now
  const minMs = deps.minOfflineMs ?? MIN_OFFLINE_MS
  const saves = new SaveManager(storage, now)
  const loaded = await saves.load()

  if ('kind' in loaded) return { kind: 'ready', session: start(new GameEngine(CATALOG), saves, deps), hasSave: false }
  if (loaded.ok) {
    const engine = new GameEngine(CATALOG, loaded.state)
    const session = start(engine, saves, deps)
    // Ausência negativa (relógio retrocedido) conta como 0; em ambos os casos o
    // savedAt é regravado já, para a mesma ausência não ser creditada de novo.
    const rawAway = now() - loaded.savedAt
    const credited = creditAway(engine, session.offline, rawAway, minMs)
    if (credited || sanitizeAway(rawAway) === 0) await session.persistence.saveNow()
    return { kind: 'ready', session, hasSave: true }
  }
  return {
    kind: 'corrupt',
    detail: `${loaded.reason}: ${loaded.detail}`,
    startNewGame: async () => {
      await saves.clear()
      return start(new GameEngine(CATALOG, createInitialState(now())), saves, deps)
    },
  }
}

type StartedSession = GameSession & { persistence: ReturnType<typeof createPersistence> }

function start(engine: GameEngine, saves: SaveManager, deps: BootDeps): StartedSession {
  const now = deps.now ?? Date.now
  const minMs = deps.minOfflineMs ?? MIN_OFFLINE_MS
  const lifecycle = deps.lifecycle ?? browserLifecycle
  const offline = new PendingOffline()
  const persistence = createPersistence(engine, saves)
  const away = new AwayTracker(engine, offline, now, minMs)
  if (lifecycle.isHidden()) away.hidden()

  const clock = guardedClock(deps.clock ?? browserClock, minMs, (gapMs) => {
    // Lacuna do relógio do motor (suspensão): vira ganho offline.
    const result = creditAway(engine, offline, gapMs, minMs)
    if (result) {
      away.gapCredited(result.awayMs)
      void persistence.saveNow()
    }
  })
  const stopClock = startClock(engine, clock)
  const save = () => void persistence.saveNow()
  const autosave = setInterval(save, AUTOSAVE_INTERVAL_MS)
  const onVisibility = () => {
    if (lifecycle.isHidden()) {
      away.hidden()
      save()
    } else if (away.visible()) {
      save()
    }
  }
  const offVisibility = lifecycle.onVisibilityChange(onVisibility)
  const offPageHide = lifecycle.onPageHide(save)

  return {
    engine,
    offline,
    persistence,
    reset: async () => {
      offline.clear()
      await resetGame(engine, persistence)
    },
    stop: () => {
      stopClock()
      clearInterval(autosave)
      offVisibility()
      offPageHide()
      save()
      persistence.dispose()
    },
  }
}
