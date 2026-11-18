import type { MessageKey } from '../../i18n/pt-BR'
import type { StageId } from './types'

// Conquistas (GDD 11), orientadas a dados: o catálogo cresce sem mudar o sistema. Tipos aqui;
// o catálogo do M5 (T-078, D-20) fica no fim do arquivo.

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

// Catálogo do M5 (T-078, D-20): 42 conquistas, 7 categorias, 4 raridades, 6 secretas.
// Alvos e recompensas medidos contra a curva em docs/AG07/conquistas-m5.md e
// tests/conquistas-m5.test.ts. Bytes de recompensa valem cerca de 5 a 20 s da produção do
// momento; bônus temporários da run 1 ficam em 1,1x; Cores só em Quantum, Mega e Diamond.
type Def = Omit<AchievementDef, 'nameKey' | 'descriptionKey' | 'hintKey'>

// Chaves `achievement.<id>.name|desc|hint`; o validateCatalog confere que existem.
const keys = (id: string, secret?: boolean) => ({
  nameKey: `achievement.${id}.name` as MessageKey,
  descriptionKey: `achievement.${id}.desc` as MessageKey,
  ...(secret ? { hintKey: `achievement.${id}.hint` as MessageKey } : {}),
})

const bytes = (amount: number): AchievementReward => ({ kind: 'bytes', amount })
const bonus = (multiplier: number, minutes: 15 | 30 | 60): AchievementReward => ({ kind: 'temporaryBonus', multiplier, minutes })
const cores = (amount: number): AchievementReward => ({ kind: 'quantumCores', amount })
const HOUR = 3_600_000

