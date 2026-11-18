import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { boot } from '../../app/bootstrap'
import { defaultSettings, SettingsStore } from '../../app/settings'
import { MemoryStorage } from '../../core/save/storage'
import { I18nProvider } from '../i18n'
import { tr } from '../testUtils'
import { StartScreen } from './StartScreen'

function setup(hasSave: boolean, locale: 'pt-BR' | 'en' = 'pt-BR') {
  const onContinue = vi.fn()
  const onNewGame = vi.fn(() => Promise.resolve())
  const onReset = vi.fn(() => Promise.resolve())
  const store = new SettingsStore(new MemoryStorage(), defaultSettings([locale]))
  render(
    <I18nProvider settings={store}>
      <StartScreen hasSave={hasSave} onContinue={onContinue} onNewGame={onNewGame} onReset={onReset} />
    </I18nProvider>,
  )
  return { onContinue, onNewGame, onReset }
}

describe('StartScreen', () => {
  it('primeiro acesso: sem Continuar, Novo jogo entra direto sem confirmação', async () => {
    const { onNewGame } = setup(false)
    expect(screen.queryByTestId('start-continue')).toBeNull()
    const newGame = screen.getByTestId('start-new-game')
    expect(document.activeElement).toBe(newGame)
    await act(async () => fireEvent.click(newGame))
    expect(screen.queryByTestId('start-confirm')).toBeNull()
    expect(onNewGame).toHaveBeenCalledTimes(1)
  })

  it('com save: Continuar em foco e chama onContinue', () => {
    const { onContinue, onNewGame } = setup(true)
    const cont = screen.getByTestId('start-continue')
    expect(cont.textContent).toContain(tr('start.continue'))
    expect(document.activeElement).toBe(cont)
    fireEvent.click(cont)
    expect(onContinue).toHaveBeenCalledTimes(1)
    expect(onNewGame).not.toHaveBeenCalled()
  })

  it('com save: Novo jogo pede confirmação; Cancelar e Esc não apagam', () => {
    const { onNewGame } = setup(true)
    fireEvent.click(screen.getByTestId('start-new-game'))
    expect(screen.getByTestId('start-confirm').textContent).toContain(tr('start.newGame.body'))
    fireEvent.click(screen.getByText(tr('start.newGame.cancel')))
    expect(screen.queryByTestId('start-confirm')).toBeNull()
    fireEvent.click(screen.getByTestId('start-new-game'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('start-confirm')).toBeNull()
    expect(onNewGame).not.toHaveBeenCalled()
  })

  it('com save: confirmar chama onNewGame uma vez', async () => {
    const { onNewGame } = setup(true)
    fireEvent.click(screen.getByTestId('start-new-game'))
    await act(async () => fireEvent.click(screen.getByTestId('start-confirm-yes')))
    expect(onNewGame).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('start-confirm')).toBeNull()
  })

  it('Configurações abre a janela da T-084 e Créditos abre e fecha', () => {
    setup(true)
    fireEvent.click(screen.getByTestId('start-settings'))
    expect(screen.getByRole('dialog', { name: tr('settings.title') })).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()

    const credits = screen.getByTestId('start-credits')
    credits.focus()
    fireEvent.click(credits)
    expect(screen.getByRole('dialog', { name: tr('start.credits.title') })).toBeTruthy()
    expect(document.activeElement?.textContent).toContain(tr('start.close'))
    fireEvent.click(screen.getByText(tr('start.close')))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(credits)
  })

  it('textos em inglês e espaço do fundo animado presente', () => {
    setup(true, 'en')
    expect(screen.getByTestId('start-continue').textContent).toContain('Continue')
    expect(screen.getByTestId('start-new-game').textContent).toContain('New game')
    expect(screen.getByTestId('start-background')).toBeTruthy()
  })
})

describe('boot hasSave', () => {
  it('é false sem save e true com save válido', async () => {
    const storage = new MemoryStorage()
    const first = await boot(storage)
    if (first.kind !== 'ready') throw new Error('esperado ready')
    expect(first.hasSave).toBe(false)
    await first.session.reset()
    first.session.stop()

    const second = await boot(storage)
    if (second.kind !== 'ready') throw new Error('esperado ready')
    expect(second.hasSave).toBe(true)
    second.session.stop()
  })
})
