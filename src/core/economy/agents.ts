import type { AgentDef, Catalog, Effect } from '../catalog/types'
import type { Decimal } from '../decimal'
import type { GameState } from '../state'
import { unitCost } from './cost'
import { isRequirementMet, type EquipmentStatus } from './requirements'

export type AgentStatus = EquipmentStatus

// unlocked se unlock atendido; senão revealed se reveal atendido; senão hidden.
export function agentStatus(def: AgentDef, state: GameState, catalog: Catalog): AgentStatus {
  if (isRequirementMet(def.unlock, state, catalog)) return 'unlocked'
  if (isRequirementMet(def.reveal, state, catalog)) return 'revealed'
  return 'hidden'
}

// Custo de contratar o agente de índice `count`: C_base × k^N, com desconto (GDD 4.5 e 4.6).
export function agentHireCost(def: AgentDef, count: number, discountPercent: Decimal | number = 0): Decimal {
  return unitCost(def.baseCost, def.costGrowth, count, discountPercent)
}

// Custo de evoluir do `level` atual para o seguinte: levelBaseCost × levelCostGrowth^(level − 1).
// O nível mínimo é 1; mesmas regras de arredondamento e desconto da contratação.
export function agentLevelCost(def: AgentDef, level: number, discountPercent: Decimal | number = 0): Decimal {
  return unitCost(def.levelBaseCost, def.levelCostGrowth, Math.max(0, level - 1), discountPercent)
}

// Bônus de um agente por efeito, primário primeiro e secundários na ordem do catálogo (D-10):
// valor × quantidade × (1 + bonusGrowthPerLevel × (nível − 1)). Pura e ainda não ligada
// à fórmula global (T-021). Sem agentes, todos os valores são 0.
export function agentBonus(def: AgentDef, count: number, level: number): Effect[] {
  const factor = Math.max(0, count) * (1 + def.bonusGrowthPerLevel * (Math.max(1, level) - 1))
  return [def.primary, ...def.secondary].map((e) => ({ ...e, value: e.value * factor }))
}
