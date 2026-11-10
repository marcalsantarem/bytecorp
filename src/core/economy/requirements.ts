import type { Catalog, EquipmentDef, Requirement } from '../catalog/types'
import type { GameState } from '../state'

export type EquipmentStatus = 'hidden' | 'revealed' | 'unlocked'

export function isRequirementMet(req: Requirement, state: GameState, catalog: Catalog): boolean {
  switch (req.kind) {
    case 'always':
      return true
    case 'bytesEarnedInRun':
      return state.run.bytesEarned.gte(req.amount)
    case 'stageReached': {
      const order = (id: string) => catalog.stages.find((s) => s.id === id)?.order
      const current = order(state.run.stage)
      const target = order(req.stage)
      return current !== undefined && target !== undefined && current >= target
    }
    case 'equipmentOwned':
      return (state.run.equipment[req.equipment] ?? 0) >= req.count
  }
}

// unlocked se unlock atendido; senão revealed se reveal atendido; senão hidden.
export function equipmentStatus(def: EquipmentDef, state: GameState, catalog: Catalog): EquipmentStatus {
  if (isRequirementMet(def.unlock, state, catalog)) return 'unlocked'
  if (isRequirementMet(def.reveal, state, catalog)) return 'revealed'
  return 'hidden'
}
