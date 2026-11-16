import type { MetaState, TemporaryBonus } from '../state'

// Bônus temporários genéricos (D-10, camada Π temporários; GDD 9.3). Regras puras sobre
// `meta`; o engine emite os eventos e invalida a produção. Sem fontes reais no M4.

export type GrantBonusResult = { ok: true; bonus: TemporaryBonus; refreshed: boolean } | { ok: false; reason: 'invalid' }

// Concede um bônus. Mesmo id já ativo é renovado: substitui multiplicador e tempo (não soma).
export function grantTemporaryBonus(meta: MetaState, bonus: TemporaryBonus): GrantBonusResult {
  const { id, multiplier, remainingMs } = bonus
  if (
    typeof id !== 'string' ||
    id === '' ||
    !Number.isFinite(multiplier) ||
    multiplier <= 0 ||
    !Number.isFinite(remainingMs) ||
    remainingMs <= 0
  ) {
    return { ok: false, reason: 'invalid' }
  }
  const stored = { id, multiplier, remainingMs }
  const index = meta.temporaryBonuses.findIndex((b) => b.id === id)
  if (index >= 0) meta.temporaryBonuses[index] = stored
  else meta.temporaryBonuses.push(stored)
  return { ok: true, bonus: { ...stored }, refreshed: index >= 0 }
}

// Produto dos multiplicadores dos bônus ativos (1 sem bônus).
export function bonusesMultiplier(meta: MetaState): number {
  return meta.temporaryBonuses.reduce((product, b) => product * b.multiplier, 1)
}

// Desconta `ms` de cada bônus; devolve os que expiraram, na ordem da lista.
export function tickBonuses(meta: MetaState, ms: number): TemporaryBonus[] {
  const expired: TemporaryBonus[] = []
  const alive: TemporaryBonus[] = []
  for (const b of meta.temporaryBonuses) {
    b.remainingMs -= ms
    if (b.remainingMs <= 0) expired.push({ ...b, remainingMs: 0 })
    else alive.push(b)
  }
  if (expired.length > 0) meta.temporaryBonuses = alive
  return expired
}
