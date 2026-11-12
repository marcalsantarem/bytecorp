import type { GameEngine } from '../core/engine'
import type { SaveManager } from '../core/save/saveManager'

export const PURCHASE_SAVE_DELAY_MS = 300

export interface PersistenceControl {
  // Grava já, em fila: gravações nunca se sobrepõem e a última a começar vence.
  // A promessa resolve quando esta gravação termina (falhas são registradas, não propagadas).
  saveNow: () => Promise<void>
  // Cancela o agendamento e remove a inscrição em purchase.
  dispose: () => void
}

// Salva após compras (Bíblia 21.2), juntando compras seguidas em uma só gravação.
export function createPersistence(
  engine: GameEngine,
  saves: SaveManager,
  delayMs: number = PURCHASE_SAVE_DELAY_MS,
): PersistenceControl {
  let queue: Promise<void> = Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | undefined

  const saveNow = (): Promise<void> => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    queue = queue
      .then(() => saves.save(engine))
      .catch((error: unknown) => console.error('Falha ao salvar', error))
    return queue
  }

  const off = engine.events.on('purchase', () => {
    if (timer !== undefined) return
    timer = setTimeout(saveNow, delayMs)
  })

  return {
    saveNow,
    dispose: () => {
      off()
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    },
  }
}
