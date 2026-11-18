import type { AchievementReward } from './catalog/achievements'
import type { StageId } from './catalog/types'
import type { Decimal } from './decimal'
import type { OfflineResult } from './progression/offline'
import type { AcceleratorItem, TemporaryBonus } from './state'

// Eventos internos do núcleo. Interface, cena e áudio reagem a eles sem que o
// núcleo conheça nenhuma dessas camadas (GDD 24.2).
export interface GameEvents {
  // Disparado ao fim de cada chamada de advance, com o tempo de jogo processado.
  tick: { dtMs: number }
  click: { gained: Decimal; critical: boolean }
  purchase: { id: string; quantity: number; cost: Decimal }
  agentHired: { id: string; count: number; cost: Decimal }
  agentLeveled: { id: string; level: number; cost: Decimal }
  upgradePurchased: { id: string; cost: number }
  // Um por estágio avançado, em ordem (GDD 1.2). Não é emitido ao carregar um estado.
  stageChanged: { from: StageId; to: StageId }
  // Depois de um Reboot aceito: cores ganhos e número do reboot (contagem já incrementada).
  reboot: { reward: number; rebootNumber: number }
  // Um nível de nó Quantum comprado: nível novo e custo em cores.
  quantumNodePurchased: { id: string; level: number; cost: number }
  // Reset da árvore: cores devolvidos, custo cobrado e número do reset (contagem já incrementada).
  quantumTreeReset: { refunded: number; cost: number; resetNumber: number }
  // Ganho offline creditado (applyOffline), com o resultado completo.
  offlineApplied: OfflineResult
  // Itens concedidos por um marco (D-16); `source` é a chave (`stage:<id>`, `reboot:<n>`).
  acceleratorGranted: { source: string; items: AcceleratorItem[] }
  // Ativado: `replaced` diz o que houve com o anterior ('none' se não havia).
  acceleratorActivated: { item: AcceleratorItem; replaced: 'none' | 'discard' | 'store' }
  // O ativo substituído voltou ao inventário com o tempo restante.
  acceleratorStored: { item: AcceleratorItem }
  // Faltam `remainingMs` (limiar configurável) para o ativo acabar.
  acceleratorEnding: { item: AcceleratorItem; remainingMs: number }
  acceleratorExpired: { item: AcceleratorItem }
  temporaryBonusGranted: { bonus: TemporaryBonus; refreshed: boolean }
  temporaryBonusExpired: { bonus: TemporaryBonus }
  // Conquista desbloqueada, com a recompensa já entregue (GDD 11).
  achievementUnlocked: { id: string; reward: AchievementReward }
  // Passo ativo do tutorial mudou (GDD 16.1); `step` null = nenhum passo exibido.
  // `completed`: ids concluídos nesta mudança. `reason`: 'progress' (ação de jogo ou ativação),
  // 'completed' / 'stepDismissed' (API) ou 'tutorialDismissed' (tutorial inteiro dispensado).
  tutorialChanged: {
    step: string | null
    previous: string | null
    completed: string[]
    reason: 'progress' | 'completed' | 'stepDismissed' | 'tutorialDismissed'
  }
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
