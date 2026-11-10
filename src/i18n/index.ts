import type { Locale } from '../core/format'
import { en } from './en'
import { ptBR, type MessageKey } from './pt-BR'

export type { MessageKey }

// Para adicionar um idioma: criar o dicionário tipado como Record<MessageKey, string>,
// registrar aqui e incluir o código em Locale (src/core/format.ts).
export const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = {
  'pt-BR': ptBR,
  en,
}

export const LOCALES = Object.keys(DICTIONARIES) as Locale[]
export const DEFAULT_LOCALE: Locale = 'pt-BR'

export type MessageParams = Record<string, string | number>

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const template = DICTIONARIES[locale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}

export function isMessageKey(key: string): key is MessageKey {
  return key in ptBR
}

export function detectLocale(languages: readonly string[]): Locale {
  for (const lang of languages) {
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR'
    if (lang.toLowerCase().startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}
