import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { Locale } from '../core/format'
import { translate, type MessageKey, type MessageParams } from '../i18n'

interface I18nValue {
  locale: Locale
  t: (key: MessageKey, params?: MessageParams) => string
}

const I18nContext = createContext<I18nValue | null>(null)

// Idioma fixo em pt-BR até a janela de configurações (D-11): ignora o idioma do
// navegador e qualquer idioma salvo. A infraestrutura de i18n continua pronta.
const LOCALE: Locale = 'pt-BR'

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nValue>(() => ({ locale: LOCALE, t: (key, params) => translate(LOCALE, key, params) }), [])
  // Título da aba com a versão (D-07) e idioma do documento.
  useEffect(() => {
    document.documentElement.lang = LOCALE
    document.title = `${translate(LOCALE, 'app.title')} v${__APP_VERSION__}`
  }, [])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n fora de I18nProvider')
  return value
}
