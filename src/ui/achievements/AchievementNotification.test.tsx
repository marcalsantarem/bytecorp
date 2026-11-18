import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CATALOG } from '../../core/catalog'
import type { AchievementDef } from '../../core/catalog/achievements'
import { DEFAULT_CONFIG, GameEngine } from '../../core/engine'
import { createInitialState } from '../../core/state'
import { translate, type MessageKey } from '../../i18n'
import { I18nProvider } from '../i18n'
import { flush, tr } from '../testUtils'
import { useModal } from '../useModal'
import { AchievementNotification } from './AchievementNotification'

// Catálogo de teste (o real é da T-078): textos com chaves existentes.
const DEFS: AchievementDef[] = [
  {
    id: 'first_click',
    category: 'clicks',
    rarity: 'bronze',
    requirement: { kind: 'clicks', amount: 1 },
    nameKey: 'shop.title' as MessageKey,
    descriptionKey: 'click.button' as MessageKey,
    reward: { kind: 'bytes', amount: 1500 },
  },
  {
    id: 'second_click',
    category: 'clicks',
    rarity: 'gold',
    requirement: { kind: 'clicks', amount: 2 },
    nameKey: 'hud.production' as MessageKey,
    descriptionKey: 'hud.bytes' as MessageKey,
    reward: { kind: 'temporaryBonus', multiplier: 1.5, minutes: 15 },
  },
  {
    id: 'third_click',
    category: 'clicks',
    rarity: 'diamond',
    requirement: { kind: 'clicks', amount: 3 },
    nameKey: 'hud.quantumCores' as MessageKey,
    descriptionKey: 'hud.bytes' as MessageKey,
    reward: { kind: 'quantumCores', amount: 2 },
  },
]

function makeEngine() {
  return new GameEngine({ ...CATALOG, achievements: DEFS }, createInitialState(0), { ...DEFAULT_CONFIG, random: () => 0.99 })
}

function FakeModal() {
  const [open, setOpen] = useState(true)
  return open ? <Dialog onClose={() => setOpen(false)} /> : null
}

function Dialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)
  return (
    <div ref={ref} role="dialog" aria-label="outra">
      <button onClick={onClose}>fechar outra</button>
    </div>
  )
}

function setup(engine = makeEngine(), extra: React.ReactNode = null) {
  render(
    <I18nProvider>
      {extra}
      <AchievementNotification engine={engine} />
    </I18nProvider>,
  )
  return engine
}

const card = () => screen.queryByTestId('achievement-notification')

describe('AchievementNotification', () => {
  it('não aparece sem conquista na fila', () => {
    setup()
    expect(card()).toBeNull()
  })

  it('aparece no desbloqueio com raridade, nome, descrição e recompensa', async () => {
    const engine = setup()
    act(() => void engine.click())
    await flush(engine)
    expect(card()).toHaveAttribute('data-achievement', 'first_click')
    expect(screen.getByTestId('achievement-rarity')).toHaveTextContent(tr('achievement.rarity.bronze'))
    expect(screen.getByTestId('achievement-name')).toHaveTextContent(tr('shop.title'))
    expect(screen.getByTestId('achievement-description')).toHaveTextContent(tr('click.button'))
    expect(screen.getByTestId('achievement-reward')).toHaveTextContent('+1,5 kB')
    expect(screen.queryByTestId('achievement-queued')).toBeNull()
  })

  it('mostra a fila em ordem, uma por vez, e o fechar chama o engine', async () => {
    const engine = setup()
    act(() => {
      engine.click()
      engine.click()
      engine.click()
    })
    await flush(engine)
    const spy = vi.spyOn(engine, 'dismissAchievementNotification')
    expect(screen.getAllByTestId('achievement-notification')).toHaveLength(1)
    expect(card()).toHaveAttribute('data-achievement', 'first_click')
    expect(screen.getByTestId('achievement-queued')).toHaveTextContent(tr('achievement.toast.pending', { count: 2 }))

    fireEvent.click(screen.getByRole('button', { name: tr('achievement.toast.close') }))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(card()).toHaveAttribute('data-achievement', 'second_click')
    expect(screen.getByTestId('achievement-reward')).toHaveTextContent(tr('achievement.reward.temporaryBonus', { value: '1,5', minutes: 15 }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(card()).toHaveAttribute('data-achievement', 'third_click')
    expect(screen.getByTestId('achievement-reward')).toHaveTextContent(tr('achievement.reward.quantumCores', { amount: '2' }))

    fireEvent.click(screen.getByRole('button', { name: tr('achievement.toast.close') }))
    expect(card()).toBeNull()
    expect(engine.achievementNotification).toBeNull()
  })

  it('não fecha sozinha com o tempo', async () => {
    const engine = setup()
    act(() => void engine.click())
    act(() => engine.advance(10 * 60_000))
    await flush(engine)
    expect(card()).toHaveAttribute('data-achievement', 'first_click')
  })

  it('volta a pendente de um save (fila já preenchida)', () => {
    const engine = makeEngine()
    engine.state.meta.achievementQueue = ['third_click']
    engine.state.meta.achievements.push('third_click')
    setup(engine)
    expect(card()).toHaveAttribute('data-achievement', 'third_click')
  })

  it('espera outra janela modal fechar e o Esc fecha só a janela', async () => {
    const engine = makeEngine()
    engine.state.meta.achievementQueue = ['first_click']
    engine.state.meta.achievements.push('first_click')
    setup(engine, <FakeModal />)
    expect(card()).toBeNull()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'outra' })).toBeNull()
    expect(card()).toHaveAttribute('data-achievement', 'first_click')
    expect(engine.achievementNotification).toBe('first_click')
  })

  it('descarta em silêncio um id fora do catálogo', () => {
    const engine = makeEngine()
    engine.state.meta.achievementQueue = ['removida', 'first_click']
    engine.state.meta.achievements.push('first_click')
    setup(engine)
    expect(card()).toHaveAttribute('data-achievement', 'first_click')
  })

  it('tem os textos em inglês', () => {
    expect(translate('en', 'achievement.toast.title')).toBe('Achievement unlocked')
    expect(translate('en', 'achievement.reward.temporaryBonus', { value: '1.5', minutes: 15 })).toBe('1.5x production for 15 min')
  })
})
