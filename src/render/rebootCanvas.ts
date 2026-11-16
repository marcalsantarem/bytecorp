// Efeito de Reboot em Canvas 2D (Bíblia 9 e 19). Só desenha: não lê nem altera o estado do jogo.
// A animação é função do tempo decorrido (progresso 0..1), nunca de contagem de quadros.

const CYAN = '#00ffcc'
const MAGENTA = '#ff007f'
const BG = '#050811'

export const REBOOT_DURATION_MS = 2500
export const REBOOT_REDUCED_DURATION_MS = 600

// Pseudo-aleatório determinístico: o mesmo progresso gera o mesmo quadro.
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Desenha um quadro. `p` é o progresso 0..1; `reduced` desenha a versão estática. */
export function drawRebootFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  label: string,
  reduced: boolean,
): void {
  p = clamp01(p)
  // Escurece e depois clareia (some ao final, revelando o jogo já reiniciado).
  const cover = reduced ? 1 - p : p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1
  ctx.clearRect(0, 0, w, h)
  ctx.globalAlpha = clamp01(cover) * 0.96
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = clamp01(cover)

  const cx = w / 2
  const cy = h / 2
  const fontSize = Math.max(16, Math.min(w, h) * 0.07)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${fontSize}px "Fira Code", monospace`

  if (reduced) {
    ctx.fillStyle = CYAN
    ctx.fillText(label, cx, cy)
    ctx.globalAlpha = 1
    return
  }

  // Linhas de varredura (scanlines).
  ctx.fillStyle = 'rgba(0,255,204,0.05)'
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)

  // Fluxo de dados caindo, em colunas.
  ctx.font = `${Math.max(10, fontSize * 0.35)}px "Fira Code", monospace`
  ctx.textAlign = 'left'
  const colW = Math.max(14, w / 48)
  for (let c = 0; c * colW < w; c++) {
    const speed = 0.6 + rand(c) * 1.4
    const head = ((p * speed + rand(c + 99)) % 1) * (h + 200) - 100
    for (let i = 0; i < 8; i++) {
      const y = head - i * 16
      if (y < 0 || y > h) continue
      ctx.globalAlpha = clamp01(cover) * (1 - i / 8) * 0.7
      ctx.fillStyle = i === 0 ? '#ffffff' : c % 7 === 0 ? MAGENTA : CYAN
      const ch = Math.floor(rand(c * 31 + i + Math.floor(p * 20)) * 16).toString(16)
      ctx.fillText(ch, c * colW, y)
    }
  }
  ctx.globalAlpha = clamp01(cover)

  // Barra de varredura horizontal.
  const scanY = (p * 1.3 % 1) * h
  const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
  grad.addColorStop(0, 'rgba(0,255,204,0)')
  grad.addColorStop(0.5, 'rgba(0,255,204,0.45)')
  grad.addColorStop(1, 'rgba(0,255,204,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, scanY - 40, w, 80)

  // Texto central com glitch magenta/ciano, mais forte no meio do efeito.
  ctx.textAlign = 'center'
  ctx.font = `700 ${fontSize}px "Fira Code", monospace`
  const glitch = Math.sin(p * Math.PI) * fontSize * 0.25
  const jitter = (rand(Math.floor(p * 30)) - 0.5) * 2 * glitch
  ctx.fillStyle = MAGENTA
  ctx.fillText(label, cx - glitch + jitter, cy)
  ctx.fillStyle = CYAN
  ctx.fillText(label, cx + glitch - jitter, cy)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(label, cx, cy)

  // Barra de progresso do reinício.
  const barW = Math.min(w * 0.5, 420)
  const barY = cy + fontSize * 1.4
  ctx.strokeStyle = CYAN
  ctx.lineWidth = 1
  ctx.strokeRect(cx - barW / 2, barY, barW, 8)
  ctx.fillStyle = CYAN
  ctx.fillRect(cx - barW / 2, barY, barW * p, 8)

  // Fatias deslocadas (glitch de tela) nos picos.
  if (rand(Math.floor(p * 24) + 7) > 0.7) {
    const sy = rand(Math.floor(p * 24)) * h
    ctx.fillStyle = 'rgba(255,0,127,0.18)'
    ctx.fillRect(0, sy, w, 6 + rand(sy) * 20)
  }
  ctx.globalAlpha = 1
}

export interface RebootEffectOptions {
  label: string
  reducedMotion: boolean
  onDone: () => void
}

/**
 * Executa o efeito no canvas. Termina por temporizador (funciona com a aba oculta,
 * onde requestAnimationFrame não dispara) e retorna `stop`, que cancela sem chamar onDone.
 * `finish` encerra antecipadamente chamando onDone (pular).
 */
export function mountRebootEffect(
  canvas: HTMLCanvasElement,
  { label, reducedMotion, onDone }: RebootEffectOptions,
): { finish: () => void; stop: () => void } {
  const ctx = canvas.getContext('2d')
  const duration = reducedMotion ? REBOOT_REDUCED_DURATION_MS : REBOOT_DURATION_MS
  const start = performance.now()
  let frame: number | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let done = false

  function resize() {
    const dpr = Math.max(1, globalThis.devicePixelRatio || 1)
    const cw = canvas.clientWidth || canvas.width
    const ch = canvas.clientHeight || canvas.height
    const w = Math.max(1, Math.round(cw * dpr))
    const h = Math.max(1, Math.round(ch * dpr))
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { cw, ch }
  }

  function tick() {
    frame = null
    if (done) return
    if (ctx) {
      const { cw, ch } = resize()
      drawRebootFrame(ctx, cw, ch, (performance.now() - start) / duration, label, reducedMotion)
    }
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    done = true
    if (frame !== null) cancelAnimationFrame(frame)
    if (timer !== null) clearTimeout(timer)
    frame = null
    timer = null
  }

  function finish() {
    if (done) return
    stop()
    onDone()
  }

  timer = setTimeout(finish, duration)
  tick()
  return { finish, stop }
}
