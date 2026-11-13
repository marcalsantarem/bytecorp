import type { StageDef } from './types'

// Os limites de Bytes são provisórios (GDD 28.4). Alvo da T-062 (BRF-044): a primeira run completa, com agentes
// e melhorias, chega a Mega Corporation em cerca de 75 min (64 a 86 min), medido contra o motor real por
// tests/curva-m2.test.ts: estágios em 3,8, 7,4, 14,8, 27, 44,6 e 74 min (razões de 1,65 a 2,0). Os limites
// foram mantidos; o ajuste veio dos custos e da produção dos equipamentos caros, dos agentes e das melhorias.
export const STAGES: StageDef[] = [
  { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
  { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 1e4 } },
  { id: 'startup_lab', order: 2, nameKey: 'stage.startup_lab', requirement: { kind: 'bytesEarnedInRun', amount: 1e6 } },
  { id: 'data_center', order: 3, nameKey: 'stage.data_center', requirement: { kind: 'bytesEarnedInRun', amount: 1e9 } },
  { id: 'corporate_network', order: 4, nameKey: 'stage.corporate_network', requirement: { kind: 'bytesEarnedInRun', amount: 1e12 } },
  { id: 'quantum_facility', order: 5, nameKey: 'stage.quantum_facility', requirement: { kind: 'bytesEarnedInRun', amount: 1e15 } },
  { id: 'mega_corporation', order: 6, nameKey: 'stage.mega_corporation', requirement: { kind: 'bytesEarnedInRun', amount: 1e18 } },
]
