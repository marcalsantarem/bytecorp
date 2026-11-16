import { ACCELERATOR_GRANTS as CATALOG_ACCELERATOR_GRANTS } from '../catalog/accelerators'
import type { StageId } from '../catalog/types'
import type { AcceleratorItem, MetaState, TemporaryBonus } from '../state'
import type { OfflineSegment } from './offline'
import { bonusesMultiplier, tickBonuses } from './temporaryBonuses'

// Aceleradores (GDD 13): multiplicadores de 2x e 5x, durações de 15, 30 e 60 min, um só ativo
// por vez, sem ativação automática. Funções puras sobre `meta`; o engine emite eventos.

export const ACCELERATOR_MULTIPLIERS = [2, 5] as const
export const ACCELERATOR_DURATIONS_MIN = [15, 30, 60] as const

export interface AcceleratorGrant {
  multiplier: (typeof ACCELERATOR_MULTIPLIERS)[number]
  durationMin: (typeof ACCELERATOR_DURATIONS_MIN)[number]
}

// Concessões por marco (D-16): `stage` na primeira entrada em cada estágio (o inicial não
// concede); `reboot` em cada Reboot (primeira vez em cada número de Reboot).
export interface AcceleratorGrantTable {
  stage: Partial<Record<StageId, AcceleratorGrant[]>>
  reboot: AcceleratorGrant[]
}

// Tabela real do catálogo (T-070, docs/AG07/aceleradores-m4.md).
export const ACCELERATOR_GRANTS: AcceleratorGrantTable = CATALOG_ACCELERATOR_GRANTS

// Aviso de fim: faltando este tempo, emite acceleratorEnding uma vez.
export const DEFAULT_ACCELERATOR_ENDING_MS = 30_000

export type ReplaceMode = 'discard' | 'store'

export type ActivateResult =
  | { ok: true; active: AcceleratorItem; replaced: 'none' | ReplaceMode; previous: AcceleratorItem | null }
  | { ok: false; reason: 'notFound' }
  // Há um ativo e a opção faltou: nada foi alterado; a interface compara e pergunta.
  | { ok: false; needsDecision: true; current: AcceleratorItem; incoming: AcceleratorItem }

export function grantKey(kind: 'stage' | 'reboot', value: string | number): string {
  return `${kind}:${value}`
}

// Concede os itens de uma chave de marco, uma única vez. Devolve os itens criados ([] se repetida).
export function grantAccelerators(meta: MetaState, key: string, grants: readonly AcceleratorGrant[]): AcceleratorItem[] {
  const state = meta.accelerators
  if (state.granted.includes(key)) return []
  state.granted.push(key)
  const created: AcceleratorItem[] = []
  for (const g of grants) {
    const item: AcceleratorItem = {
      id: `acc-${state.nextItemId++}`,
      multiplier: g.multiplier,
      remainingMs: g.durationMin * 60_000,
    }
    state.inventory.push(item)
    created.push({ ...item })
  }
  return created
}

export function activateAccelerator(meta: MetaState, itemId: string, replace?: ReplaceMode): ActivateResult {
  const state = meta.accelerators
  const index = state.inventory.findIndex((i) => i.id === itemId)
  const incoming = state.inventory[index]
  if (!incoming) return { ok: false, reason: 'notFound' }
  const current = state.active
  if (current && !replace) return { ok: false, needsDecision: true, current: { ...current }, incoming: { ...incoming } }
  state.inventory.splice(index, 1)
  if (current && replace === 'store') state.inventory.push(current)
  state.active = incoming
  return {
    ok: true,
    active: { ...incoming },
    replaced: current ? (replace as ReplaceMode) : 'none',
    previous: current ? { ...current } : null,
  }
}

export interface TimerTick {
  expiredAccelerator: AcceleratorItem | null
  // Acelerador que cruzou o limiar de aviso neste desconto (e não expirou).
  endingAccelerator: AcceleratorItem | null
  expiredBonuses: TemporaryBonus[]
}

// Desconta `ms` do acelerador ativo e dos bônus. Itens do inventário não correm.
export function tickTimers(meta: MetaState, ms: number, endingMs: number): TimerTick {
  const tick: TimerTick = { expiredAccelerator: null, endingAccelerator: null, expiredBonuses: [] }
  const active = meta.accelerators.active
  if (active) {
    const before = active.remainingMs
    active.remainingMs = before - ms
    if (active.remainingMs <= 0) {
      tick.expiredAccelerator = { ...active, remainingMs: 0 }
      meta.accelerators.active = null
    } else if (before > endingMs && active.remainingMs <= endingMs) {
      tick.endingAccelerator = { ...active }
    }
  }
  tick.expiredBonuses = tickBonuses(meta, ms)
  return tick
}

// Menor tempo até o próximo vencimento (Infinity sem temporizadores). O engine corta o passo
// aqui, para que a produção mude exatamente no instante da expiração.
export function nextTimerMs(meta: MetaState): number {
  let next = meta.accelerators.active?.remainingMs ?? Infinity
  for (const b of meta.temporaryBonuses) next = Math.min(next, b.remainingMs)
  return next
}

// Multiplicador de temporários (D-17): acelerador ativo × bônus ativos.
export function temporaryMultiplier(meta: MetaState): number {
  return (meta.accelerators.active?.multiplier ?? 1) * bonusesMultiplier(meta)
}

// Trechos de ausência com o multiplicador de temporários vigente em cada um (13.3: o tempo corre
// offline). O que passar do último vencimento fica a cargo do multiplicador 1 do computeOffline.
// Não altera o estado; o desconto é feito por tickTimers(meta, awayMs, ...).
export function offlineSegmentsFor(meta: MetaState, awayMs: number): OfflineSegment[] {
  if (!Number.isFinite(awayMs) || awayMs <= 0) return []
  const timers = [...meta.temporaryBonuses.map((b) => b.remainingMs)]
  if (meta.accelerators.active) timers.push(meta.accelerators.active.remainingMs)
  const points = [...new Set(timers.filter((t) => t < awayMs))].sort((a, b) => a - b)
  points.push(Math.min(awayMs, Math.max(0, ...timers)))
  const segments: OfflineSegment[] = []
  let from = 0
  for (const to of points) {
    if (to <= from) continue
    // Um temporizador vale no trecho se ainda restava tempo no início dele.
    let multiplier = 1
    const a = meta.accelerators.active
    if (a && a.remainingMs > from) multiplier *= a.multiplier
    for (const b of meta.temporaryBonuses) if (b.remainingMs > from) multiplier *= b.multiplier
    segments.push({ durationMs: to - from, multiplier })
    from = to
  }
  return segments
}
