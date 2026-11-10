import type { Decimal } from './decimal'

// Eventos internos do núcleo. Interface, cena e áudio reagem a eles sem que o
// núcleo conheça nenhuma dessas camadas (GDD 24.2).
export interface GameEvents {
  // Disparado ao fim de cada chamada de advance, com o tempo de jogo processado.
  tick: { dtMs: number }
  click: { gained: Decimal; critical: boolean }
  stateReplaced: Record<string, never>
}

type Handler<T> = (payload: T) => void

export class EventBus<Events extends object> {
  private handlers = new Map<keyof Events, Set<Handler<never>>>()

  on<K extends keyof Events>(type: K, handler: Handler<Events[K]>): () => void {
    let set = this.handlers.get(type)
    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }
    set.add(handler as Handler<never>)
    return () => set.delete(handler as Handler<never>)
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const set = this.handlers.get(type)
    if (!set) return
    for (const handler of set) (handler as Handler<Events[K]>)(payload)
  }
}
