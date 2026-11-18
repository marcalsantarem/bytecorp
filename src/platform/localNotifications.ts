// Adaptador das notificações locais do navegador (GDD 22), sem push nem backend.
// Prefere ServiceWorkerRegistration.showNotification (obrigatório no Android e no PWA);
// sem service worker, usa o construtor Notification. O clique foca o jogo.

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export interface LocalNotificationOptions {
  body: string
  // Notificações com a mesma tag substituem a anterior no sistema (agrupamento).
  tag: string
}

export interface LocalNotifier {
  permission(): NotificationPermissionState
  // Só deve ser chamado a partir de uma ação do jogador.
  requestPermission(): Promise<NotificationPermissionState>
  // Devolve false se não exibiu (sem permissão, indisponível ou falha).
  show(title: string, options: LocalNotificationOptions): Promise<boolean>
}

const ICON = '/icons/icon-192.png'

interface BrowserEnv {
  Notification?: typeof Notification
  serviceWorker?: Pick<ServiceWorkerContainer, 'getRegistration'>
  focus?: () => void
}

function defaultEnv(): BrowserEnv {
  const g = globalThis as { Notification?: typeof Notification; navigator?: Navigator; focus?: () => void }
  return {
    Notification: g.Notification,
    serviceWorker: g.navigator && 'serviceWorker' in g.navigator ? g.navigator.serviceWorker : undefined,
    focus: typeof g.focus === 'function' ? () => g.focus?.() : undefined,
  }
}

export function createBrowserNotifier(env: BrowserEnv = defaultEnv()): LocalNotifier {
  const api = env.Notification
  const permission = (): NotificationPermissionState => (api ? api.permission : 'unsupported')

  return {
    permission,
    async requestPermission() {
      if (!api) return 'unsupported'
      if (api.permission !== 'default') return api.permission
      try {
        return await api.requestPermission()
      } catch {
        return permission()
      }
    },
    async show(title, { body, tag }) {
      if (!api || api.permission !== 'granted') return false
      const options: NotificationOptions = { body, tag, icon: ICON, badge: ICON }
      try {
        const registration = await env.serviceWorker?.getRegistration()
        if (registration) {
          await registration.showNotification(title, options)
          return true
        }
      } catch {
        // Sem service worker utilizável: tenta o construtor abaixo.
      }
      try {
        const notification = new api(title, options)
        notification.onclick = () => {
          env.focus?.()
          notification.close()
        }
        return true
      } catch {
        // Android Chrome recusa o construtor sem service worker.
        return false
      }
    },
  }
}
