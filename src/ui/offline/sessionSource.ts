import type { PendingOffline as SessionPending } from '../../app/offlineSession'
import type { GameEngine } from '../../core/engine'
import type { OfflineSource } from './useOfflineSummary'

// Adapta o pendente da sessão (AG03) à fonte da interface, com o estágio anterior e as concessões.
// Notifica ao receber offlineApplied (inclui a volta à aba) e ao ficar visível.
export function sessionOfflineSource(engine: GameEngine, offline: SessionPending): OfflineSource {
  return {
    peek: () => offline.peekDetail(),
    consume: () => offline.consumeDetail(),
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
