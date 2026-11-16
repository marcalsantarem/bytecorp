import type { Catalog } from '../catalog/types'
import type { GameState } from '../state'

// Pesos da fórmula de Quantum Cores (D-15), configuráveis para a QA do M3 ajustar.
export interface CoresRewardWeights {
  // Divisor e deslocamento de L = log10(bytesEarned) no termo quadrático.
  logDivisor: number
  logOffset: number
  // Cores por índice de estágio (0 = Solo Hacker).
  stageWeight: number
  // Melhorias comuns compradas por core.
  upgradesPerCore: number
}

export const DEFAULT_CORES_WEIGHTS: CoresRewardWeights = {
  logDivisor: 2,
  logOffset: 4,
  stageWeight: 1,
  upgradesPerCore: 4,
}

// Recompensa de Reboot em Quantum Cores (D-15):
// floor(((max(0, L - offset)) / divisor)^2) + índice do estágio x peso + floor(melhorias / 4),
// com L = log10(run.bytesEarned). Só olha a execução atual, nunca o saldo nem as estatísticas.
export function quantumCoresReward(
  state: GameState,
  catalog: Catalog,
  weights: CoresRewardWeights = DEFAULT_CORES_WEIGHTS,
): number {
  const { bytesEarned, stage, upgrades } = state.run
  const logEarned = bytesEarned.gt(1) ? bytesEarned.log10() : 0
  const term = Math.max(0, logEarned - weights.logOffset) / weights.logDivisor
  // Margem contra erro de ponto flutuante em potências exatas de 10 (L = 6 deve dar 1).
  const logPart = Math.floor(term * term + 1e-9)
  const stageIndex = catalog.stages.find((s) => s.id === stage)?.order ?? 0
  const stagePart = Math.floor(stageIndex * weights.stageWeight)
  const upgradePart = Math.floor(upgrades.length / weights.upgradesPerCore)
  return logPart + stagePart + upgradePart
}
