import type { MessageKey } from '../../i18n/pt-BR'

// Catálogos orientados a dados (GDD 6.2 e 27): adicionar conteúdo é adicionar
// entradas, nunca alterar os sistemas. Textos são sempre chaves de i18n.
// Valores numéricos ficam como number no catálogo e viram Decimal nos sistemas.

export type StageId =
  | 'solo_hacker'
  | 'garage_company'
  | 'startup_lab'
  | 'data_center'
  | 'corporate_network'
  | 'quantum_facility'
  | 'mega_corporation'

export type EquipmentCategory = 'networking' | 'processing' | 'storage' | 'cooling' | 'infrastructure'

// Condição de desbloqueio ou de visibilidade. A lista cresce por união discriminada.
export type Requirement =
  | { kind: 'always' }
  | { kind: 'bytesEarnedInRun'; amount: number }
  | { kind: 'stageReached'; stage: StageId }
  | { kind: 'equipmentOwned'; equipment: string; count: number }

export interface StageDef {
  id: StageId
  order: number
  nameKey: MessageKey
  requirement: Requirement
}

export interface EquipmentDef {
  id: string
  category: EquipmentCategory
  nameKey: MessageKey
  descriptionKey: MessageKey
  icon: string
  baseCost: number
  costGrowth: number
  baseProduction: number
  unlock: Requirement
  // Exibido como "próximo do desbloqueio" quando esta condição é atendida e unlock ainda não (GDD 6.3).
  reveal: Requirement
}

// Efeitos de bônus. Combinados pela fórmula global de três camadas (D-10, production.ts):
// valores em pontos percentuais somam dentro da camada.
export type Effect =
  | { kind: 'globalProductionPercent'; value: number }
  | { kind: 'clickFlat'; value: number }
  | { kind: 'clickPercent'; value: number }
  | { kind: 'costDiscountPercent'; value: number }
  | { kind: 'criticalChancePercent'; value: number }
  | { kind: 'criticalMultiplier'; value: number }
  | { kind: 'offlineCapHours'; value: number }

export interface AgentDef {
  id: string
  nameKey: MessageKey
  descriptionKey: MessageKey
  specialtyKey: MessageKey
  icon: string
  baseCost: number
  costGrowth: number
  levelBaseCost: number
  levelCostGrowth: number
  primary: Effect
  secondary: Effect[]
  // Crescimento percentual dos bônus por nível coletivo.
  bonusGrowthPerLevel: number
  unlock: Requirement
  reveal: Requirement
}

export interface UpgradeDef {
  id: string
  nameKey: MessageKey
  descriptionKey: MessageKey
  icon: string
  cost: number
  effect: Effect
  // GDD 8.4: melhorias comuns desbloqueiam pelo total de Bytes gerados na execução.
  unlockBytesEarnedInRun: number
}

export type QuantumPath = 'alpha' | 'beta' | 'gamma'

export interface QuantumNodeDef {
  id: string
  path: QuantumPath
  nameKey: MessageKey
  descriptionKey: MessageKey
  icon: string
  baseCost: number
  costGrowth: number
  effectPerLevel: Effect
  prerequisites: string[]
  maxLevel: number | null
  position: { x: number; y: number }
}

export interface Catalog {
  stages: StageDef[]
  equipment: EquipmentDef[]
  agents: AgentDef[]
  upgrades: UpgradeDef[]
  quantumNodes: QuantumNodeDef[]
}
