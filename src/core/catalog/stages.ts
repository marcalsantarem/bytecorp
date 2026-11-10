import type { StageDef } from './types'

// Os limites de Bytes são provisórios e serão ajustados no balanceamento (GDD 28.4).
export const STAGES: StageDef[] = [
  { id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } },
  { id: 'garage_company', order: 1, nameKey: 'stage.garage_company', requirement: { kind: 'bytesEarnedInRun', amount: 1e4 } },
  { id: 'startup_lab', order: 2, nameKey: 'stage.startup_lab', requirement: { kind: 'bytesEarnedInRun', amount: 1e6 } },
  { id: 'data_center', order: 3, nameKey: 'stage.data_center', requirement: { kind: 'bytesEarnedInRun', amount: 1e9 } },
  { id: 'corporate_network', order: 4, nameKey: 'stage.corporate_network', requirement: { kind: 'bytesEarnedInRun', amount: 1e12 } },
  { id: 'quantum_facility', order: 5, nameKey: 'stage.quantum_facility', requirement: { kind: 'bytesEarnedInRun', amount: 1e15 } },
  { id: 'mega_corporation', order: 6, nameKey: 'stage.mega_corporation', requirement: { kind: 'bytesEarnedInRun', amount: 1e18 } },
]
