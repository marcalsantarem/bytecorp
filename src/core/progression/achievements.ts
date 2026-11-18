import type { AchievementDef, AchievementRequirement, AchievementReward } from '../catalog/achievements'
import type { Catalog } from '../catalog/types'
import { D, type Decimal } from '../decimal'
import type { GameState, MetaState } from '../state'
import { grantTemporaryBonus } from './temporaryBonuses'
import { spentCores } from './quantum'

// Regras de conquistas (GDD 11), puras sobre o estado. O engine avalia, invalida a produção
// e emite os eventos. Progresso sempre derivado do estado: nenhum contador duplicado.

export interface AchievementContext {
  state: GameState
  catalog: Catalog
  // Leituras caras, só chamadas pelos requisitos que as usam.
  bytesPerSecond: () => Decimal
  rebootRewardNow: () => number
}

export interface AchievementProgress {
  current: Decimal
  target: Decimal
}

function sum(values: Iterable<number>): number {
  let total = 0
  for (const v of values) total += v
  return total
}

function stageOrderOf(catalog: Catalog, id: string): number {
  return catalog.stages.find((s) => s.id === id)?.order ?? -1
}

// Progresso atual e alvo de um requisito (current pode passar de target; quem exibe limita).
export function requirementProgress(req: AchievementRequirement, ctx: AchievementContext): AchievementProgress {
  const { state, catalog } = ctx
  const target = (n: number) => D(n)
  switch (req.kind) {
    case 'bytesEarnedAllTime':
      return { current: state.stats.bytesEarnedAllTime, target: target(req.amount) }
    case 'bytesEarnedInRun':
      return { current: state.run.bytesEarned, target: target(req.amount) }
    case 'bytesPerSecond':
      return { current: ctx.bytesPerSecond(), target: target(req.amount) }
    case 'clicks':
      return { current: D(state.stats.clicks), target: target(req.amount) }
    case 'criticalClicks':
      return { current: D(state.stats.criticalClicks), target: target(req.amount) }
    case 'equipmentTotal':
      return { current: D(sum(Object.values(state.run.equipment))), target: target(req.amount) }
    case 'equipmentOwned':
      return { current: D(state.run.equipment[req.equipment] ?? 0), target: target(req.amount) }
    case 'agentsTotal':
      return { current: D(sum(Object.values(state.run.agents).map((a) => a.count))), target: target(req.amount) }
    case 'agentsDistinct':
      return { current: D(Object.values(state.run.agents).filter((a) => a.count > 0).length), target: target(req.amount) }
    case 'agentLevel': {
      const entries = req.agent === undefined ? Object.values(state.run.agents) : [state.run.agents[req.agent]]
      const level = Math.max(0, ...entries.map((a) => (a && a.count > 0 ? a.level : 0)))
      return { current: D(level), target: target(req.amount) }
    }
    case 'reboots':
      return { current: D(state.stats.reboots), target: target(req.amount) }
    case 'coresInRun':
      return { current: D(ctx.rebootRewardNow()), target: target(req.amount) }
    case 'quantumCoresTotal':
      return { current: state.meta.quantumCores.add(spentCores(state, catalog)), target: target(req.amount) }
    case 'quantumNodeLevels':
      return { current: D(sum(Object.values(state.meta.quantumNodes))), target: target(req.amount) }
    case 'quantumNode':
      return { current: D(state.meta.quantumNodes[req.node] ?? 0), target: target(req.amount) }
    case 'treeResets':
      return { current: D(state.meta.treeResets), target: target(req.amount) }
    case 'stageReached': {
      // Posição no catálogo + 1, para o alvo do primeiro estágio não ser 0.
      const wanted = stageOrderOf(catalog, req.stage)
      const now = stageOrderOf(catalog, state.run.stage)
      return { current: D(now + 1), target: D(wanted + 1) }
    }
    case 'playTimeMs':
      return { current: D(state.stats.playTimeMs), target: target(req.amount) }
  }
}

export function isRequirementSatisfied(req: AchievementRequirement, ctx: AchievementContext): boolean {
  const { current, target } = requirementProgress(req, ctx)
  return current.gte(target)
}

// Garante os campos opcionais de conquistas em `meta` (saves antigos ou do codec). Idempotente.
export function ensureAchievementMeta(meta: MetaState): void {
  meta.achievementUnlocks ??= {}
  meta.achievementRewardsDelivered ??= []
  meta.achievementQueue ??= []
}

export function isUnlocked(meta: MetaState, id: string): boolean {
  return meta.achievements.includes(id)
}

// Conquistas ainda bloqueadas cujo requisito já está atendido, na ordem do catálogo.
export function satisfiedLocked(defs: readonly AchievementDef[], ctx: AchievementContext): AchievementDef[] {
  const { meta } = ctx.state
  return defs.filter((d) => !isUnlocked(meta, d.id) && isRequirementSatisfied(d.requirement, ctx))
}

