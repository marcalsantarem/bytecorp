import { describe, expect, it } from 'vitest'
import { CATALOG } from '../catalog'
import { GameEngine } from '../engine'
import { D } from '../decimal'
import { createInitialState, type GameState } from '../state'
import { quantumCoresReward } from './coresReward'

function stateWith(bytesEarned: number, stage: string, upgrades = 0): GameState {
  const s = createInitialState(0)
  s.run.bytesEarned = D(bytesEarned)
  s.run.stage = stage as GameState['run']['stage']
  s.run.upgrades = Array.from({ length: upgrades }, (_, i) => `u${i}`)
  return s
}
const reward = (s: GameState) => quantumCoresReward(s, CATALOG)

describe('quantumCoresReward (D-15)', () => {
  it('abaixo de L = 4 só conta estágio e melhorias', () => {
    expect(reward(createInitialState(0))).toBe(0)
    expect(reward(stateWith(0, 'solo_hacker'))).toBe(0)
    expect(reward(stateWith(5000, 'solo_hacker'))).toBe(0)
    expect(reward(stateWith(1e4, 'garage_company'))).toBe(0) // peso 0,5: índice 1 ainda não soma
    expect(reward(stateWith(1e4, 'startup_lab'))).toBe(1)
  })

  it('L = 6 em Solo Hacker dá 1 core; L = 5 ainda 0', () => {
    expect(reward(stateWith(1e5, 'solo_hacker'))).toBe(0)
    expect(reward(stateWith(1e6, 'solo_hacker'))).toBe(1)
    expect(reward(stateWith(9.9e5, 'solo_hacker'))).toBe(0)
  })

  it('arredonda para baixo cada parcela', () => {
    expect(reward(stateWith(1e7, 'solo_hacker'))).toBe(2) // (3/2)^2 = 2,25
    expect(reward(stateWith(1e6, 'solo_hacker', 3))).toBe(1)
    expect(reward(stateWith(1e6, 'solo_hacker', 7))).toBe(2)
  })

  it('bate com a tabela da D-15 nos estágios (com tolerância)', () => {
    // Valores da D-15 refeitos com o peso de estágio 0,5 (antes 3, 10, 22, 38, 59).
    const rows: [number, string, number, number][] = [
      [1e6, 'startup_lab', 4, 3],
      [1e9, 'data_center', 6, 8],
      [1e12, 'corporate_network', 10, 20],
      [1e15, 'quantum_facility', 14, 35],
      [1e18, 'mega_corporation', 17, 56],
    ]
    for (const [earned, stage, ups, expected] of rows) {
      const got = reward(stateWith(earned, stage, ups))
      expect(Math.abs(got - expected)).toBeLessThanOrEqual(Math.max(1, expected * 0.1))
    }
  })

  it('nunca usa saldo, cores nem estatísticas globais', () => {
    const base = stateWith(1e9, 'data_center', 4)
    const a = reward(base)
    base.run.bytes = D(1e30)
    base.meta.quantumCores = D(999)
    base.stats.bytesEarnedAllTime = D(1e40)
    base.stats.reboots = 50
    expect(reward(base)).toBe(a)
  })

  it('pesos configuráveis', () => {
    const s = stateWith(1e6, 'startup_lab', 8)
    const w = { logDivisor: 1, logOffset: 4, stageWeight: 2, upgradesPerCore: 2 }
    expect(quantumCoresReward(s, CATALOG, w)).toBe(4 + 4 + 4)
  })

  it('é o padrão do motor: botão habilita com 1 core ou mais', () => {
    const state = stateWith(1e3, 'solo_hacker')
    const e = new GameEngine(CATALOG, state)
    expect(e.rebootRewardNow).toBe(0)
    expect(e.reboot().ok).toBe(false)
    e.state.run.bytesEarned = D(1e6)
    expect(e.rebootRewardNow).toBe(1)
    expect(e.reboot()).toMatchObject({ ok: true, reward: 1 })
    expect(e.state.meta.quantumCores.toNumber()).toBe(1)
  })
})
