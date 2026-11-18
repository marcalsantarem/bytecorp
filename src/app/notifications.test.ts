import { describe, expect, it, vi } from 'vitest'
import type { GameEngine } from '../core/engine'
import { EventBus, type GameEvents } from '../core/events'
import { MemoryStorage } from '../core/save/storage'
import { translate } from '../i18n'
import { createBrowserNotifier, type LocalNotifier, type NotificationPermissionState } from '../platform/localNotifications'
import { NOTIFICATION_LIMITS, setNotificationsEnabled, startNotifications } from './notifications'
import { defaultSettings, SettingsStore } from './settings'

const NAME_A = 'equipment.home_router.name' as const
const NAME_B = 'equipment.home_server.name' as const

function fakeEngine() {
  const events = new EventBus<GameEvents>()
  const engine = {
    events,
    achievementDefs: [
      { id: 'a', nameKey: NAME_A },
      { id: 'b', nameKey: NAME_B },
    ],
  } as unknown as GameEngine
  const reward = {} as GameEvents['achievementUnlocked']['reward']
  return {
    engine,
    unlock: (id: string) => events.emit('achievementUnlocked', { id, reward }),
    expire: (multiplier = 2) => events.emit('acceleratorExpired', { item: { id: 'x', multiplier, remainingMs: 0 } }),
    emit: events.emit.bind(events),
  }
}

function fakeNotifier(initial: NotificationPermissionState = 'granted') {
  let perm = initial
  const shown: { title: string; body: string; tag: string }[] = []
  const notifier: LocalNotifier = {
    permission: () => perm,
    requestPermission: vi.fn(async () => {
      if (perm === 'default') perm = 'granted'
      return perm
    }),
    show: async (title, { body, tag }) => {
      shown.push({ title, body, tag })
      return true
    },
  }
  return { notifier, shown, setPermission: (p: NotificationPermissionState) => (perm = p) }
}

// Relógio e temporizadores manuais.
function fakeTime() {
  let t = 1_000_000
  let seq = 0
  const timers = new Map<number, { at: number; cb: () => void }>()
  return {
    now: () => t,
    setTimer: (cb: () => void, ms: number) => {
      const id = ++seq
      timers.set(id, { at: t + ms, cb })
      return id
    },
    clearTimer: (h: unknown) => void timers.delete(h as number),
    advance(ms: number) {
      const end = t + ms
      for (;;) {
        const next = [...timers.entries()].filter(([, v]) => v.at <= end).sort((a, b) => a[1].at - b[1].at)[0]
        if (!next) break
        timers.delete(next[0])
        t = next[1].at
        next[1].cb()
      }
      t = end
    },
  }
}

function setup(opts: { enabled?: boolean; hidden?: boolean; permission?: NotificationPermissionState } = {}) {
  const settings = new SettingsStore(new MemoryStorage(), {
    ...defaultSettings(),
    locale: 'pt-BR',
    notifications: { enabled: opts.enabled ?? true, categories: { achievement: true, acceleratorExpired: true } },
  })
  const game = fakeEngine()
  const n = fakeNotifier(opts.permission)
  const time = fakeTime()
  let hidden = opts.hidden ?? true
  const visibility = new Set<() => void>()
  const controller = startNotifications(game.engine, settings, {
    notifier: n.notifier,
    isHidden: () => hidden,
    onVisibilityChange: (cb) => {
      visibility.add(cb)
      return () => visibility.delete(cb)
    },
    now: time.now,
    setTimer: time.setTimer,
    clearTimer: time.clearTimer,
  })
  const setHidden = (h: boolean) => {
    hidden = h
    for (const cb of visibility) cb()
  }
  return { settings, game, ...n, time, setHidden, controller }
}

const { groupMs, globalMinMs, categoryMinMs } = NOTIFICATION_LIMITS

