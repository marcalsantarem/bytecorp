import type { GameEngine } from '../core/engine'
import type { Locale } from '../core/format'
import { translate, type MessageKey } from '../i18n'
import type { LocalNotifier, NotificationPermissionState } from '../platform/localNotifications'
import { NOTIFICATION_CATEGORIES, type NotificationCategory, type SettingsStore } from './settings'

// Notificações locais enquanto o jogo está aberto (GDD 22), só com a aba oculta.
// Eventos da mesma categoria que chegam juntos ou durante o intervalo mínimo
// viram uma notificação só, enviada quando o limite permitir.

export const NOTIFICATION_LIMITS = {
  // Espera para juntar eventos seguidos da mesma categoria.
  groupMs: 3_000,
  // Intervalo mínimo entre duas notificações quaisquer.
  globalMinMs: 2 * 60_000,
  // Intervalo mínimo entre duas notificações da mesma categoria.
  categoryMinMs: 10 * 60_000,
}

export type NotificationLimits = typeof NOTIFICATION_LIMITS

// Nomes de conquistas listados no corpo antes de "e mais N".
const MAX_NAMES = 3

export interface NotificationDeps {
  notifier: LocalNotifier
  isHidden: () => boolean
  onVisibilityChange: (cb: () => void) => () => void
  now?: () => number
  setTimer?: (cb: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
  limits?: NotificationLimits
}

interface Pending {
  // Nomes de conquista ou multiplicadores de acelerador, na ordem de chegada.
  items: string[]
  timer: unknown
}

export interface NotificationController {
  stop: () => void
}

// Liga os eventos do engine às notificações. Chamar uma vez, depois do boot.
export function startNotifications(engine: GameEngine, settings: SettingsStore, deps: NotificationDeps): NotificationController {
  const now = deps.now ?? Date.now
  const setTimer = deps.setTimer ?? ((cb, ms) => setTimeout(cb, ms))
  const clearTimer = deps.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>))
  const limits = deps.limits ?? NOTIFICATION_LIMITS
  const pending = new Map<NotificationCategory, Pending>()
  const lastAt = new Map<NotificationCategory, number>()
  let lastGlobal = -Infinity

  const allowed = (category: NotificationCategory): boolean => {
    const n = settings.current.notifications
    return n.enabled && n.categories[category] && deps.notifier.permission() === 'granted' && deps.isHidden()
  }

  const nextAllowedAt = (category: NotificationCategory): number =>
    Math.max((lastAt.get(category) ?? -Infinity) + limits.categoryMinMs, lastGlobal + limits.globalMinMs)

  const drop = (category: NotificationCategory) => {
    const p = pending.get(category)
    if (p) clearTimer(p.timer)
    pending.delete(category)
  }

  const dropAll = () => {
    for (const category of [...pending.keys()]) drop(category)
  }

  const schedule = (category: NotificationCategory, p: Pending, delayMs: number) => {
    p.timer = setTimer(() => flush(category), Math.max(0, delayMs))
  }

  const flush = (category: NotificationCategory) => {
    const p = pending.get(category)
    if (!p) return
    if (!allowed(category)) {
      drop(category)
      return
    }
    const t = now()
    const wait = nextAllowedAt(category) - t
    if (wait > 0) {
      schedule(category, p, wait)
      return
    }
    pending.delete(category)
    lastAt.set(category, t)
    lastGlobal = t
    const { title, body } = compose(category, p.items, settings.current.locale)
    void deps.notifier.show(title, { body, tag: `bytecorp-${category}` })
  }

  const enqueue = (category: NotificationCategory, item: string) => {
    if (!allowed(category)) return
    const existing = pending.get(category)
    if (existing) {
      existing.items.push(item)
      return
    }
    const p: Pending = { items: [item], timer: undefined }
    pending.set(category, p)
    schedule(category, p, Math.max(limits.groupMs, nextAllowedAt(category) - now()))
  }

  const offs = [
    engine.events.on('achievementUnlocked', ({ id }) => {
      const def = engine.achievementDefs.find((a) => a.id === id)
      enqueue('achievement', def ? def.nameKey : '')
    }),
    engine.events.on('acceleratorExpired', ({ item }) => enqueue('acceleratorExpired', String(item.multiplier))),
    // De volta ao jogo: o que estava pendente perde o sentido.
    deps.onVisibilityChange(() => {
      if (!deps.isHidden()) dropAll()
    }),
    settings.subscribe((s) => {
      if (!s.notifications.enabled) dropAll()
      else for (const c of NOTIFICATION_CATEGORIES) if (!s.notifications.categories[c]) drop(c)
    }),
    engine.events.on('stateReplaced', dropAll),
  ]

  return {
    stop: () => {
      dropAll()
      for (const off of offs) off()
    },
  }
}

function compose(category: NotificationCategory, items: string[], locale: Locale) {
  if (category === 'acceleratorExpired') {
    return {
      title: translate(locale, 'notification.acceleratorExpired.title'),
      body: translate(locale, 'notification.acceleratorExpired.body', { multiplier: items[items.length - 1] ?? '' }),
    }
  }
  const names = items.filter((k) => k !== '').map((k) => translate(locale, k as MessageKey))
  const shown = names.slice(0, MAX_NAMES).join(', ')
  const rest = names.length - MAX_NAMES
  const body = rest > 0 ? translate(locale, 'notification.achievement.more', { names: shown, count: rest }) : shown
  const title =
    items.length > 1
      ? translate(locale, 'notification.achievement.titleMany', { count: items.length })
      : translate(locale, 'notification.achievement.title')
  return { title, body }
}

export type EnableNotificationsResult = 'enabled' | Exclude<NotificationPermissionState, 'granted'>

// Para a UI: ligar a opção nas Configurações pede a permissão (ação do jogador).
// Só grava enabled=true se o navegador concedeu; desligar nunca pede nada.
export async function setNotificationsEnabled(
  settings: SettingsStore,
  notifier: LocalNotifier,
  enabled: boolean,
): Promise<EnableNotificationsResult | 'disabled'> {
  if (!enabled) {
    await settings.update({ notifications: { enabled: false } })
    return 'disabled'
  }
  const permission = await notifier.requestPermission()
  if (permission !== 'granted') {
    await settings.update({ notifications: { enabled: false } })
    return permission
  }
  await settings.update({ notifications: { enabled: true } })
  return 'enabled'
}
