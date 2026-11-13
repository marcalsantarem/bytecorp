import type { Catalog, StageDef } from '../catalog/types'
import type { GameState } from '../state'
import { isRequirementMet } from './requirements'

// Estágios em ordem crescente de `order` (GDD 1.2). Calculado uma vez por quem
// precisa consultar o próximo estágio com frequência.
export function orderedStages(catalog: Catalog): StageDef[] {
  return [...catalog.stages].sort((a, b) => a.order - b.order)
}

// Índice do estágio mais alto já garantido a partir de `index`: sobe enquanto o
// requisito do estágio seguinte estiver atendido. Olha um estágio por vez e
// escreve em state.run.stage a cada degrau, porque o requisito de um estágio
// pode depender do anterior (stageReached). Nunca regride.
export function advanceStageIndex(
  stages: readonly StageDef[],
  index: number,
  state: GameState,
  catalog: Catalog,
  onChange?: (from: StageDef, to: StageDef) => void,
): number {
  let i = index
  for (;;) {
    const from = stages[i]
    const to = stages[i + 1]
    if (!from || !to || !isRequirementMet(to.requirement, state, catalog)) return i
    state.run.stage = to.id
    i++
    onChange?.(from, to)
  }
}
