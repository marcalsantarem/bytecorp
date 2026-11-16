import type { MessageKey } from '../../i18n'
import type { StageId } from './types'

// Catálogo de aceleradores (GDD 13, D-16, D-18, T-070). Seis itens (2x e 5x, 15/30/60 min) e a tabela
// de concessões por marco: um item 2x na primeira entrada em cada estágio (o inicial não concede); o
// Reboot não concede (tabela vazia, o mecanismo existe para eventos futuros). Os itens 5x e de 60 min
// ficam no catálogo, sem concessão por marco. Valores justificados em docs/AG07/aceleradores-m4.md.

export type AcceleratorMultiplier = 2 | 5
export type AcceleratorDurationMin = 15 | 30 | 60

export interface AcceleratorItemDef {
  id: string
  multiplier: AcceleratorMultiplier
  durationMin: AcceleratorDurationMin
  icon: string
  nameKey: MessageKey
  descriptionKey: MessageKey
}

export interface AcceleratorGrantDef {
  multiplier: AcceleratorMultiplier
  durationMin: AcceleratorDurationMin
}

export interface AcceleratorGrantsDef {
  stage: Partial<Record<StageId, AcceleratorGrantDef[]>>
  reboot: AcceleratorGrantDef[]
}

export const ACCELERATOR_ITEMS: AcceleratorItemDef[] = [
  { id: 'accelerator_2x_15', multiplier: 2, durationMin: 15, icon: 'zap', nameKey: 'accelerator.2x_15.name', descriptionKey: 'accelerator.2x_15.desc' },
  { id: 'accelerator_2x_30', multiplier: 2, durationMin: 30, icon: 'zap', nameKey: 'accelerator.2x_30.name', descriptionKey: 'accelerator.2x_30.desc' },
  { id: 'accelerator_2x_60', multiplier: 2, durationMin: 60, icon: 'zap', nameKey: 'accelerator.2x_60.name', descriptionKey: 'accelerator.2x_60.desc' },
  { id: 'accelerator_5x_15', multiplier: 5, durationMin: 15, icon: 'rocket', nameKey: 'accelerator.5x_15.name', descriptionKey: 'accelerator.5x_15.desc' },
  { id: 'accelerator_5x_30', multiplier: 5, durationMin: 30, icon: 'rocket', nameKey: 'accelerator.5x_30.name', descriptionKey: 'accelerator.5x_30.desc' },
  { id: 'accelerator_5x_60', multiplier: 5, durationMin: 60, icon: 'rocket', nameKey: 'accelerator.5x_60.name', descriptionKey: 'accelerator.5x_60.desc' },
]

export const ACCELERATOR_GRANTS: AcceleratorGrantsDef = {
  stage: {
    garage_company: [{ multiplier: 2, durationMin: 15 }],
    startup_lab: [{ multiplier: 2, durationMin: 15 }],
    data_center: [{ multiplier: 2, durationMin: 30 }],
    corporate_network: [{ multiplier: 2, durationMin: 15 }],
    quantum_facility: [{ multiplier: 2, durationMin: 15 }],
    mega_corporation: [{ multiplier: 2, durationMin: 30 }],
  },
  reboot: [],
}

export function acceleratorItemFor(multiplier: number, durationMin: number): AcceleratorItemDef | undefined {
  return ACCELERATOR_ITEMS.find((i) => i.multiplier === multiplier && i.durationMin === durationMin)
}

// Problemas da tabela de concessões e dos itens (lista vazia = válido). `stageIds` são os estágios do
// catálogo; o estágio inicial não concede.
export function validateAccelerators(
  items: readonly AcceleratorItemDef[],
  grants: AcceleratorGrantsDef,
  stageIds: readonly string[],
  isKey: (key: string) => boolean,
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const i of items) {
    const where = `accelerator ${i.id}`
    if (seen.has(i.id)) problems.push(`id duplicado: ${where}`)
    seen.add(i.id)
    if (![2, 5].includes(i.multiplier)) problems.push(`${where}: multiplicador deve ser 2 ou 5`)
    if (![15, 30, 60].includes(i.durationMin)) problems.push(`${where}: duração deve ser 15, 30 ou 60 min`)
    if (!isKey(i.nameKey)) problems.push(`${where}: chave de i18n inexistente "${i.nameKey}"`)
    if (!isKey(i.descriptionKey)) problems.push(`${where}: chave de i18n inexistente "${i.descriptionKey}"`)
  }
  const combos = new Set(items.map((i) => `${i.multiplier}:${i.durationMin}`))
  if (combos.size !== items.length) problems.push('accelerator: combinação de multiplicador e duração repetida')

  const checkList = (where: string, list: readonly AcceleratorGrantDef[], mayBeEmpty = false) => {
    if (list.length === 0 && !mayBeEmpty) problems.push(`${where}: sem concessão`)
    const keys = new Set<string>()
    for (const g of list) {
      const key = `${g.multiplier}:${g.durationMin}`
      if (!combos.has(key)) problems.push(`${where}: concessão ${g.multiplier}x/${g.durationMin} min sem item no catálogo`)
      if (keys.has(key)) problems.push(`${where}: concessão duplicada ${g.multiplier}x/${g.durationMin} min`)
      keys.add(key)
    }
  }
  for (const [stage, list] of Object.entries(grants.stage)) {
    if (!stageIds.includes(stage)) problems.push(`concessão em estágio inexistente "${stage}"`)
    else if (stage === stageIds[0]) problems.push('o estágio inicial não concede acelerador')
    checkList(`concessão do estágio ${stage}`, list ?? [])
  }
  checkList('concessão do Reboot', grants.reboot, true)
  return problems
}