describe('notificações locais', () => {
  it('notifica conquista com a aba oculta, depois da janela de agrupamento', () => {
    const s = setup()
    s.game.unlock('a')
    expect(s.shown).toHaveLength(0)
    s.time.advance(groupMs)
    expect(s.shown).toEqual([
      { title: 'Conquista desbloqueada', body: translate('pt-BR', NAME_A), tag: 'bytecorp-achievement' },
    ])
  })

  it('agrupa conquistas seguidas em uma notificação', () => {
    const s = setup()
    s.game.unlock('a')
    s.game.unlock('b')
    s.time.advance(groupMs)
    expect(s.shown).toHaveLength(1)
    expect(s.shown[0]?.title).toBe('2 conquistas desbloqueadas')
    expect(s.shown[0]?.body).toBe(`${translate('pt-BR', NAME_A)}, ${translate('pt-BR', NAME_B)}`)
  })

  it('resume acima de três nomes', () => {
    const s = setup()
    for (const id of ['a', 'b', 'a', 'b', 'a']) s.game.unlock(id)
    s.time.advance(groupMs)
    expect(s.shown[0]?.body).toMatch(/ e mais 2$/)
  })

  it('aba visível não notifica', () => {
    const s = setup({ hidden: false })
    s.game.unlock('a')
    s.game.expire()
    s.time.advance(categoryMinMs * 2)
    expect(s.shown).toHaveLength(0)
  })

  it('voltar à aba descarta o pendente', () => {
    const s = setup()
    s.game.unlock('a')
    s.setHidden(false)
    s.time.advance(groupMs)
    expect(s.shown).toHaveLength(0)
  })

  it('desligadas, sem permissão ou com categoria desligada não notificam', async () => {
    const off = setup({ enabled: false })
    off.game.unlock('a')
    off.time.advance(groupMs)
    expect(off.shown).toHaveLength(0)

    const denied = setup({ permission: 'denied' })
    denied.game.unlock('a')
    denied.time.advance(groupMs)
    expect(denied.shown).toHaveLength(0)

    const cat = setup()
    await cat.settings.update({ notifications: { categories: { achievement: false } } })
    cat.game.unlock('a')
    cat.game.expire(3)
    cat.time.advance(groupMs)
    expect(cat.shown.map((x) => x.tag)).toEqual(['bytecorp-acceleratorExpired'])
    expect(cat.shown[0]?.body).toContain('3x')
  })

  it('desligar durante a espera cancela o pendente', async () => {
    const s = setup()
    s.game.unlock('a')
    await s.settings.update({ notifications: { enabled: false } })
    s.time.advance(groupMs)
    expect(s.shown).toHaveLength(0)
  })

  it('permissão revogada depois do evento não notifica', () => {
    const s = setup()
    s.game.unlock('a')
    s.setPermission('denied')
    s.time.advance(groupMs)
    expect(s.shown).toHaveLength(0)
  })

  it('respeita o limite por categoria e junta o que chegou no intervalo', () => {
    const s = setup()
    s.game.unlock('a')
    s.time.advance(groupMs)
    s.game.unlock('b')
    s.game.unlock('a')
    s.time.advance(categoryMinMs - 1)
    expect(s.shown).toHaveLength(1)
    s.time.advance(1)
    expect(s.shown).toHaveLength(2)
    expect(s.shown[1]?.title).toBe('2 conquistas desbloqueadas')
  })

  it('respeita o limite global entre categorias', () => {
    const s = setup()
    s.game.unlock('a')
    s.time.advance(groupMs)
    const first = s.time.now()
    s.game.expire()
    s.time.advance(globalMinMs - 1)
    expect(s.shown).toHaveLength(1)
    s.time.advance(1)
    expect(s.shown).toHaveLength(2)
    expect(s.time.now() - first).toBe(globalMinMs)
  })

  it('usa o idioma atual das configurações', async () => {
    const s = setup()
    await s.settings.update({ locale: 'en' })
    s.game.expire()
    s.time.advance(groupMs)
    expect(s.shown[0]?.title).toBe('Accelerator ended')
  })

  it('stop remove os ouvintes', () => {
    const s = setup()
    s.controller.stop()
    s.game.unlock('a')
    s.time.advance(groupMs)
    expect(s.shown).toHaveLength(0)
  })
})

