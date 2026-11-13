import type { Catalog, Effect, UpgradeDef } from '../catalog/types'
import type { GameState } from '../state'

export type UpgradeStatus = 'locked' | 'available' | 'purchased'

// purchased se comprada nesta execução; available se o total gerado na execução
// atingiu o requisito (nunca o saldo, GDD 8.4); senão locked.
export function upgradeStatus(def: UpgradeDef, state: GameState): UpgradeStatus {
  if (state.run.upgrades.includes(def.id)) return 'purchased'
  return state.run.bytesEarned.gte(def.unlockBytesEarnedInRun) ? 'available' : 'locked'
}

// Efeitos das melhorias compradas, na ordem do catálogo. A soma por tipo é da T-021.
export function activeUpgradeEffects(state: GameState, catalog: Catalog): Effect[] {
  return catalog.upgrades.filter((u) => state.run.upgrades.includes(u.id)).map((u) => u.effect)
}
