import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { defaultSettings, SettingsStore } from '../app/settings'
import type { Locale } from '../core/format'
import { MemoryStorage } from '../core/save/storage'
import { translate, type MessageKey, type MessageParams } from '../i18n'
import { SettingsContext } from './settings/useSettings'

interface I18nValue {
  locale: Locale
  t: (key: MessageKey, params?: MessageParams) => string
}

const I18nContext = createContext<I18nValue | null>(null)

// O idioma vem das configurações (revoga D-11) e troca na hora ao mudar.
// Sem `settings` (testes), usa uma loja em memória com os padrões (pt-BR).
export function I18nProvider({ children, settings }: { children: ReactNode; settings?: SettingsStore }) {
  const [fallback] = useState(() => (settings ? null : new SettingsStore(new MemoryStorage(), defaultSettings())))
  const store = settings ?? fallback!
  const locale = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.current.locale,
  )
  const value = useMemo<I18nValue>(() => ({ locale, t: (key, params) => translate(locale, key, params) }), [locale])
  // Título da aba com a versão (D-07) e idioma do documento.
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = `${translate(locale, 'app.title')} v${__APP_VERSION__}`
  }, [locale])
  return (
    <SettingsContext.Provider value={store}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </SettingsContext.Provider>
  )
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n fora de I18nProvider')
  return value
}
