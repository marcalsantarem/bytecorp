import type { Catalog } from './catalog/types'
import { D, type Decimal } from './decimal'
import { effectsBySource, type EffectKind } from './economy'
import type { GameState } from './state'

// Produção passiva consolidada (GDD 4.2, D-10): todas as origens somam em uma base única
// e os bônus incidem sobre o total, em três camadas que se multiplicam entre si:
// P0 × (1 + Σ melhorias e agentes) × (1 + Σ quântico) × Π temporários.
export interface ProductionLayers {
  // Camada 1, em pontos percentuais, por origem.
  bonus: { agents: Decimal; upgrades: Decimal; total: Decimal }
  // Camada 2 (árvore Quantum), em pontos percentuais.
  quantum: Decimal
  // Camada 3: produto dos fatores temporários (1 sem nenhum ativo).
  temporary: Decimal
}

// bySource existe só para as estatísticas. Agentes não produzem Bytes próprios: agem
// só pelo bônus da camada 1, então bySource.agents é 0.
export interface ProductionBreakdown {
  bySource: { equipment: Decimal; agents: Decimal }
  base: Decimal
  layers: ProductionLayers
  // Multiplicador global combinado das três camadas (vale também para o clique).
  multiplier: Decimal
  total: Decimal
}

export interface LayerInputs {
  // Camadas 1 e 2 em pontos percentuais.
  layer1: Decimal | number
  quantum: Decimal | number
  temporaryFactors?: readonly (Decimal | number)[]
}

export function combineMultiplier(layers: LayerInputs): Decimal {
  let m = D(layers.layer1).div(100).add(1).mul(D(layers.quantum).div(100).add(1))
  for (const f of layers.temporaryFactors ?? []) m = m.mul(f)
  return m
}

// Função pura da fórmula global.
export function combineProduction(base: Decimal | number, layers: LayerInputs): Decimal {
  return D(base).mul(combineMultiplier(layers))
}

// Camada 2: soma dos efeitos quânticos em pontos percentuais. Sem fonte até a T-037.
export function quantumPercent(_state: GameState, _catalog: Catalog): Decimal {
  return D(0)
}

// Camada 3: fatores multiplicativos temporários (aceleradores, eventos). Sem fonte até M4/M5.
export function temporaryFactors(_state: GameState, _catalog: Catalog): Decimal[] {
  return []
}

export function productionLayers(state: GameState, catalog: Catalog): ProductionLayers {
  const { agents, upgrades } = effectsBySource(state, catalog, 'globalProductionPercent')
  const temporary = temporaryFactors(state, catalog).reduce((p, f) => p.mul(f), D(1))
  return {
    bonus: { agents, upgrades, total: agents.add(upgrades) },
    quantum: quantumPercent(state, catalog),
    temporary,
  }
}

function layersMultiplier(layers: ProductionLayers): Decimal {
  return combineMultiplier({
    layer1: layers.bonus.total,
    quantum: layers.quantum,
    temporaryFactors: [layers.temporary],
  })
}

export function globalMultiplier(state: GameState, catalog: Catalog): Decimal {
  return layersMultiplier(productionLayers(state, catalog))
}

export function computeProduction(state: GameState, catalog: Catalog): ProductionBreakdown {
  let equipment = D(0)
  for (const def of catalog.equipment) {
    const owned = state.run.equipment[def.id] ?? 0
    if (owned > 0) equipment = equipment.add(D(def.baseProduction).mul(owned))
  }
  const agents = D(0)
  const base = equipment.add(agents)
  const layers = productionLayers(state, catalog)
  const multiplier = layersMultiplier(layers)
  return { bySource: { equipment, agents }, base, layers, multiplier, total: base.mul(multiplier) }
}

function totalEffect(state: GameState, catalog: Catalog, kind: EffectKind): Decimal {
  const s = effectsBySource(state, catalog, kind)
  return s.agents.add(s.upgrades)
}

