// Fundo animado da tela inicial em Canvas 2D (Bíblia 17, T-086): grade neon em
// perspectiva, nós de rede ligados por linhas de dados e pacotes percorrendo as
// ligações, com um halo atrás do logotipo. Só desenha: não lê nem altera o jogo.
// A animação é função do tempo decorrido; a cena é gerada de forma determinística.

const BG = '#050811'
const CYAN_RGB = '0,255,204'
const MAGENTA_RGB = '255,0,127'

export type StartQuality = 'low' | 'medium' | 'high'
export type QualitySetting = StartQuality | 'auto'

export interface QualityProfile {
  /** Nós numa tela de referência de 1280x720 (escala pela área). */
  nodes: number
  /** Pacotes de dados em trânsito. */
  packets: number
  /** Linhas horizontais da grade em perspectiva. */
  gridRows: number
  /** Linhas verticais da grade. */
  gridCols: number
  /** Teto da densidade de pixels. */
  maxDpr: number
  /** Intervalo mínimo entre quadros (ms); 0 = todo quadro. */
  frameIntervalMs: number
  /** Brilho por shadowBlur (caro em celular). */
  glow: boolean
}

export const QUALITY_PROFILES: Record<StartQuality, QualityProfile> = {
  low: { nodes: 14, packets: 8, gridRows: 8, gridCols: 10, maxDpr: 1, frameIntervalMs: 1000 / 30, glow: false },
  medium: { nodes: 28, packets: 18, gridRows: 12, gridCols: 16, maxDpr: 1.5, frameIntervalMs: 0, glow: false },
  high: { nodes: 44, packets: 34, gridRows: 16, gridCols: 22, maxDpr: 2, frameIntervalMs: 0, glow: true },
}

/** Limites absolutos, qualquer que seja a tela. */
export const MAX_NODES = 60
export const MIN_NODES = 6
export const MAX_LINKS_PER_NODE = 3

const REF_AREA = 1280 * 720

export interface QualityHints {
  /** Núcleos lógicos (navigator.hardwareConcurrency). */
  cores?: number
  /** Largura da tela em px CSS. */
  width?: number
}

/** 'auto' escolhe pelo aparelho: baixa em aparelhos fracos, média no resto. */
export function resolveQuality(setting: QualitySetting, hints: QualityHints = {}): StartQuality {
  if (setting !== 'auto') return setting
  const cores = hints.cores ?? 8
  if (cores <= 4) return 'low'
  return 'medium'
}

export interface SceneNode {
  /** Posição normalizada 0..1. */
  x: number
  y: number
  /** Fase do pulso (0..1). */
  phase: number
  /** Raio em px CSS. */
  size: number
  magenta: boolean
}

export interface SceneLink {
  a: number
  b: number
}

export interface ScenePacket {
  link: number
  /** Voltas por segundo ao longo da ligação. */
  speed: number
  offset: number
  reverse: boolean
  magenta: boolean
}

export interface StartScene {
  width: number
  height: number
  quality: StartQuality
  nodes: SceneNode[]
  links: SceneLink[]
  packets: ScenePacket[]
}

// PRNG determinístico (mulberry32).
export function createRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Quantidade de nós para a tela, escalada pela área e limitada. */
export function nodeCount(quality: StartQuality, width: number, height: number): number {
  const area = Math.max(0, width) * Math.max(0, height)
  const scale = Math.min(1.3, Math.max(0.45, area / REF_AREA))
  const n = Math.round(QUALITY_PROFILES[quality].nodes * scale)
  return Math.min(MAX_NODES, Math.max(MIN_NODES, n))
}

// Faixa central (logotipo e menu) onde os nós ficam mais raros.
function inLogoZone(x: number, y: number): boolean {
  return Math.abs(x - 0.5) < 0.22 && y > 0.18 && y < 0.62
}

