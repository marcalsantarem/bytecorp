import { isMessageKey } from '../../i18n'
import { AGENTS } from './agents'
import { EQUIPMENT } from './equipment'
import { STAGES } from './stages'
import { UPGRADES } from './upgrades'
import type { Catalog, Requirement } from './types'

export * from './types'

export const CATALOG: Catalog = {
  stages: STAGES,
  equipment: EQUIPMENT,
  agents: AGENTS,
  upgrades: UPGRADES,
  quantumNodes: [],
}

// Verifica a consistência estrutural de um catálogo. Retorna a lista de problemas
// encontrados; um catálogo válido retorna lista vazia. Roda nos testes.
export function validateCatalog(catalog: Catalog): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  const equipmentIds = new Set(catalog.equipment.map((e) => e.id))
  const nodeIds = new Set(catalog.quantumNodes.map((n) => n.id))

  const checkId = (scope: string, id: string) => {
    const key = `${scope}:${id}`
    if (ids.has(key)) problems.push(`id duplicado: ${key}`)
    ids.add(key)
  }
  const checkKey = (where: string, key: string) => {
    if (!isMessageKey(key)) problems.push(`${where}: chave de i18n inexistente "${key}"`)
  }
  const checkRequirement = (where: string, req: Requirement) => {
    if (req.kind === 'equipmentOwned' && !equipmentIds.has(req.equipment)) {
      problems.push(`${where}: requisito aponta para equipamento inexistente "${req.equipment}"`)
    }
  }
  const checkCost = (where: string, base: number, growth: number) => {
    if (!(base >= 1)) problems.push(`${where}: custo base deve ser >= 1`)
    if (!(growth > 1)) problems.push(`${where}: fator de crescimento deve ser > 1`)
  }

  const orders = catalog.stages.map((s) => s.order)
  if (orders.some((o, i) => o !== i)) problems.push('estágios devem ter order sequencial a partir de 0')
  for (const s of catalog.stages) {
    checkId('stage', s.id)
    checkKey(`stage ${s.id}`, s.nameKey)
  }

  for (const e of catalog.equipment) {
    const where = `equipment ${e.id}`
    checkId('equipment', e.id)
    checkKey(where, e.nameKey)
    checkKey(where, e.descriptionKey)
    checkCost(where, e.baseCost, e.costGrowth)
    if (!(e.baseProduction > 0)) problems.push(`${where}: produção base deve ser > 0`)
    checkRequirement(where, e.unlock)
    checkRequirement(where, e.reveal)
  }

  // GDD 6.4: a ordem da loja é fixa por custo crescente dentro de cada categoria.
  const byCategory = new Map<string, number[]>()
  for (const e of catalog.equipment) byCategory.set(e.category, [...(byCategory.get(e.category) ?? []), e.baseCost])
  for (const [category, costs] of byCategory) {
    if (costs.some((c, i) => i > 0 && c < costs[i - 1]!)) problems.push(`categoria ${category}: equipamentos fora da ordem de custo crescente`)
  }

  for (const a of catalog.agents) {
    const where = `agent ${a.id}`
    checkId('agent', a.id)
    checkKey(where, a.nameKey)
    checkKey(where, a.descriptionKey)
    checkKey(where, a.specialtyKey)
    checkCost(where, a.baseCost, a.costGrowth)
    checkCost(`${where} (nível)`, a.levelBaseCost, a.levelCostGrowth)
    checkRequirement(where, a.unlock)
    checkRequirement(where, a.reveal)
  }

  for (const u of catalog.upgrades) {
    const where = `upgrade ${u.id}`
    checkId('upgrade', u.id)
    checkKey(where, u.nameKey)
    checkKey(where, u.descriptionKey)
    if (!(u.cost >= 1)) problems.push(`${where}: custo deve ser >= 1`)
  }

  for (const n of catalog.quantumNodes) {
    const where = `quantum ${n.id}`
    checkId('quantum', n.id)
    checkKey(where, n.nameKey)
    checkKey(where, n.descriptionKey)
    checkCost(where, n.baseCost, n.costGrowth)
    for (const p of n.prerequisites) {
      if (!nodeIds.has(p)) problems.push(`${where}: pré-requisito inexistente "${p}"`)
    }
  }

  return problems
}
