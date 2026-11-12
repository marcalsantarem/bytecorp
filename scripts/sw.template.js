/* Service worker do Byte Corp Idle. Gerado a partir deste modelo pelo plugin em vite.config.ts.
   Os marcadores de nome do cache e de lista de pré-cache são substituídos no build. */
const CACHE = __CACHE_NAME__
const PRECACHE = __PRECACHE__
const MATCH = { ignoreVary: true }

// Sem skipWaiting: a versão nova só assume quando o jogador fecha e reabre o jogo.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('bytecorp-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, fallbackKey) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(fallbackKey ?? request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(fallbackKey ?? request, MATCH)
    if (cached) return cached
    throw err
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request, MATCH)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else if (url.pathname !== '/sw.js') {
    event.respondWith(networkFirst(request))
  }
})
