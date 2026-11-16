import type { Catalog, Effect, QuantumNodeDef } from '../catalog/types'
import { D } from '../decimal'
import type { GameState } from '../state'

// Regras da árvore Quantum (GDD 10). Funções puras sobre o estado e o catálogo; o engine as
// chama e emite os eventos. Os cores são sempre inteiros.

// Custo em cores do reset da árvore, a partir de quantos resets já foram feitos (começa em 0).
export type TreeResetCost = (resets: number) => number

export const TREE_RESET_BASE_COST = 3
export const TREE_RESET_STEP_COST = 3

// Padrão: 3, 6, 9, ... cores (linear). Configurável em EngineConfig.treeResetCost.
export const DEFAULT_TREE_RESET_COST: TreeResetCost = (resets) =>
  TREE_RESET_BASE_COST + TREE_RESET_STEP_COST * Math.max(0, Math.floor(resets))

// Custo do próximo nível de um nó, dado o nível atual: floor(base x fator^nível), mínimo 1.
export function nodeLevelCost(def: QuantumNodeDef, currentLevel: number): number {
  return Math.max(1, Math.floor(def.baseCost * def.costGrowth ** currentLevel))
}

export function nodeLevel(state: GameState, id: string): number {
  return state.meta.quantumNodes[id] ?? 0
}

export type NodeStatus = 'locked' | 'available' | 'maxed'

// 'locked' = algum pré-requisito sem nível; 'maxed' = no nível máximo; o saldo não entra.
export function nodeStatus(def: QuantumNodeDef, state: GameState): NodeStatus {
  const level = nodeLevel(state, def.id)
  if (def.maxLevel !== null && level >= def.maxLevel) return 'maxed'
  if (def.prerequisites.some((p) => nodeLevel(state, p) < 1)) return 'locked'
  return 'available'
}

// Total de cores gasto nos níveis comprados.
export function spentCores(state: GameState, catalog: Catalog): number {
  let total = 0
  for (const def of catalog.quantumNodes) {
    const level = nodeLevel(state, def.id)
    for (let l = 0; l < level; l++) total += nodeLevelCost(def, l)
  }
  return total
}

export type BuyNodeResult =
  | { ok: true; level: number; cost: number }
  | { ok: false; reason: 'unknown' | 'locked' | 'maxed' | 'insufficient' }

// Compra um nível por vez; não altera nada se recusar.
export function buyQuantumNode(state: GameState, catalog: Catalog, id: string): BuyNodeResult {
  const def = catalog.quantumNodes.find((n) => n.id === id)
  if (!def) return { ok: false, reason: 'unknown' }
  const status = nodeStatus(def, state)
  if (status !== 'available') return { ok: false, reason: status }
  const level = nodeLevel(state, id)
  const cost = nodeLevelCost(def, level)
  if (state.meta.quantumCores.lt(cost)) return { ok: false, reason: 'insufficient' }
  state.meta.quantumCores = state.meta.quantumCores.sub(D(cost))
  state.meta.quantumNodes[id] = level + 1
  return { ok: true, level: level + 1, cost }
}

export type ResetTreeResult =
  | { ok: true; refunded: number; cost: number; resetNumber: number }
  | { ok: false; reason: 'insufficient' }

// Reset da árvore: cobra o custo do reset do saldo, devolve todos os cores gastos e zera os níveis.
// O custo é checado contra o saldo antes da devolução. Não altera nada se recusar.
export function resetQuantumTree(state: GameState, catalog: Catalog, resetCost: TreeResetCost): ResetTreeResult {
  const cost = Math.max(0, Math.floor(resetCost(state.meta.treeResets)))
  if (state.meta.quantumCores.lt(cost)) return { ok: false, reason: 'insufficient' }
  const refunded = spentCores(state, catalog)
  state.meta.quantumCores = state.meta.quantumCores.sub(D(cost)).add(D(refunded))
  state.meta.quantumNodes = {}
  state.meta.treeResets++
  return { ok: true, refunded, cost, resetNumber: state.meta.treeResets }
}

export type QuantumEffects = Partial<Record<Effect['kind'], number>>

// Soma, por tipo de efeito, o valor por nível x nível de cada nó comprado. Não aplica nada;
// a produção e os descontos leem isto na T-037.
export function quantumEffects(state: GameState, catalog: Catalog): QuantumEffects {
  const totals: QuantumEffects = {}
  for (const def of catalog.quantumNodes) {
    const level = nodeLevel(state, def.id)
    if (level < 1) continue
    const { kind, value } = def.effectPerLevel
    totals[kind] = (totals[kind] ?? 0) + value * level
  }
  return totals
}
