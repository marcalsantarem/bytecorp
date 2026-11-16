import type { QuantumNodeDef } from './types'

// Árvore Quantum (GDD 10): 3 caminhos, 13 nós. Valores provisórios (T-039; docs/AG07/arvore-quantum.md).
// Posição em grade: x cresce para a direita e y para baixo; as raízes ficam perto do centro (0,0).
// Soma de todos os níveis finitos: produção +(10 por nível do núcleo) +75 +125 +120, clique +150 e +300 pp,
// crítico +10 pp (teto D-13: 25%), desconto 10 pp (teto D-13: 50 pp), limite offline +24 h.
export const QUANTUM_NODES: QuantumNodeDef[] = [
  // Caminho alfa: produção.
  { id: 'alpha_core', path: 'alpha', nameKey: 'quantum.alpha_core.name', descriptionKey: 'quantum.alpha_core.desc', icon: 'sparkles', baseCost: 1, costGrowth: 1.8, effectPerLevel: { kind: 'globalProductionPercent', value: 10 }, prerequisites: [], maxLevel: null, position: { x: 0, y: -1 } },
  { id: 'alpha_overclock', path: 'alpha', nameKey: 'quantum.alpha_overclock.name', descriptionKey: 'quantum.alpha_overclock.desc', icon: 'gauge', baseCost: 2, costGrowth: 1.75, effectPerLevel: { kind: 'globalProductionPercent', value: 15 }, prerequisites: ['alpha_core'], maxLevel: 5, position: { x: 0, y: -2 } },
  { id: 'alpha_parallel', path: 'alpha', nameKey: 'quantum.alpha_parallel.name', descriptionKey: 'quantum.alpha_parallel.desc', icon: 'layers', baseCost: 4, costGrowth: 1.75, effectPerLevel: { kind: 'globalProductionPercent', value: 25 }, prerequisites: ['alpha_overclock'], maxLevel: 5, position: { x: 0, y: -3 } },
  { id: 'alpha_singularity', path: 'alpha', nameKey: 'quantum.alpha_singularity.name', descriptionKey: 'quantum.alpha_singularity.desc', icon: 'crown', baseCost: 12, costGrowth: 2, effectPerLevel: { kind: 'globalProductionPercent', value: 60 }, prerequisites: ['alpha_parallel'], maxLevel: 2, position: { x: 0, y: -4 } },

  // Caminho beta: clique e crítico.
  { id: 'beta_input', path: 'beta', nameKey: 'quantum.beta_input.name', descriptionKey: 'quantum.beta_input.desc', icon: 'keyboard', baseCost: 1, costGrowth: 1.8, effectPerLevel: { kind: 'clickPercent', value: 25 }, prerequisites: [], maxLevel: 6, position: { x: -1, y: 1 } },
  { id: 'beta_neural', path: 'beta', nameKey: 'quantum.beta_neural.name', descriptionKey: 'quantum.beta_neural.desc', icon: 'brain-circuit', baseCost: 6, costGrowth: 2, effectPerLevel: { kind: 'clickPercent', value: 100 }, prerequisites: ['beta_input'], maxLevel: 3, position: { x: -2, y: 0 } },
  { id: 'beta_crit', path: 'beta', nameKey: 'quantum.beta_crit.name', descriptionKey: 'quantum.beta_crit.desc', icon: 'zap', baseCost: 2, costGrowth: 1.75, effectPerLevel: { kind: 'criticalChancePercent', value: 2 }, prerequisites: ['beta_input'], maxLevel: 5, position: { x: -2, y: 2 } },
  { id: 'beta_crit_power', path: 'beta', nameKey: 'quantum.beta_crit_power.name', descriptionKey: 'quantum.beta_crit_power.desc', icon: 'hand-coins', baseCost: 4, costGrowth: 1.75, effectPerLevel: { kind: 'criticalMultiplier', value: 0.5 }, prerequisites: ['beta_crit'], maxLevel: 4, position: { x: -3, y: 3 } },

  // Caminho gama: economia e tempo.
  { id: 'gamma_supply', path: 'gamma', nameKey: 'quantum.gamma_supply.name', descriptionKey: 'quantum.gamma_supply.desc', icon: 'piggy-bank', baseCost: 1, costGrowth: 1.9, effectPerLevel: { kind: 'costDiscountPercent', value: 1 }, prerequisites: [], maxLevel: 5, position: { x: 1, y: 1 } },
  { id: 'gamma_contracts', path: 'gamma', nameKey: 'quantum.gamma_contracts.name', descriptionKey: 'quantum.gamma_contracts.desc', icon: 'handshake', baseCost: 4, costGrowth: 1.75, effectPerLevel: { kind: 'costDiscountPercent', value: 1 }, prerequisites: ['gamma_supply'], maxLevel: 5, position: { x: 2, y: 2 } },
  { id: 'gamma_offline', path: 'gamma', nameKey: 'quantum.gamma_offline.name', descriptionKey: 'quantum.gamma_offline.desc', icon: 'database-zap', baseCost: 2, costGrowth: 1.75, effectPerLevel: { kind: 'offlineCapHours', value: 2 }, prerequisites: ['gamma_supply'], maxLevel: 4, position: { x: 2, y: 0 } },
  { id: 'gamma_chrono', path: 'gamma', nameKey: 'quantum.gamma_chrono.name', descriptionKey: 'quantum.gamma_chrono.desc', icon: 'rocket', baseCost: 10, costGrowth: 2, effectPerLevel: { kind: 'offlineCapHours', value: 8 }, prerequisites: ['gamma_offline'], maxLevel: 2, position: { x: 3, y: -1 } },
]
