import { D } from '../decimal'
import { createRunState, type GameState } from '../state'

// Recompensa de Reboot em Quantum Cores (GDD 9.4). A fórmula real é a T-035 (D-15);
// até lá o padrão devolve 0 e o Reboot fica recusado.
export type RebootReward = (state: GameState) => number

export const DEFAULT_REBOOT_REWARD: RebootReward = () => 0

export type RebootResult = { ok: true; reward: number; rebootNumber: number } | { ok: false; reason: 'noReward' }

// Quantidade inteira de cores que o Reboot daria agora; 0 se a função devolver algo inválido.
export function rebootRewardOf(state: GameState, rebootReward: RebootReward): number {
  const value = Math.floor(rebootReward(state))
  return Number.isFinite(value) && value > 0 ? value : 0
}

// Aplica o Reboot ao estado (GDD 9.2 e 9.3): soma os cores ao meta, reinicia `run`,
// conta o reboot e preserva o resto de `meta` e `stats`. Não mexe em nada se recusar.
export function applyReboot(state: GameState, rebootReward: RebootReward, now: number): RebootResult {
  const reward = rebootRewardOf(state, rebootReward)
  if (reward < 1) return { ok: false, reason: 'noReward' }
  state.meta.quantumCores = state.meta.quantumCores.add(D(reward))
  state.run = createRunState(now)
  state.stats.reboots++
  return { ok: true, reward, rebootNumber: state.stats.reboots }
}
