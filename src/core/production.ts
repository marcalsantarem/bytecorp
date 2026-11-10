import type { Catalog } from './catalog/types'
import { D, type Decimal } from './decimal'
import type { GameState } from './state'

// Produção passiva consolidada (GDD 4.2): todas as origens somam em uma base única
// e os bônus incidem sobre o total, sem multiplicadores separados por origem.
// bySource existe só para as estatísticas.
export interface ProductionBreakdown {
  bySource: { equipment: Decimal; agents: Decimal }
  base: Decimal
  multiplier: Decimal
  total: Decimal
}

// PENDENTE (CLAUDE.md, decisão 1): a combinação exata dos bônus. Até lá o
// multiplicador global é 1 e agentes não contribuem.
export function globalMultiplier(_state: GameState, _catalog: Catalog): Decimal {
  return D(1)
}

export function computeProduction(state: GameState, catalog: Catalog): ProductionBreakdown {
  let equipment = D(0)
  for (const def of catalog.equipment) {
    const owned = state.run.equipment[def.id] ?? 0
    if (owned > 0) equipment = equipment.add(D(def.baseProduction).mul(owned))
  }
  const agents = D(0)
  const base = equipment.add(agents)
  const multiplier = globalMultiplier(state, catalog)
  return { bySource: { equipment, agents }, base, multiplier, total: base.mul(multiplier) }
}

// Soma dos efeitos clickFlat ativos. Ainda não há fontes (M2); hoje é 0.
export function clickFlatBonus(_state: GameState, _catalog: Catalog): Decimal {
  return D(0)
}

// Soma dos efeitos clickPercent ativos, em pontos percentuais. Ainda não há fontes (M2); hoje é 0.
export function clickPercentBonus(_state: GameState, _catalog: Catalog): Decimal {
  return D(0)
}

// Valor de um clique sem crítico (GDD 5.5, passos 1 e 2): acréscimos fixos sobre
// o valor base, depois multiplicadores percentuais. O crítico (passo 3) incide
// sobre este valor e é aplicado em GameEngine.click.
export function computeClickValue(state: GameState, catalog: Catalog, baseClick: number): Decimal {
  const flat = D(baseClick).add(clickFlatBonus(state, catalog))
  const percent = clickPercentBonus(state, catalog).div(100).add(1)
  return flat.mul(percent).mul(globalMultiplier(state, catalog))
}
