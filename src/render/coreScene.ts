import type { EventBus, GameEvents } from '../core/events'

// Cena provisória do núcleo em Canvas 2D (Bíblia 5.2), até a cena Three.js do M6.
// Só reage a eventos: não lê nem altera o estado do jogo (Bíblia 19).

const CYAN = '#00ffcc'
const MAGENTA = '#ff007f'
const MAX_PARTICLES = 160
const MAX_DT_MS = 100

interface Ring {
  radius: number // fração do raio do núcleo
  width: number
  segments: number
  gap: number // fração de cada segmento que fica vazia
  speed: number // rad/s; sinal define o sentido
}

const RINGS: Ring[] = [
  { radius: 0.42, width: 3, segments: 3, gap: 0.25, speed: 0.9 },
  { radius: 0.62, width: 2, segments: 8, gap: 0.4, speed: -0.5 },
  { radius: 0.8, width: 4, segments: 2, gap: 0.55, speed: 0.3 },
  { radius: 0.96, width: 1.5, segments: 24, gap: 0.5, speed: -0.15 },
]

interface Wave {
  age: number
  life: number
  critical: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
}

export function mountCoreScene(
  canvas: HTMLCanvasElement,
  events: EventBus<GameEvents>,
): () => void {
  const ctx = canvas.getContext('2d')
  const motionQuery =
    typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
  let reducedMotion = motionQuery?.matches ?? false

  let cssWidth = 0
  let cssHeight = 0
  let angle = 0
  let pulse = 0 // 0..1, decai após cada clique
  let flash = 0 // 0..1, tom magenta do crítico
  let lastTime: number | null = null
  let frame: number | null = null
  const waves: Wave[] = []
  const particles: Particle[] = []

  function resize() {
    const dpr = Math.max(1, globalThis.devicePixelRatio || 1)
    cssWidth = canvas.clientWidth || canvas.width
    cssHeight = canvas.clientHeight || canvas.height
    const w = Math.max(1, Math.round(cssWidth * dpr))
    const h = Math.max(1, Math.round(cssHeight * dpr))
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function onClick({ critical }: GameEvents['click']) {
    pulse = 1
    if (critical) flash = 1
    if (reducedMotion) return
    waves.push({ age: 0, life: critical ? 900 : 500, critical })
    if (!critical) return
    const count = Math.min(40, MAX_PARTICLES - particles.length)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = 0.15 + Math.random() * 0.35 // fração do raio por 100 ms
      particles.push({ x: 0, y: 0, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, age: 0, life: 600 + Math.random() * 500 })
    }
  }

  function update(dt: number) {
    if (!reducedMotion) angle += dt / 1000
    pulse = Math.max(0, pulse - dt / 300)
    flash = Math.max(0, flash - dt / 600)
    for (let i = waves.length - 1; i >= 0; i--) {
      const wave = waves[i]!
      wave.age += dt
      if (wave.age >= wave.life) waves.splice(i, 1)
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!
      p.age += dt
      p.x += (p.vx * dt) / 100
      p.y += (p.vy * dt) / 100
      if (p.age >= p.life) particles.splice(i, 1)
    }
  }

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, cssWidth, cssHeight)
    const cx = cssWidth / 2
    const cy = cssHeight / 2
    const r = (Math.min(cssWidth, cssHeight) / 2) * 0.9 * (1 + pulse * 0.04)
    if (r <= 0) return

    ctx.save()
    ctx.translate(cx, cy)
    ctx.lineCap = 'round'
    const accent = flash > 0.5 ? MAGENTA : CYAN

    // Anéis concêntricos girando, com brilho neon.
    ctx.shadowBlur = 12 + pulse * 18
    for (const ring of RINGS) {
      ctx.strokeStyle = ring === RINGS[0] ? accent : CYAN
      ctx.shadowColor = ctx.strokeStyle
      ctx.globalAlpha = 0.55 + pulse * 0.45
      ctx.lineWidth = ring.width
      const step = (Math.PI * 2) / ring.segments
      const offset = angle * ring.speed
      for (let s = 0; s < ring.segments; s++) {
        const start = offset + s * step
        ctx.beginPath()
        ctx.arc(0, 0, r * ring.radius, start, start + step * (1 - ring.gap))
        ctx.stroke()
      }
    }

    // Miolo do núcleo.
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3)
    core.addColorStop(0, '#ffffff')
    core.addColorStop(0.35, flash > 0 ? MAGENTA : CYAN)
    core.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.globalAlpha = 0.7 + pulse * 0.3
    ctx.shadowBlur = 0
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(0, 0, r * (0.3 + pulse * 0.05), 0, Math.PI * 2)
    ctx.fill()

    // Ondas de energia a cada clique.
    for (const wave of waves) {
      const t = wave.age / wave.life
      ctx.globalAlpha = (1 - t) * (wave.critical ? 0.9 : 0.5)
      ctx.strokeStyle = wave.critical ? MAGENTA : CYAN
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = 16
      ctx.lineWidth = wave.critical ? 4 * (1 - t) + 1 : 2
      ctx.beginPath()
      ctx.arc(0, 0, r * (0.3 + t * (wave.critical ? 0.9 : 0.4)), 0, Math.PI * 2)
      ctx.stroke()
    }

    // Partículas do crítico.
    ctx.fillStyle = MAGENTA
    ctx.shadowColor = MAGENTA
    ctx.shadowBlur = 8
    for (const p of particles) {
      ctx.globalAlpha = 1 - p.age / p.life
      ctx.beginPath()
      ctx.arc(p.x * r, p.y * r, 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  function loop(time: number) {
    const dt = lastTime === null ? 0 : Math.min(MAX_DT_MS, Math.max(0, time - lastTime))
    lastTime = time
    update(dt)
    draw()
    frame = requestAnimationFrame(loop)
  }

  function onMotionChange(event: MediaQueryListEvent) {
    reducedMotion = event.matches
    if (reducedMotion) {
      waves.length = 0
      particles.length = 0
    }
  }

  resize()
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
  observer?.observe(canvas)
  motionQuery?.addEventListener('change', onMotionChange)
  const unsubscribe = events.on('click', onClick)
  frame = requestAnimationFrame(loop)

  return () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    observer?.disconnect()
    motionQuery?.removeEventListener('change', onMotionChange)
    unsubscribe()
  }
}
