// Registra o service worker só em build de produção. Falhas apenas vão para o console.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err: unknown) => {
      console.warn('Falha ao registrar o service worker', err)
    })
  })
}
