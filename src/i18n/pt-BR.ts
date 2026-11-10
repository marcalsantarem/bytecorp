// Dicionário de referência: define o conjunto de chaves que todo idioma deve ter.
export const ptBR = {
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

  'stage.solo_hacker': 'Solo Hacker',
  'stage.garage_company': 'Garage Company',
  'stage.startup_lab': 'Startup Lab',
  'stage.data_center': 'Data Center',
  'stage.corporate_network': 'Corporate Network',
  'stage.quantum_facility': 'Quantum Facility',
  'stage.mega_corporation': 'Mega Corporation',

  'category.networking': 'Networking',
  'category.processing': 'Processing',
  'category.storage': 'Storage',
  'category.cooling': 'Cooling',
  'category.infrastructure': 'Infrastructure',

  'equipment.home_router.name': 'Roteador doméstico',
  'equipment.home_router.desc': 'Uma conexão improvisada que já trafega alguns pacotes.',
  'equipment.home_server.name': 'Servidor caseiro',
  'equipment.home_server.desc': 'Um gabinete velho rodando dia e noite debaixo da mesa.',
  'equipment.external_drive.name': 'HD externo',
  'equipment.external_drive.desc': 'Armazenamento barato para os primeiros dados.',
  'equipment.desk_fan.name': 'Ventilador de mesa',
  'equipment.desk_fan.desc': 'Mantém o hardware vivo por mais algumas horas.',
  'equipment.power_strip.name': 'Filtro de linha',
  'equipment.power_strip.desc': 'Energia para todos os equipamentos, com algum risco.',
} as const

export type MessageKey = keyof typeof ptBR
