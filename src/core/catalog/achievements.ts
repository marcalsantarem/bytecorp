import type { MessageKey } from '../../i18n/pt-BR'
import type { StageId } from './types'

// Conquistas (GDD 11), orientadas a dados: o catálogo cresce sem mudar o sistema. O catálogo
// real (cerca de 40, D-20) é da T-078; aqui só os tipos.

export type AchievementCategory = 'production' | 'clicks' | 'equipment' | 'agents' | 'reboots' | 'quantum' | 'milestones'

export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond'

// Cada requisito tem um valor-alvo (`amount`) e uma leitura do progresso atual (progression/achievements.ts).
export type AchievementRequirement =
  | { kind: 'bytesEarnedAllTime'; amount: number }
  | { kind: 'bytesEarnedInRun'; amount: number }
  // Produção base por segundo (sem temporários), para um acelerador não destravar conquistas.
  | { kind: 'bytesPerSecond'; amount: number }
  | { kind: 'clicks'; amount: number }
  | { kind: 'criticalClicks'; amount: number }
  // Total de equipamentos da execução, ou de um equipamento (`equipment`).
  | { kind: 'equipmentTotal'; amount: number }
  | { kind: 'equipmentOwned'; equipment: string; amount: number }
  // Agentes contratados (soma) e tipos diferentes contratados.
  | { kind: 'agentsTotal'; amount: number }
  | { kind: 'agentsDistinct'; amount: number }
  // Nível coletivo de um agente (`agent`) ou o maior nível entre todos.
  | { kind: 'agentLevel'; amount: number; agent?: string }
  | { kind: 'reboots'; amount: number }
  // Cores que o Reboot daria agora (cores numa única execução).
  | { kind: 'coresInRun'; amount: number }
  // Cores acumulados: em mãos mais os gastos na árvore.
  | { kind: 'quantumCoresTotal'; amount: number }
  // Soma dos níveis comprados na árvore, ou o nível de um nó (`node`).
  | { kind: 'quantumNodeLevels'; amount: number }
  | { kind: 'quantumNode'; node: string; amount: number }
  | { kind: 'treeResets'; amount: number }
  | { kind: 'stageReached'; stage: StageId }
  // Tempo de jogo com o jogo aberto, em ms (GDD 11.5).
  | { kind: 'playTimeMs'; amount: number }

export type AchievementReward =
  | { kind: 'bytes'; amount: number }
  // Bônus temporário de 15, 30 ou 60 min (GDD 11.6); id `achievement:<id>`, multiplicativo entre si.
  | { kind: 'temporaryBonus'; multiplier: number; minutes: 15 | 30 | 60 }
  | { kind: 'quantumCores'; amount: number }

export interface AchievementDef {
  id: string
  category: AchievementCategory
  rarity: AchievementRarity
  requirement: AchievementRequirement
  // Secreta: o progresso e os textos ficam ocultos até desbloquear; só a pista aparece.
  secret?: boolean
  nameKey: MessageKey
  descriptionKey: MessageKey
  hintKey?: MessageKey
  reward: AchievementReward
}
