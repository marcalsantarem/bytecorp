import type { PendingOffline as SessionPending } from '../../app/offlineSession'
import type { GameEngine } from '../../core/engine'
import type { OfflineSource } from './useOfflineSummary'

// Adapta o pendente da sessão (AG03) à fonte da interface. stageBefore não é
// guardado pela sessão, então a seção "novo estágio" não aparece.
// Notifica ao receber offlineApplied (inclui a volta à aba) e ao ficar visível.
export function sessionOfflineSource(engine: GameEngine, offline: SessionPending): OfflineSource {
  return {
    peek: () => {
      const result = offline.peek()
      return result ? { result } : null
    },
    consume: () => {
      const result = offline.consume()
      return result ? { result } : null
    },
    subscribe: (listener) => {
      // O evento sai antes de a sessão registrar o pendente (creditAway); adia a leitura.
      const offEvent = engine.events.on('offlineApplied', () => queueMicrotask(listener))
      const onVisible = () => {
        if (document.visibilityState === 'visible') listener()
      }
      document.addEventListener('visibilitychange', onVisible)
      return () => {
        offEvent()
        document.removeEventListener('visibilitychange', onVisible)
      }
    },
  }
}
