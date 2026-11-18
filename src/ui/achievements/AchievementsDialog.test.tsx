import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATALOG } from '../../core/catalog'
import { ACHIEVEMENTS } from '../../core/catalog/achievements'
import { D } from '../../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import { createInitialState } from '../../core/state'
import type { MessageKey } from '../../i18n'
import { renderWithEngine, tr } from '../testUtils'
import { AchievementsControl } from './AchievementsDialog'

const AT = Date.UTC(2026, 10, 18, 12, 0)

// Catálogo real (T-078): clicks_100 e q_reset (secreta) desbloqueadas; crit_2000 secreta bloqueada.
function makeEngine() {
  const state = createInitialState(0)
  state.stats.clicks = 150
  state.stats.bytesEarnedAllTime = D(500)
  state.meta.achievements = ['clicks_100', 'q_reset']
  state.meta.achievementUnlocks = { clicks_100: { at: AT, playTimeMs: 0 }, q_reset: { at: AT, playTimeMs: 0 } }
  return new GameEngine(CATALOG, state, DEFAULT_CONFIG)
}

function open(engine: GameEngine) {
  renderWithEngine(engine, () => <AchievementsControl engine={engine} buttonClass="" />)
  fireEvent.click(screen.getByTestId('achievements-button'))
  return screen.getByTestId('achievements-dialog')
}

const item = (dialog: HTMLElement, id: string) => dialog.querySelector<HTMLElement>(`[data-achievement="${id}"]`)!

describe('AchievementsDialog', () => {
  it('mostra o contador desbloqueadas/total no botão', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <AchievementsControl engine={engine} buttonClass="" />)
    expect(screen.getByTestId('achievements-counter').textContent).toBe(
      tr('achievements.counter', { value: '2', total: formatCount(ACHIEVEMENTS.length, 'pt-BR') }),
    )
  })

  it('agrupa por categoria na ordem do catálogo, com todas as conquistas', () => {
    const dialog = open(makeEngine())
    const sections = [...dialog.querySelectorAll<HTMLElement>('section[data-category]')]
    const order = [...new Set(ACHIEVEMENTS.map((a) => a.category))]
    expect(sections.map((s) => s.dataset.category)).toEqual(order)
    for (const s of sections) {
      const ids = [...s.querySelectorAll<HTMLElement>('[data-achievement]')].map((el) => el.dataset.achievement)
      expect(ids).toEqual(ACHIEVEMENTS.filter((a) => a.category === s.dataset.category).map((a) => a.id))
    }
    expect(within(dialog).getByText(tr('achievements.category.clicks'))).toBeTruthy()
  })

  it('secreta bloqueada mostra só a pista; secreta desbloqueada mostra tudo', () => {
    const dialog = open(makeEngine())
    const secret = item(dialog, 'crit_2000')
    expect(secret.dataset.state).toBe('secret')
    expect(within(secret).getByTestId('achievement-hint').textContent).toContain(tr('achievement.crit_2000.hint' as MessageKey))
    expect(secret.textContent).not.toContain(tr('achievement.crit_2000.name' as MessageKey))
    expect(within(secret).queryByRole('progressbar')).toBeNull()
    expect(within(secret).queryByTestId('achievement-reward')).toBeNull()

    const revealed = item(dialog, 'q_reset')
    expect(revealed.dataset.state).toBe('unlocked')
    expect(revealed.textContent).toContain(tr('achievement.q_reset.name' as MessageKey))
  })

  it('mostra progresso formatado, recompensa e estado', () => {
    const dialog = open(makeEngine())
    const bytes = item(dialog, 'prod_bytes_1k')
    expect(within(bytes).getByTestId('achievement-progress').textContent).toBe(
      `${formatBytes(D(500), 'pt-BR')} / ${formatBytes(D(1000), 'pt-BR')}`,
    )
    expect(within(bytes).getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
    expect(within(bytes).getByTestId('achievement-status').textContent).toBe(tr('achievements.locked'))

    const clicks = item(dialog, 'clicks_100')
    expect(within(clicks).getByTestId('achievement-progress').textContent).toBe('100 / 100')
    expect(within(clicks).getByTestId('achievement-reward').textContent).toContain(formatBytes(D(50), 'pt-BR'))
    const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(AT)
    expect(within(clicks).getByTestId('achievement-status').textContent).toBe(tr('achievements.unlockedAt', { date }))

    expect(within(dialog).getByTestId('achievements-summary').textContent).toBe(
      tr('achievements.summary', { value: '2', total: formatCount(ACHIEVEMENTS.length, 'pt-BR') }),
    )
  })

  it('abrir conclui o passo de conquistas do tutorial; Esc fecha', () => {
    const engine = makeEngine()
    open(engine)
    expect(engine.completeTutorialStep('achievements')).toBe(false)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('achievements-dialog')).toBeNull()
  })
})
