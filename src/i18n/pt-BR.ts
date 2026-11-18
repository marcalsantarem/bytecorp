// Dicionário de referência: combina interface (ui/) e conteúdo (content/) e define
// o conjunto de chaves que todo idioma deve ter. Os textos ficam nos arquivos de origem.
import { contentPtBR } from './content/pt-BR'
import { uiPtBR } from './ui/pt-BR'

import { tutorialPtBR } from './tutorial/pt-BR'
import { notificationsPtBR } from './notifications/pt-BR'
import { achievementsPtBR } from './achievements/pt-BR'

export const ptBR = { ...uiPtBR, ...contentPtBR, ...tutorialPtBR, ...notificationsPtBR, ...achievementsPtBR }

export type MessageKey = keyof typeof ptBR