describe('setNotificationsEnabled', () => {
  it('pede permissão e liga só se concedida', async () => {
    const s = setup({ enabled: false, permission: 'default' })
    expect(await setNotificationsEnabled(s.settings, s.notifier, true)).toBe('enabled')
    expect(s.notifier.requestPermission).toHaveBeenCalledOnce()
    expect(s.settings.current.notifications.enabled).toBe(true)
  })

  it('negada ou indisponível mantém desligado', async () => {
    for (const p of ['denied', 'unsupported'] as const) {
      const s = setup({ enabled: false, permission: p })
      expect(await setNotificationsEnabled(s.settings, s.notifier, true)).toBe(p)
      expect(s.settings.current.notifications.enabled).toBe(false)
    }
  })

  it('desligar não pede permissão', async () => {
    const s = setup({ permission: 'default' })
    expect(await setNotificationsEnabled(s.settings, s.notifier, false)).toBe('disabled')
    expect(s.notifier.requestPermission).not.toHaveBeenCalled()
    expect(s.settings.current.notifications.enabled).toBe(false)
  })
})

describe('createBrowserNotifier', () => {
  function fakeNotificationApi(permission: NotificationPermission) {
    const created: { title: string; options?: NotificationOptions; onclick: (() => void) | null; close: () => void }[] = []
    class FakeNotification {
      static permission = permission
      static requestPermission = vi.fn(async () => FakeNotification.permission)
      onclick: (() => void) | null = null
      close = vi.fn()
      constructor(title: string, options?: NotificationOptions) {
        created.push(this as unknown as (typeof created)[number])
        Object.assign(this, { title, options })
      }
    }
    return { api: FakeNotification as unknown as typeof Notification, created, cls: FakeNotification }
  }

  it('sem API informa indisponível e não exibe', async () => {
    const n = createBrowserNotifier({})
    expect(n.permission()).toBe('unsupported')
    expect(await n.requestPermission()).toBe('unsupported')
    expect(await n.show('t', { body: 'b', tag: 'x' })).toBe(false)
  })

  it('não pede de novo quando já decidida', async () => {
    const f = fakeNotificationApi('denied')
    const n = createBrowserNotifier({ Notification: f.api })
    expect(await n.requestPermission()).toBe('denied')
    expect(f.cls.requestPermission).not.toHaveBeenCalled()
  })

  it('prefere o service worker', async () => {
    const f = fakeNotificationApi('granted')
    const showNotification = vi.fn(async () => {})
    const n = createBrowserNotifier({
      Notification: f.api,
      serviceWorker: { getRegistration: async () => ({ showNotification }) as unknown as ServiceWorkerRegistration },
    })
    expect(await n.show('t', { body: 'b', tag: 'x' })).toBe(true)
    expect(showNotification).toHaveBeenCalledWith('t', expect.objectContaining({ body: 'b', tag: 'x' }))
    expect(f.created).toHaveLength(0)
  })

  it('sem service worker usa o construtor e o clique foca o jogo', async () => {
    const f = fakeNotificationApi('granted')
    const focus = vi.fn()
    const n = createBrowserNotifier({ Notification: f.api, serviceWorker: { getRegistration: async () => undefined }, focus })
    expect(await n.show('t', { body: 'b', tag: 'x' })).toBe(true)
    const created = f.created[0]
    created?.onclick?.()
    expect(focus).toHaveBeenCalled()
    expect(created?.close).toHaveBeenCalled()
  })

  it('sem permissão não exibe', async () => {
    const f = fakeNotificationApi('default')
    const n = createBrowserNotifier({ Notification: f.api })
    expect(await n.show('t', { body: 'b', tag: 'x' })).toBe(false)
    expect(f.created).toHaveLength(0)
  })
})
