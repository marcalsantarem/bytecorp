import type { StageDef } from './types'

// Os limites de Bytes são provisórios e serão ajustados no balanceamento (GDD 28.4).
// Lógica (T-025): cada estágio abre pouco antes do desbloqueio de um equipamento mais caro
// e leva cerca de 1,7x a 2x o tempo do anterior na simulação (tools/simular-equipamentos.mjs).
// T-052: Quantum Facility (antimatter_reactor, quantum_relay etc.) e Mega Corporation
// (planetary_mesh, hive_mind etc.) ganharam equipamentos próprios, com custo de 1,2e15 a 4e18 e
// desbloqueio na metade do custo. Os limites foram revistos e mantidos: na simulação os estágios
// abrem em 4,5, 9,4, 19,8, 37,1, 65 e 108 min (razões de 1,65x a 2,1x) e as primeiras unidades
// de cada estágio seguem sem saltos acima de ~2,1x (antes: 64,6 min -> 85,5 h por falta de itens).
export const STAGES: StageDef[] = [
  { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
  { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 1e4 } },
  { id: 'startup_lab', order: 2, nameKey: 'stage.startup_lab', requirement: { kind: 'bytesEarnedInRun', amount: 1e6 } },
  { id: 'data_center', order: 3, nameKey: 'stage.data_center', requirement: { kind: 'bytesEarnedInRun', amount: 1e9 } },
  { id: 'corporate_network', order: 4, nameKey: 'stage.corporate_network', requirement: { kind: 'bytesEarnedInRun', amount: 1e12 } },
  { id: 'quantum_facility', order: 5, nameKey: 'stage.quantum_facility', requirement: { kind: 'bytesEarnedInRun', amount: 1e15 } },
  { id: 'mega_corporation', order: 6, nameKey: 'stage.mega_corporation', requirement: { kind: 'bytesEarnedInRun', amount: 1e18 } },
]
