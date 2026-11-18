import type { MessageKey } from '../../i18n/pt-BR'

// Tutorial contextual (GDD 16.1), orientado a dados: passos em ordem, cada um com condição de
// ativação, condição de conclusão e o alvo de interface que a UI destaca. A avaliação fica em
// progression/tutorial.ts.

// Condições lidas do estado (e, nas de "pode pagar", dos custos atuais com desconto).
export type TutorialCondition =
  | { kind: 'always' }
  // Só conclui pela API (o jogador confirma que leu ou abriu o painel). Não vale como ativação.
  | { kind: 'manual' }
  | { kind: 'clicks'; amount: number }
  // Equipamentos e agentes da execução atual.
  | { kind: 'equipmentTotal'; amount: number }
  | { kind: 'agentsTotal'; amount: number }
  // Melhorias compradas na execução atual.
  | { kind: 'upgradesBought'; amount: number }
  // Há equipamento, agente ou melhoria desbloqueado cujo próximo custo cabe no saldo.
  | { kind: 'canAffordEquipment' }
  | { kind: 'canAffordAgent' }
  | { kind: 'canAffordUpgrade' }
  | { kind: 'achievementsUnlocked'; amount: number }
  // O Reboot daria ao menos 1 Quantum Core agora.
  | { kind: 'rebootAvailable' }
  | { kind: 'reboots'; amount: number }
  // Soma dos níveis comprados na árvore Quantum.
  | { kind: 'quantumNodeLevels'; amount: number }

export interface TutorialStepDef {
  id: string
  titleKey: MessageKey
  textKey: MessageKey
  // Id de elemento que a interface destaca enquanto o passo está ativo.
  target: string
  activation: TutorialCondition
  completion: TutorialCondition
}

export const TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    id: 'click',
    titleKey: 'tutorial.click.title',
    textKey: 'tutorial.click.text',
    target: 'click-button',
    activation: { kind: 'always' },
    completion: { kind: 'clicks', amount: 1 },
  },
  {
    id: 'firstEquipment',
    titleKey: 'tutorial.firstEquipment.title',
    textKey: 'tutorial.firstEquipment.text',
    target: 'shop-equipment',
    activation: { kind: 'canAffordEquipment' },
    completion: { kind: 'equipmentTotal', amount: 1 },
  },
  {
    id: 'passiveProduction',
    titleKey: 'tutorial.passiveProduction.title',
    textKey: 'tutorial.passiveProduction.text',
    target: 'production-rate',
    activation: { kind: 'equipmentTotal', amount: 1 },
    completion: { kind: 'manual' },
  },
  {
    id: 'firstAgent',
    titleKey: 'tutorial.firstAgent.title',
    textKey: 'tutorial.firstAgent.text',
    target: 'shop-agents',
    activation: { kind: 'canAffordAgent' },
    completion: { kind: 'agentsTotal', amount: 1 },
  },
  {
    id: 'upgrades',
    titleKey: 'tutorial.upgrades.title',
    textKey: 'tutorial.upgrades.text',
    target: 'shop-upgrades',
    activation: { kind: 'canAffordUpgrade' },
    completion: { kind: 'upgradesBought', amount: 1 },
  },
  {
    id: 'achievements',
    titleKey: 'tutorial.achievements.title',
    textKey: 'tutorial.achievements.text',
    target: 'achievements-button',
    activation: { kind: 'achievementsUnlocked', amount: 1 },
    completion: { kind: 'manual' },
  },
  {
    id: 'reboot',
    titleKey: 'tutorial.reboot.title',
    textKey: 'tutorial.reboot.text',
    target: 'reboot-button',
    activation: { kind: 'rebootAvailable' },
    completion: { kind: 'reboots', amount: 1 },
  },
  {
    id: 'quantumTree',
    titleKey: 'tutorial.quantumTree.title',
    textKey: 'tutorial.quantumTree.text',
    target: 'quantum-button',
    activation: { kind: 'reboots', amount: 1 },
    completion: { kind: 'quantumNodeLevels', amount: 1 },
  },
]

// Problemas estruturais de uma lista de passos (vazia = válida). Roda nos testes.
export function validateTutorialSteps(steps: readonly TutorialStepDef[], isMessageKey: (key: string) => boolean): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  for (const s of steps) {
    const where = `tutorial ${s.id}`
    if (ids.has(s.id)) problems.push(`id duplicado: tutorial:${s.id}`)
    ids.add(s.id)
    if (!isMessageKey(s.titleKey)) problems.push(`${where}: chave de i18n inexistente "${s.titleKey}"`)
    if (!isMessageKey(s.textKey)) problems.push(`${where}: chave de i18n inexistente "${s.textKey}"`)
    if (!s.target) problems.push(`${where}: alvo de interface vazio`)
    if (s.activation.kind === 'manual') problems.push(`${where}: ativação não pode ser manual`)
    for (const c of [s.activation, s.completion]) {
      if ('amount' in c && !(Number.isFinite(c.amount) && c.amount >= 0)) problems.push(`${where}: quantidade inválida`)
    }
  }
  return problems
}
