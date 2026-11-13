import type { Catalog, Effect } from '../catalog/types'
import { D, type Decimal } from '../decimal'
import type { GameState } from '../state'
import { agentBonus } from './agents'
import { activeUpgradeEffects } from './upgrades'

export type EffectKind = Effect['kind']

// Soma dos valores de um tipo de efeito (bônus somam dentro da camada, D-10).
export function sumEffects(effects: readonly Effect[], kind: EffectKind): Decimal {
  let total = D(0)
  for (const e of effects) if (e.kind === kind) total = total.add(e.value)
  return total
}

// Efeitos de todos os agentes contratados (primário e secundários), já escalados
// por quantidade e nível coletivo.
export function activeAgentEffects(state: GameState, catalog: Catalog): Effect[] {
  const out: Effect[] = []
  for (const def of catalog.agents) {
    const entry = state.run.agents[def.id]
    if (entry && entry.count > 0) out.push(...agentBonus(def, entry.count, entry.level))
  }
  return out
}

export interface EffectsBySource {
  agents: Decimal
  upgrades: Decimal
}

// Soma de um tipo de efeito separada por origem, para o rastreio das estatísticas.
export function effectsBySource(state: GameState, catalog: Catalog, kind: EffectKind): EffectsBySource {
  return {
    agents: sumEffects(activeAgentEffects(state, catalog), kind),
    upgrades: sumEffects(activeUpgradeEffects(state, catalog), kind),
  }
}