const DEFS: Def[] = [
  // Produção
  { id: 'prod_bytes_1k', category: 'production', rarity: 'bronze', requirement: { kind: 'bytesEarnedAllTime', amount: 1e3 }, reward: bytes(50) },
  { id: 'prod_bytes_1m', category: 'production', rarity: 'bronze', requirement: { kind: 'bytesEarnedAllTime', amount: 1e6 }, reward: bytes(5e4) },
  { id: 'prod_bps_1g', category: 'production', rarity: 'silver', requirement: { kind: 'bytesPerSecond', amount: 1e9 }, reward: bytes(5e9) },
  { id: 'prod_bps_1t', category: 'production', rarity: 'silver', requirement: { kind: 'bytesPerSecond', amount: 1e12 }, reward: bytes(5e12) },
  { id: 'prod_bps_1p', category: 'production', rarity: 'gold', requirement: { kind: 'bytesPerSecond', amount: 1e15 }, reward: bonus(1.1, 15) },
  { id: 'prod_all_10e', category: 'production', rarity: 'diamond', requirement: { kind: 'bytesEarnedAllTime', amount: 1e19 }, reward: cores(10) },

  // Cliques
  { id: 'clicks_100', category: 'clicks', rarity: 'bronze', requirement: { kind: 'clicks', amount: 100 }, reward: bytes(50) },
  { id: 'clicks_1000', category: 'clicks', rarity: 'silver', requirement: { kind: 'clicks', amount: 1000 }, reward: bonus(1.05, 15) },
  { id: 'clicks_5000', category: 'clicks', rarity: 'gold', requirement: { kind: 'clicks', amount: 5000 }, reward: bonus(1.05, 15) },
  { id: 'clicks_15000', category: 'clicks', rarity: 'diamond', requirement: { kind: 'clicks', amount: 15000 }, reward: cores(10) },
  { id: 'crit_10', category: 'clicks', rarity: 'bronze', requirement: { kind: 'criticalClicks', amount: 10 }, reward: bytes(100) },
  { id: 'crit_500', category: 'clicks', rarity: 'silver', requirement: { kind: 'criticalClicks', amount: 500 }, reward: bonus(1.05, 15) },
  { id: 'crit_2000', category: 'clicks', rarity: 'gold', secret: true, requirement: { kind: 'criticalClicks', amount: 2000 }, reward: bonus(1.1, 15) },

  // Equipamentos
  { id: 'eq_10', category: 'equipment', rarity: 'bronze', requirement: { kind: 'equipmentTotal', amount: 10 }, reward: bytes(50) },
  { id: 'eq_100', category: 'equipment', rarity: 'bronze', requirement: { kind: 'equipmentTotal', amount: 100 }, reward: bytes(5e6) },
  { id: 'eq_500', category: 'equipment', rarity: 'silver', requirement: { kind: 'equipmentTotal', amount: 500 }, reward: bytes(5e12) },
  { id: 'eq_1000', category: 'equipment', rarity: 'gold', requirement: { kind: 'equipmentTotal', amount: 1000 }, reward: bytes(3e14) },
  { id: 'eq_router_50', category: 'equipment', rarity: 'silver', secret: true, requirement: { kind: 'equipmentOwned', equipment: 'home_router', amount: 50 }, reward: bonus(1.1, 15) },

  // Agentes
  { id: 'agent_first', category: 'agents', rarity: 'bronze', requirement: { kind: 'agentsTotal', amount: 1 }, reward: bytes(5e5) },
  { id: 'agents_distinct_3', category: 'agents', rarity: 'silver', requirement: { kind: 'agentsDistinct', amount: 3 }, reward: bonus(1.1, 15) },
  { id: 'agents_distinct_5', category: 'agents', rarity: 'gold', requirement: { kind: 'agentsDistinct', amount: 5 }, reward: bytes(8e13) },
  { id: 'agent_level_25', category: 'agents', rarity: 'gold', requirement: { kind: 'agentLevel', amount: 25 }, reward: bytes(4e13) },
  { id: 'spectre_10', category: 'agents', rarity: 'silver', secret: true, requirement: { kind: 'agentLevel', agent: 'spectre_x', amount: 10 }, reward: bonus(1.1, 15) },

  // Reboots
  { id: 'cores_run_10', category: 'reboots', rarity: 'bronze', requirement: { kind: 'coresInRun', amount: 10 }, reward: bytes(5e7) },
  { id: 'reboot_1', category: 'reboots', rarity: 'bronze', requirement: { kind: 'reboots', amount: 1 }, reward: bonus(1.1, 15) },
  { id: 'cores_run_50', category: 'reboots', rarity: 'silver', requirement: { kind: 'coresInRun', amount: 50 }, reward: bytes(1e14) },
  { id: 'reboot_5', category: 'reboots', rarity: 'gold', requirement: { kind: 'reboots', amount: 5 }, reward: bonus(1.1, 30) },
  { id: 'reboot_10', category: 'reboots', rarity: 'diamond', requirement: { kind: 'reboots', amount: 10 }, reward: cores(10) },

  // Quantum
  { id: 'q_first', category: 'quantum', rarity: 'bronze', requirement: { kind: 'quantumNodeLevels', amount: 1 }, reward: cores(1) },
  { id: 'q_levels_25', category: 'quantum', rarity: 'silver', requirement: { kind: 'quantumNodeLevels', amount: 25 }, reward: cores(3) },
  { id: 'q_cores_500', category: 'quantum', rarity: 'gold', requirement: { kind: 'quantumCoresTotal', amount: 500 }, reward: cores(5) },
  { id: 'q_singularity', category: 'quantum', rarity: 'gold', secret: true, requirement: { kind: 'quantumNode', node: 'alpha_singularity', amount: 1 }, reward: cores(5) },
  { id: 'q_reset', category: 'quantum', rarity: 'silver', secret: true, requirement: { kind: 'treeResets', amount: 1 }, reward: cores(2) },
  { id: 'q_levels_50', category: 'quantum', rarity: 'diamond', requirement: { kind: 'quantumNodeLevels', amount: 50 }, reward: cores(5) },

  // Marcos corporativos e tempo de jogo
  { id: 'stage_garage', category: 'milestones', rarity: 'bronze', requirement: { kind: 'stageReached', stage: 'garage_company' }, reward: bytes(500) },
  { id: 'stage_startup', category: 'milestones', rarity: 'bronze', requirement: { kind: 'stageReached', stage: 'startup_lab' }, reward: bytes(5e4) },
  { id: 'stage_datacenter', category: 'milestones', rarity: 'silver', requirement: { kind: 'stageReached', stage: 'data_center' }, reward: bytes(2e7) },
  { id: 'stage_corporate', category: 'milestones', rarity: 'silver', requirement: { kind: 'stageReached', stage: 'corporate_network' }, reward: bytes(1e11) },
  { id: 'stage_quantum', category: 'milestones', rarity: 'gold', requirement: { kind: 'stageReached', stage: 'quantum_facility' }, reward: bytes(3e13) },
  { id: 'stage_mega', category: 'milestones', rarity: 'gold', requirement: { kind: 'stageReached', stage: 'mega_corporation' }, reward: cores(3) },
  { id: 'play_1h', category: 'milestones', rarity: 'bronze', secret: true, requirement: { kind: 'playTimeMs', amount: HOUR }, reward: bonus(1.1, 15) },
  { id: 'play_24h', category: 'milestones', rarity: 'diamond', requirement: { kind: 'playTimeMs', amount: 24 * HOUR }, reward: cores(25) },
]

export const ACHIEVEMENTS: AchievementDef[] = DEFS.map((d) => ({ ...d, ...keys(d.id, d.secret) }))
