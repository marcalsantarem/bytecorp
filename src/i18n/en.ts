import { contentEn } from './content/en'
import type { MessageKey } from './pt-BR'
import { uiEn } from './ui/en'

export const en: Record<MessageKey, string> = { ...uiEn, ...contentEn }