export function generateScene(width: number, height: number, quality: StartQuality, seed = 0x0b17e): StartScene {
  const rng = createRng(seed)
  const profile = QUALITY_PROFILES[quality]
  const count = nodeCount(quality, width, height)
  const aspect = width > 0 && height > 0 ? width / height : 1

  // Nós na parte de cima (acima do horizonte da grade), evitando o centro.
  const nodes: SceneNode[] = []
  let guard = 0
  while (nodes.length < count && guard++ < count * 20) {
    const x = 0.03 + rng() * 0.94
    const y = 0.04 + rng() * 0.6
    if (inLogoZone(x, y) && rng() < 0.85) continue
    nodes.push({ x, y, phase: rng(), size: 1.5 + rng() * 2, magenta: rng() < 0.18 })
  }

  // Liga cada nó aos vizinhos mais próximos (distância corrigida pelo aspecto).
  const maxDist = 0.32
  const degree = new Array<number>(nodes.length).fill(0)
  const links: SceneLink[] = []
  const seen = new Set<string>()
  for (let i = 0; i < nodes.length; i++) {
    const ni = nodes[i]!
    const near = nodes
      .map((nj, j) => ({ j, d: Math.hypot((nj.x - ni.x) * aspect, nj.y - ni.y) }))
      .filter((e) => e.j !== i && e.d < maxDist)
      .sort((p, q) => p.d - q.d)
    for (const { j } of near) {
      if (degree[i]! >= MAX_LINKS_PER_NODE) break
      if (degree[j]! >= MAX_LINKS_PER_NODE) continue
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ a: Math.min(i, j), b: Math.max(i, j) })
      degree[i]!++
      degree[j]!++
    }
  }

  const packets: ScenePacket[] = []
  if (links.length > 0) {
    const n = Math.min(profile.packets, links.length * 2)
    for (let k = 0; k < n; k++) {
      packets.push({
        link: Math.floor(rng() * links.length),
        speed: 0.15 + rng() * 0.35,
        offset: rng(),
        reverse: rng() < 0.5,
        magenta: rng() < 0.25,
      })
    }
  }

  return { width, height, quality, nodes, links, packets }
}

/** Posição normalizada de um pacote no instante `t` (ms). */
export function packetPosition(scene: StartScene, packet: ScenePacket, t: number): { x: number; y: number } {
  const link = scene.links[packet.link]!
  const a = scene.nodes[link.a]!
  const b = scene.nodes[link.b]!
  let u = (((t / 1000) * packet.speed + packet.offset) % 1 + 1) % 1
  if (packet.reverse) u = 1 - u
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
}

/** Fração da altura onde fica o horizonte da grade. */
export const HORIZON = 0.64

