import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../core/format'
import { detectLocale, translate, type MessageKey, type MessageParams } from '../i18n'

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, params?: MessageParams) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children, initial, onChange }: { children: ReactNode; initial?: Locale; onChange?: (locale: Locale) => void }) {
  const [locale, setLocaleState] = useState<Locale>(() => initial ?? detectLocale(navigator.languages))
  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      document.documentElement.lang = next
      onChange?.(next)
    },
    [onChange],
  )
  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: (key, params) => translate(locale, key, params) }),
    [locale, setLocale],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n fora de I18nProvider')
  return value
}
