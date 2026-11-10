// Dicionário de referência: combina interface (ui/) e conteúdo (content/) e define
// o conjunto de chaves que todo idioma deve ter. Os textos ficam nos arquivos de origem.
import { contentPtBR } from './content/pt-BR'
import { uiPtBR } from './ui/pt-BR'

export const ptBR = { ...uiPtBR, ...contentPtBR }

export type MessageKey = keyof typeof ptBR
