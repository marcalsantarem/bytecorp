// Textos do tutorial contextual (GDD 16.1, T-087): `tutorial.<id>.title|text`.
export const tutorialPtBR = {
  'tutorial.click.title': 'Primeiros Bytes',
  'tutorial.click.text': 'Clique no botão para gerar Bytes.',
  'tutorial.firstEquipment.title': 'Primeiro equipamento',
  'tutorial.firstEquipment.text': 'Você já pode comprar um equipamento. Ele gera Bytes sozinho.',
  'tutorial.passiveProduction.title': 'Produção passiva',
  'tutorial.passiveProduction.text': 'Equipamentos produzem Bytes por segundo, mesmo sem cliques.',
  'tutorial.firstAgent.title': 'Primeiro agente',
  'tutorial.firstAgent.text': 'Contrate um agente: ele dá bônus a toda a produção.',
  'tutorial.upgrades.title': 'Melhorias',
  'tutorial.upgrades.text': 'Compre uma melhoria para um ganho permanente nesta execução.',
  'tutorial.achievements.title': 'Conquistas',
  'tutorial.achievements.text': 'Você desbloqueou uma conquista. Veja as próximas e suas recompensas.',
  'tutorial.reboot.title': 'Reboot',
  'tutorial.reboot.text': 'O Reboot reinicia a execução e dá Quantum Cores, que ficam para sempre.',
  'tutorial.quantumTree.title': 'Árvore Quantum',
  'tutorial.quantumTree.text': 'Gaste Quantum Cores na árvore para bônus permanentes.',
}

export type TutorialMessageKey = keyof typeof tutorialPtBR
