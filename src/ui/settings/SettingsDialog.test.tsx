import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultSettings, parseSettings, SettingsStore } from '../../app/settings'
import { MemoryStorage, SETTINGS_KEY } from '../../core/save/storage'
import { I18nProvider, useI18n } from '../i18n'
import type { LocalNotifier, NotificationPermissionState } from '../../platform/localNotifications'
import { SettingsControl } from './SettingsDialog'
import { NotifierContext } from './useSettings'

function Probe() {
  const { t } = useI18n()
  return <p data-testid="probe">{t('hud.production')}</p>
}

function fakeNotifier(answer: NotificationPermissionState): LocalNotifier {
  let state: NotificationPermissionState = 'default'
  return {
    permission: () => state,
    requestPermission: vi.fn(() => {
      state = answer
      return Promise.resolve(answer)
    }),
    show: () => Promise.resolve(false),
  }
}

function setup(onReset: () => Promise<void> = () => Promise.resolve(), notifier = fakeNotifier('granted')) {
  const storage = new MemoryStorage()
  const store = new SettingsStore(storage, defaultSettings(['pt-BR']))
  render(
    <I18nProvider settings={store}>
      <NotifierContext.Provider value={notifier}>
        <Probe />
        <SettingsControl onReset={onReset} />
      </NotifierContext.Provider>
    </I18nProvider>,
  )
  fireEvent.click(screen.getByTestId('settings-button'))
  return { storage, store }
}

async function saved(storage: MemoryStorage) {
  return parseSettings(await storage.get(SETTINGS_KEY))
}

afterEach(() => vi.useRealTimers())

describe('Janela de Configurações', () => {
  it('abre pela engrenagem com todas as seções e a velocidade desabilitada', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Configurações' })).toBeInTheDocument()
    for (const name of ['Áudio', 'Gráficos', 'Idioma', 'Notificações', 'Velocidade de jogo', 'Dados']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByTestId('settings-speed-soon').textContent).toBe('em breve')
  })

  it('troca o idioma na hora em toda a tela e grava', async () => {
    const { storage } = setup()
    expect(screen.getByTestId('probe').textContent).toBe('Produção')
    await act(async () => {
      fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    })
    expect(screen.getByTestId('probe').textContent).toBe('Production')
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect((await saved(storage)).locale).toBe('en')
  })

  it('grava volumes, qualidade e notificações pela API', async () => {
    const { storage, store } = setup()
    await act(async () => {
      fireEvent.change(screen.getByRole('slider', { name: 'Música' }), { target: { value: '25' } })
      fireEvent.click(screen.getByRole('radio', { name: 'Baixa' }))
    })
    const categoria = screen.getByRole('switch', { name: 'Conquistas desbloqueadas' })
    expect(categoria).toBeDisabled()
    await act(async () => {
      fireEvent.click(screen.getByRole('switch', { name: 'Ativar notificações' }))
    })
    expect(categoria).toBeEnabled()
    await act(async () => {
      fireEvent.click(categoria)
    })
    const s = await saved(storage)
    expect(s.volumes.music).toBe(25)
    expect(s.graphicsQuality).toBe('low')
    expect(s.notifications.enabled).toBe(true)
    expect(s.notifications.categories.achievement).toBe(false)
    expect(store.current).toEqual(s)
    expect(screen.queryByRole('switch', { name: 'Limite offline atingido' })).not.toBeInTheDocument()
  })

  it.each([
    ['denied', 'O navegador bloqueou'],
    ['unsupported', 'não oferece notificações'],
  ] as const)('permissão %s mantém desligado e avisa', async (answer, text) => {
    const notifier = fakeNotifier(answer)
    const { store } = setup(undefined, notifier)
    await act(async () => {
      fireEvent.click(screen.getByRole('switch', { name: 'Ativar notificações' }))
    })
    expect(notifier.requestPermission).toHaveBeenCalledTimes(1)
    expect(store.current.notifications.enabled).toBe(false)
    expect(screen.getByRole('switch', { name: 'Ativar notificações' })).not.toBeChecked()
    expect(screen.getByTestId('settings-notifications-warning').textContent).toContain(text)
  })

  it('Reset pede confirmação em dois passos e volta ao primeiro passo sozinho', async () => {
    vi.useFakeTimers()
    const onReset = vi.fn(() => Promise.resolve())
    setup(onReset)
    const button = screen.getByTestId('settings-reset')
    fireEvent.click(button)
    expect(onReset).not.toHaveBeenCalled()
    expect(button.textContent).toBe('Confirmar reset')
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(button.textContent).toBe('Reset')
    fireEvent.click(button)
    await act(async () => {
      fireEvent.click(button)
    })
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('Esc fecha a janela', () => {
    setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
