import { useCallback, useSyncExternalStore } from 'react'
import type { GameEngine } from '../core/engine'

// Re-renderiza no máximo uma vez por quadro, a partir dos eventos do núcleo.
// A interface só lê o estado; mudanças passam pelos métodos do engine.
export function useEngineRevision(engine: GameEngine): number {
  const subscribe = useCallback(
    (notify: () => void) => {
      let frame = 0
      const schedule = () => {
        if (frame === 0) frame = requestAnimationFrame(() => ((frame = 0), notify()))
      }
      const offs = [engine.events.on('tick', schedule), engine.events.on('click', schedule), engine.events.on('stateReplaced', schedule)]
      return () => {
        offs.forEach((off) => off())
        if (frame !== 0) cancelAnimationFrame(frame)
      }
    },
    [engine],
  )
  return useSyncExternalStore(subscribe, () => engine.revision)
}