// Soma dos efeitos clickFlat de agentes e melhorias.
export function clickFlatBonus(state: GameState, catalog: Catalog): Decimal {
  return totalEffect(state, catalog, 'clickFlat')
}

// Tetos da D-13: desconto de custo acumulado em pontos percentuais e chance de crítico (0 a 1).
export const DEFAULT_MAX_COST_DISCOUNT_PERCENT = 50
export const DEFAULT_MAX_CRITICAL_CHANCE = 0.25

export interface CappedValue {
  // Soma bruta dos bônus, sem teto.
  raw: Decimal
  // Valor depois do teto (é o que vale nas contas).
  effective: Decimal
  capped: boolean
}

// Soma aditiva bruta dos efeitos costDiscountPercent, em pontos percentuais (GDD 4.6).
export function rawCostDiscountPercent(state: GameState, catalog: Catalog): Decimal {
  return totalEffect(state, catalog, 'costDiscountPercent')
}

// Desconto bruto e efetivo (com teto). Para a interface e as estatísticas.
export function costDiscountInfo(
  state: GameState,
  catalog: Catalog,
  max: number = DEFAULT_MAX_COST_DISCOUNT_PERCENT,
): CappedValue {
  const raw = rawCostDiscountPercent(state, catalog)
  const cap = D(Math.max(0, max))
  const capped = raw.gt(cap)
  return { raw, effective: capped ? cap : raw, capped }
}

// Desconto efetivo em pontos percentuais, limitado pelo teto. Vale para equipamentos e
// agentes (contratação e evolução), nunca para melhorias.
export function costDiscountPercent(
  state: GameState,
  catalog: Catalog,
  max: number = DEFAULT_MAX_COST_DISCOUNT_PERCENT,
): Decimal {
  return costDiscountInfo(state, catalog, max).effective
}

// Soma dos efeitos clickPercent, em pontos percentuais.
export function clickPercentBonus(state: GameState, catalog: Catalog): Decimal {
  return totalEffect(state, catalog, 'clickPercent')
}

export interface CappedChance {
  raw: number
  effective: number
  capped: boolean
}

// Chance de crítico: base mais Σ criticalChancePercent / 100. Bruta sem teto; efetiva
// limitada a 0..max (D-13), com max também limitado a 1 por ser probabilidade.
export function criticalChanceInfo(
  state: GameState,
  catalog: Catalog,
  baseChance: number,
  max: number = DEFAULT_MAX_CRITICAL_CHANCE,
): CappedChance {
  const raw = D(baseChance).add(totalEffect(state, catalog, 'criticalChancePercent').div(100)).toNumber()
  const cap = Math.min(1, Math.max(0, max))
  const effective = Math.min(cap, Math.max(0, raw))
  return { raw, effective, capped: raw > cap }
}

export function criticalChance(
  state: GameState,
  catalog: Catalog,
  baseChance: number,
  max: number = DEFAULT_MAX_CRITICAL_CHANCE,
): number {
  return criticalChanceInfo(state, catalog, baseChance, max).effective
}

// Multiplicador crítico efetivo: base mais Σ criticalMultiplier (soma aditiva, suposição).
export function criticalMultiplier(state: GameState, catalog: Catalog, baseMultiplier: number): Decimal {
  return D(baseMultiplier).add(totalEffect(state, catalog, 'criticalMultiplier'))
}

// Valor de um clique sem crítico (GDD 5.5, passos 1 e 2): (base + fixos) × (1 + % de clique)
// × multiplicador global. O crítico (passo 3) é aplicado em GameEngine.click.
export function computeClickValue(state: GameState, catalog: Catalog, baseClick: number): Decimal {
  const flat = D(baseClick).add(clickFlatBonus(state, catalog))
  const percent = clickPercentBonus(state, catalog).div(100).add(1)
  return flat.mul(percent).mul(globalMultiplier(state, catalog))
}
