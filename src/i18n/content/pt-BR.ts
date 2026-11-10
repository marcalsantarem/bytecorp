// Textos de conteúdo (referência): estágios, categorias, equipamentos e, no futuro,
// agentes, melhorias, nós e conquistas.
export const contentPtBR = {
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

export type ContentMessageKey = keyof typeof contentPtBR
