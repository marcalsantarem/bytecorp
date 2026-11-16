import type { StageId } from './catalog/types'
import { D, type Decimal } from './decimal'

// Estado de uma execução: tudo aqui é zerado pelo Reboot (GDD 9.2).
export interface RunState {
  bytes: Decimal
  // Total gerado na execução, independente de gastos. Base dos desbloqueios
  // de melhorias (GDD 8.4) e da recompensa de Reboot (GDD 9.4).
  bytesEarned: Decimal
  stage: StageId
  equipment: Record<string, number>
  agents: Record<string, { count: number; level: number }>
  upgrades: string[]
  startedAt: number
}

// Estado permanente: sobrevive ao Reboot (GDD 9.3).
export interface MetaState {
  quantumCores: Decimal
  quantumNodes: Record<string, number>
  treeResets: number
  achievements: string[]
  // Aceleradores (GDD 13): em meta porque o temporizador corre além do Reboot e offline (13.3).
  accelerators: AcceleratorState
  // Bônus temporários (D-10, camada Π temporários); sobrevivem ao Reboot (GDD 9.3).
  temporaryBonuses: TemporaryBonus[]
}

// Acelerador ativo ou guardado: multiplicador e tempo restante. Itens do inventário não expiram.
export interface AcceleratorItem {
  id: string
  multiplier: number
  remainingMs: number
}

export interface AcceleratorState {
  active: AcceleratorItem | null
  inventory: AcceleratorItem[]
  // Chaves das concessões já recebidas (`stage:<id>`, `reboot:<n>`), para não repetir (D-16).
  granted: string[]
  // Contador para gerar ids de itens (`acc-<n>`).
  nextItemId: number
}

export interface TemporaryBonus {
  id: string
  multiplier: number
  remainingMs: number
}

// Estatísticas históricas acumuladas, também preservadas no Reboot.
export interface StatsState {
  bytesEarnedAllTime: Decimal
  bytesFromClicks: Decimal
  bytesFromProduction: Decimal
  clicks: number
  criticalClicks: number
  reboots: number
  // GDD 11.5: só conta o tempo com o jogo aberto.
  playTimeMs: number
}

export interface GameState {
  run: RunState
  meta: MetaState
  stats: StatsState
}

export function createRunState(now: number): RunState {
  return {
    bytes: D(0),
    bytesEarned: D(0),
    stage: 'solo_hacker',
    equipment: {},
    agents: {},
    upgrades: [],
    startedAt: now,
  }
}

export function createInitialState(now: number): GameState {
  return {
    run: createRunState(now),
    meta: {
      quantumCores: D(0),
      quantumNodes: {},
      treeResets: 0,
      achievements: [],
      accelerators: { active: null, inventory: [], granted: [], nextItemId: 1 },
      temporaryBonuses: [],
    },
    stats: {
      bytesEarnedAllTime: D(0),
      bytesFromClicks: D(0),
      bytesFromProduction: D(0),
      clicks: 0,
      criticalClicks: 0,
      reboots: 0,
      playTimeMs: 0,
    },
  }
}
