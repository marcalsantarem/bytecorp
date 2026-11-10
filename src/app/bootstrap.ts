import { CATALOG } from '../core/catalog'
import { browserClock, startClock } from '../core/clock'
import { GameEngine } from '../core/engine'
import { AUTOSAVE_INTERVAL_MS, SaveManager } from '../core/save/saveManager'
import type { KeyValueStorage } from '../core/save/storage'
import { createInitialState } from '../core/state'

export type BootResult =
  | { kind: 'ready'; session: GameSession }
  | { kind: 'corrupt'; detail: string; startNewGame: () => Promise<GameSession> }

export interface GameSession {
  engine: GameEngine
  stop: () => void
}

// Liga núcleo, relógio e salvamento. Único ponto que conhece as três peças.
export async function boot(storage: KeyValueStorage): Promise<BootResult> {
  const saves = new SaveManager(storage)
  const loaded = await saves.load()

  if ('kind' in loaded) return { kind: 'ready', session: start(new GameEngine(CATALOG), saves) }
  if (loaded.ok) {
    // A produção durante a ausência (GDD 14) entra com o Offline System no M4.
    return { kind: 'ready', session: start(new GameEngine(CATALOG, loaded.state), saves) }
  }
  return {
    kind: 'corrupt',
    detail: `${loaded.reason}: ${loaded.detail}`,
    startNewGame: async () => {
      await saves.clear()
      return start(new GameEngine(CATALOG, createInitialState(Date.now())), saves)
    },
  }
}

function start(engine: GameEngine, saves: SaveManager): GameSession {
  const stopClock = startClock(engine, browserClock)
  const save = () => {
    saves.save(engine).catch((error: unknown) => console.error('Falha ao salvar', error))
  }
  const autosave = setInterval(save, AUTOSAVE_INTERVAL_MS)
  const onHide = () => {
    if (document.visibilityState === 'hidden') save()
  }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', save)

  return {
    engine,
    stop: () => {
      stopClock()
      clearInterval(autosave)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', save)
      save()
    },
  }
}
