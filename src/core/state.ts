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
    meta: { quantumCores: D(0), quantumNodes: {}, treeResets: 0, achievements: [] },
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
