import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { D } from '../../core/decimal'
import { formatBytes, formatCount } from '../../core/format'
import { makeEngine, renderWithEngine, tr } from '../testUtils'
import { StatsControl } from './StatsDialog'

function statValue(id: string): string {
  const row = screen.getByTestId('stats-list').querySelector(`[data-stat="${id}"]`)
  if (!row) throw new Error(`linha ${id} ausente`)
  return within(row as HTMLElement).getByRole('definition').textContent ?? ''
}

function setup() {
  const engine = makeEngine({
    bytesEarned: 5000,
    equipment: { a: 3, b: 2 },
    agents: { x: { count: 4, level: 1 } },
    upgrades: ['u1', 'u2'],
  })
  const { stats, meta } = engine.state
  stats.bytesEarnedAllTime = D(1_234_567)
  stats.bytesFromClicks = D(1500)
  stats.clicks = 1234
  stats.criticalClicks = 56
  stats.reboots = 3
  stats.playTimeMs = (2 * 60 + 5) * 60_000 + 30_000
  meta.quantumCores = D(12)
  meta.treeResets = 1
  renderWithEngine(engine, () => <StatsControl engine={engine} />)
  return engine
}

describe('StatsDialog', () => {
  it('abre pelo botão e mostra os totais com a formatação do jogo', () => {
    setup()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByTestId('stats-button'))
    expect(screen.getByRole('dialog', { name: tr('stats.detailsTitle') })).toBeTruthy()

    expect(statValue('bytesAllTime')).toBe(formatBytes(1_234_567, 'pt-BR'))
    expect(statValue('bytesRun')).toBe(formatBytes(5000, 'pt-BR'))
    expect(statValue('bytesFromClicks')).toBe(formatBytes(1500, 'pt-BR'))
    expect(statValue('clicks')).toBe(formatCount(1234, 'pt-BR'))
    expect(statValue('criticalClicks')).toBe('56')
    expect(statValue('equipmentRun')).toBe('5')
    expect(statValue('agentsRun')).toBe('4')
    expect(statValue('upgradesRun')).toBe('2')
    expect(statValue('reboots')).toBe('3')
    expect(statValue('quantumCores')).toBe('12')
    expect(statValue('treeResets')).toBe('1')
    expect(statValue('playTime')).toBe(tr('offline.duration.hm', { h: 2, m: 5 }))
  })

  it('mostra conquistas como desbloqueadas de total', () => {
    const engine = setup()
    fireEvent.click(screen.getByTestId('stats-button'))
    const total = engine.achievementDefs.length
    expect(statValue('achievements')).toBe(tr('stats.ofTotal', { value: 0, total: formatCount(total, 'pt-BR') }))
  })

  it('é uma lista única, sem abas', () => {
    setup()
    fireEvent.click(screen.getByTestId('stats-button'))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('tab')).toBeNull()
    expect(within(dialog).queryByRole('tablist')).toBeNull()
    expect(dialog.querySelectorAll('dl')).toHaveLength(1)
  })

  it('fecha pelo botão e pelo Esc, devolvendo o foco', () => {
    setup()
    const button = screen.getByTestId('stats-button')
    button.focus()
    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: tr('stats.close') }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(button)

    fireEvent.click(button)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
