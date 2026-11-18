import { contentEn } from './content/en'
import type { MessageKey } from './pt-BR'
import { uiEn } from './ui/en'

import { tutorialEn } from './tutorial/en'
import { notificationsEn } from './notifications/en'
import { achievementsEn } from './achievements/en'

export const en: Record<MessageKey, string> = { ...uiEn, ...contentEn, ...tutorialEn, ...notificationsEn, ...achievementsEn }
