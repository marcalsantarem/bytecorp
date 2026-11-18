import { createContext, useContext, useSyncExternalStore } from 'react'
import type { Settings, SettingsStore } from '../../app/settings'
import { createBrowserNotifier, type LocalNotifier } from '../../platform/localNotifications'

export const SettingsContext = createContext<SettingsStore | null>(null)

// Notificador local (T-089). O App fornece o mesmo que liga aos eventos do engine.
export const NotifierContext = createContext<LocalNotifier | null>(null)

let defaultNotifier: LocalNotifier | null = null

export function useNotifier(): LocalNotifier {
  const notifier = useContext(NotifierContext)
  if (notifier) return notifier
  defaultNotifier ??= createBrowserNotifier()
  return defaultNotifier
}

// Loja de configurações em execução (fornecida pelo I18nProvider).
export function useSettingsStore(): SettingsStore {
  const store = useContext(SettingsContext)
  if (!store) throw new Error('useSettingsStore fora de I18nProvider')
  return store
}

// Configurações atuais; re-renderiza a cada alteração.
export function useSettings(): Readonly<Settings> {
  const store = useSettingsStore()
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.current,
  )
}
