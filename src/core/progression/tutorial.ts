import type { TutorialCondition, TutorialStepDef } from '../catalog/tutorial'
import type { GameState, MetaState } from '../state'

// Tutorial contextual (GDD 16.1). Um passo ativo por vez; o progresso fica em meta.tutorial
// (sobrevive ao Reboot; Novo jogo cria estado novo e zera). Passo dispensado conta como concluído.

export interface TutorialContext {
  state: GameState
  canAffordEquipment: () => boolean
  canAffordAgent: () => boolean
  canAffordUpgrade: () => boolean
  rebootAvailable: () => boolean
}

export function tutorialConditionMet(c: TutorialCondition, ctx: TutorialContext): boolean {
  const { run, meta, stats } = ctx.state
  switch (c.kind) {
    case 'always':
      return true
    case 'manual':
      return false
    case 'clicks':
      return stats.clicks >= c.amount
    case 'equipmentTotal':
      return sum(Object.values(run.equipment)) >= c.amount
    case 'agentsTotal':
      return sum(Object.values(run.agents).map((a) => a.count)) >= c.amount
    case 'upgradesBought':
      return run.upgrades.length >= c.amount
    case 'canAffordEquipment':
      return ctx.canAffordEquipment()
    case 'canAffordAgent':
      return ctx.canAffordAgent()
    case 'canAffordUpgrade':
      return ctx.canAffordUpgrade()
    case 'achievementsUnlocked':
      return meta.achievements.length >= c.amount
    case 'rebootAvailable':
      return ctx.rebootAvailable()
    case 'reboots':
      return stats.reboots >= c.amount
    case 'quantumNodeLevels':
      return sum(Object.values(meta.quantumNodes)) >= c.amount
  }
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export function isStepDone(meta: MetaState, id: string): boolean {
  return meta.tutorial.completedSteps.includes(id)
}

// Marca como concluído (sem exibir) todo passo cuja ação já foi feita, ativo ou não:
// quem já comprou um agente não precisa do passo que ensina a comprar. Devolve os ids marcados.
export function autoCompleteSteps(steps: readonly TutorialStepDef[], ctx: TutorialContext): string[] {
  const { meta } = ctx.state
  const done: string[] = []
  for (const s of steps) {
    if (isStepDone(meta, s.id) || !tutorialConditionMet(s.completion, ctx)) continue
    meta.tutorial.completedSteps.push(s.id)
    done.push(s.id)
  }
  return done
}

// Passo ativo: o atual segue ativo enquanto não for concluído, mesmo que a ativação deixe de valer
// (evita sumir e voltar ao gastar o saldo). Sem atual, o primeiro não concluído, na ordem, cuja
// ativação vale. Tutorial dispensado não tem passo.
export function selectTutorialStep(
  steps: readonly TutorialStepDef[],
  current: string | null,
  ctx: TutorialContext,
): string | null {
  const { meta } = ctx.state
  if (meta.tutorial.dismissed) return null
  if (current !== null && steps.some((s) => s.id === current) && !isStepDone(meta, current)) return current
  for (const s of steps) {
    if (!isStepDone(meta, s.id) && tutorialConditionMet(s.activation, ctx)) return s.id
  }
  return null
}

// Marca um passo como concluído; false se não existe ou já estava concluído.
export function markStepDone(steps: readonly TutorialStepDef[], meta: MetaState, id: string): boolean {
  if (!steps.some((s) => s.id === id) || isStepDone(meta, id)) return false
  meta.tutorial.completedSteps.push(id)
  return true
}