export type UnlockResult = { unlocked: false } | { unlocked: true; reward: AchievementReward; temporaryGranted: boolean }

// Desbloqueia e entrega a recompensa uma única vez. Idempotente: já desbloqueada não faz nada.
// Bytes da recompensa entram no saldo, mas não em "gerados" (não alimentam outros requisitos).
export function unlockAchievement(state: GameState, def: AchievementDef, now: number): UnlockResult {
  const { meta } = state
  ensureAchievementMeta(meta)
  if (isUnlocked(meta, def.id)) return { unlocked: false }
  meta.achievements.push(def.id)
  meta.achievementUnlocks![def.id] = { at: now, playTimeMs: state.stats.playTimeMs }
  meta.achievementQueue!.push(def.id)
  let temporaryGranted = false
  const delivered = meta.achievementRewardsDelivered!
  if (!delivered.includes(def.id)) {
    delivered.push(def.id)
    const reward = def.reward
    if (reward.kind === 'bytes') state.run.bytes = state.run.bytes.add(reward.amount)
    else if (reward.kind === 'quantumCores') meta.quantumCores = meta.quantumCores.add(reward.amount)
    else {
      temporaryGranted = grantTemporaryBonus(meta, {
        id: `achievement:${def.id}`,
        multiplier: reward.multiplier,
        remainingMs: reward.minutes * 60_000,
      }).ok
    }
  }
  return { unlocked: true, reward: def.reward, temporaryGranted }
}

// Visão para a interface. Secreta bloqueada: sem textos, progresso nem recompensa; só a pista.
export interface AchievementInfo {
  id: string
  category: AchievementDef['category']
  rarity: AchievementDef['rarity']
  secret: boolean
  unlocked: boolean
  unlockedAt: { at: number; playTimeMs: number } | null
  nameKey: AchievementDef['nameKey'] | null
  descriptionKey: AchievementDef['descriptionKey'] | null
  hintKey: AchievementDef['hintKey'] | null
  progress: AchievementProgress | null
  reward: AchievementReward | null
}

export function achievementInfo(def: AchievementDef, ctx: AchievementContext): AchievementInfo {
  const { meta } = ctx.state
  const unlocked = isUnlocked(meta, def.id)
  const hidden = def.secret === true && !unlocked
  let progress: AchievementProgress | null = null
  if (!hidden) {
    const p = requirementProgress(def.requirement, ctx)
    progress = { current: p.current.gt(p.target) || unlocked ? p.target : p.current, target: p.target }
  }
  return {
    id: def.id,
    category: def.category,
    rarity: def.rarity,
    secret: def.secret === true,
    unlocked,
    unlockedAt: meta.achievementUnlocks?.[def.id] ?? null,
    nameKey: hidden ? null : def.nameKey,
    descriptionKey: hidden ? null : def.descriptionKey,
    hintKey: def.hintKey ?? null,
    progress,
    reward: hidden ? null : def.reward,
  }
}

// Problemas estruturais de um catálogo de conquistas (a T-078 liga isto ao validateCatalog).
export function validateAchievements(
  defs: readonly AchievementDef[],
  catalog: Catalog,
  isMessageKey: (key: string) => boolean,
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const d of defs) {
    const where = `achievement ${d.id}`
    if (seen.has(d.id)) problems.push(`id duplicado: ${where}`)
    seen.add(d.id)
    for (const key of [d.nameKey, d.descriptionKey, ...(d.hintKey ? [d.hintKey] : [])]) {
      if (!isMessageKey(key)) problems.push(`${where}: chave de i18n inexistente "${key}"`)
    }
    if (d.secret && !d.hintKey) problems.push(`${where}: secreta sem pista`)
    const req = d.requirement
    if ('amount' in req && !(req.amount > 0)) problems.push(`${where}: alvo deve ser > 0`)
    if (req.kind === 'equipmentOwned' && !catalog.equipment.some((e) => e.id === req.equipment)) problems.push(`${where}: equipamento inexistente "${req.equipment}"`)
    if (req.kind === 'agentLevel' && req.agent !== undefined && !catalog.agents.some((a) => a.id === req.agent)) problems.push(`${where}: agente inexistente "${req.agent}"`)
    if (req.kind === 'quantumNode' && !catalog.quantumNodes.some((n) => n.id === req.node)) problems.push(`${where}: nó inexistente "${req.node}"`)
    if (req.kind === 'stageReached' && !catalog.stages.some((s) => s.id === req.stage)) problems.push(`${where}: estágio inexistente "${req.stage}"`)
    const r = d.reward
    if (r.kind === 'temporaryBonus' && !(r.multiplier > 1)) problems.push(`${where}: multiplicador do bônus deve ser > 1`)
    if ((r.kind === 'bytes' || r.kind === 'quantumCores') && !(r.amount > 0)) problems.push(`${where}: recompensa deve ser > 0`)
  }
  return problems
}