/** Desenha um quadro no instante `t` (ms). `reduced` congela o tempo em 0. */
export function drawStartFrame(ctx: CanvasRenderingContext2D, scene: StartScene, t: number, reduced: boolean): void {
  const { width: w, height: h } = scene
  const profile = QUALITY_PROFILES[scene.quality]
  if (reduced) t = 0
  const sec = t / 1000

  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const horizon = h * HORIZON

  // Brilho do horizonte.
  const sky = ctx.createLinearGradient(0, horizon - h * 0.25, 0, horizon + 2)
  sky.addColorStop(0, `rgba(${MAGENTA_RGB},0)`)
  sky.addColorStop(1, `rgba(${MAGENTA_RGB},0.12)`)
  ctx.fillStyle = sky
  ctx.fillRect(0, horizon - h * 0.25, w, h * 0.25 + 2)

  // Grade neon em perspectiva, rolando em direção ao jogador.
  ctx.lineWidth = 1
  ctx.strokeStyle = `rgba(${CYAN_RGB},0.22)`
  ctx.beginPath()
  const spread = w * 1.6
  for (let c = 0; c <= profile.gridCols; c++) {
    const fx = c / profile.gridCols - 0.5
    ctx.moveTo(cx + fx * w * 0.08, horizon)
    ctx.lineTo(cx + fx * spread, h)
  }
  ctx.stroke()
  const scroll = (sec * 0.12) % 1
  for (let r = 0; r < profile.gridRows; r++) {
    const d = (r + scroll) / profile.gridRows
    const y = horizon + (h - horizon) * d * d
    ctx.strokeStyle = `rgba(${CYAN_RGB},${(0.05 + d * 0.3).toFixed(3)})`
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  ctx.strokeStyle = `rgba(${CYAN_RGB},0.5)`
  ctx.beginPath()
  ctx.moveTo(0, horizon)
  ctx.lineTo(w, horizon)
  ctx.stroke()

  // Ligações entre nós.
  ctx.strokeStyle = `rgba(${CYAN_RGB},0.14)`
  ctx.beginPath()
  for (const link of scene.links) {
    const a = scene.nodes[link.a]!
    const b = scene.nodes[link.b]!
    ctx.moveTo(a.x * w, a.y * h)
    ctx.lineTo(b.x * w, b.y * h)
  }
  ctx.stroke()

  // Halo atrás do logotipo (o texto é do DOM, no AG04).
  const logoY = h * 0.36
  const haloR = Math.max(w, h) * 0.38
  const breathe = 0.85 + 0.15 * Math.sin(sec * 1.3)
  const halo = ctx.createRadialGradient(cx, logoY, 0, cx, logoY, haloR)
  halo.addColorStop(0, `rgba(${CYAN_RGB},${(0.16 * breathe).toFixed(3)})`)
  halo.addColorStop(0.45, `rgba(${MAGENTA_RGB},${(0.05 * breathe).toFixed(3)})`)
  halo.addColorStop(1, `rgba(${CYAN_RGB},0)`)
  ctx.fillStyle = halo
  ctx.fillRect(cx - haloR, logoY - haloR, haloR * 2, haloR * 2)

  // Nós pulsando.
  if (profile.glow) ctx.shadowBlur = 8
  for (const node of scene.nodes) {
    const pulse = 0.5 + 0.5 * Math.sin((sec * 0.8 + node.phase) * Math.PI * 2)
    const rgb = node.magenta ? MAGENTA_RGB : CYAN_RGB
    ctx.fillStyle = `rgba(${rgb},${(0.35 + pulse * 0.5).toFixed(3)})`
    if (profile.glow) ctx.shadowColor = `rgb(${rgb})`
    ctx.beginPath()
    ctx.arc(node.x * w, node.y * h, node.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Pacotes de dados nas ligações.
  for (const packet of scene.packets) {
    const p = packetPosition(scene, packet, t)
    const rgb = packet.magenta ? MAGENTA_RGB : CYAN_RGB
    ctx.fillStyle = `rgba(${rgb},0.9)`
    if (profile.glow) ctx.shadowColor = `rgb(${rgb})`
    ctx.fillRect(p.x * w - 1.5, p.y * h - 1.5, 3, 3)
  }
  ctx.shadowBlur = 0

  // Vinheta para o conteúdo ganhar contraste nas bordas.
  const vignette = ctx.createRadialGradient(cx, h / 2, Math.min(w, h) * 0.3, cx, h / 2, Math.max(w, h) * 0.75)
  vignette.addColorStop(0, 'rgba(5,8,17,0)')
  vignette.addColorStop(1, 'rgba(5,8,17,0.7)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

export interface StartBackgroundOptions {
  quality: QualitySetting
  /** Sobrepõe a consulta prefers-reduced-motion (testes). */
  reducedMotion?: boolean
}

export interface StartBackgroundControl {
  setQuality: (quality: QualitySetting) => void
  stop: () => void
}

/**
 * Monta o fundo no canvas. Anima por requestAnimationFrame, para com a aba oculta
 * e desenha um quadro estático com prefers-reduced-motion. `stop` libera tudo.
 */
export function mountStartBackground(canvas: HTMLCanvasElement, options: StartBackgroundOptions): StartBackgroundControl {
  const ctx = canvas.getContext('2d')
  const motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
  let reduced = options.reducedMotion ?? motionQuery?.matches ?? false
  let setting = options.quality
  let quality = resolveQuality(setting, { cores: globalThis.navigator?.hardwareConcurrency })
  let scene: StartScene | null = null
  let frame: number | null = null
  let lastDraw = -Infinity
  let stopped = false
  const start = performance.now()

  function resize(): StartScene {
    const dpr = Math.min(QUALITY_PROFILES[quality].maxDpr, Math.max(1, globalThis.devicePixelRatio || 1))
    const cw = canvas.clientWidth || canvas.width || 1
    const ch = canvas.clientHeight || canvas.height || 1
    const pw = Math.max(1, Math.round(cw * dpr))
    const ph = Math.max(1, Math.round(ch * dpr))
    if (canvas.width !== pw) canvas.width = pw
    if (canvas.height !== ph) canvas.height = ph
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!scene || scene.width !== cw || scene.height !== ch || scene.quality !== quality) {
      scene = generateScene(cw, ch, quality)
    }
    return scene
  }

  function render(now: number) {
    if (!ctx) return
    drawStartFrame(ctx, resize(), now - start, reduced)
    lastDraw = now
  }

  function loop(now: number) {
    frame = null
    if (stopped) return
    if (now - lastDraw >= QUALITY_PROFILES[quality].frameIntervalMs - 1) render(now)
    frame = requestAnimationFrame(loop)
  }

  function running(): boolean {
    return !stopped && !reduced && !(typeof document !== 'undefined' && document.hidden)
  }

  function sync() {
    if (running()) {
      if (frame === null) frame = requestAnimationFrame(loop)
    } else {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      if (!stopped && reduced) render(performance.now())
    }
  }

  function onMotionChange(event: MediaQueryListEvent) {
    if (options.reducedMotion !== undefined) return
    reduced = event.matches
    sync()
  }

  const onVisibility = () => sync()
  const observer =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          if (!stopped) render(performance.now())
        })
      : null

  render(performance.now())
  observer?.observe(canvas)
  motionQuery?.addEventListener?.('change', onMotionChange)
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
  sync()

  return {
    setQuality(next) {
      setting = next
      quality = resolveQuality(setting, { cores: globalThis.navigator?.hardwareConcurrency })
      if (!stopped) render(performance.now())
    },
    stop() {
      stopped = true
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      observer?.disconnect()
      motionQuery?.removeEventListener?.('change', onMotionChange)
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
