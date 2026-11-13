import type { GameEngine } from '../core/engine'
import { createInitialState } from '../core/state'
import type { PersistenceControl } from './purchaseSave'

// Reinicia o jogo por completo: troca o estado por um inicial e grava já.
// A gravação entra na fila da persistência, depois de qualquer uma pendente, e lê
// engine.state ao rodar; um agendamento de compra é cancelado por saveNow.
// As configurações (chave settings) não são tocadas.
export async function resetGame(
  engine: GameEngine,
  persistence: Pick<PersistenceControl, 'saveNow'>,
  now: number = Date.now(),
): Promise<void> {
  engine.replaceState(createInitialState(now))
  await persistence.saveNow()
}
