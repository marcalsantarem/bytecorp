// Textos de interface (referência): define as chaves de interface que todo idioma deve ter.
export const uiPtBR = {
  'app.title': 'Byte Corp Idle',
  'hud.bytes': 'Bytes',
  'hud.production': 'Produção',
  'hud.quantumCores': 'Quantum Cores',
  'click.button': 'Processar dados',
  'click.perClick': '+{value} por clique',
  'settings.language': 'Idioma',
  'language.pt-BR': 'Português (Brasil)',
  'language.en': 'English',
  'save.corrupt.title': 'Salvamento inválido',
  'save.corrupt.body': 'O salvamento deste navegador está corrompido ou em um formato que não pode ser lido. É possível iniciar um novo jogo.',
  'save.corrupt.newGame': 'Iniciar novo jogo',
  'loading': 'Carregando…',
} as const

export type UiMessageKey = keyof typeof uiPtBR
