import { Minus, Network, Plus, RotateCcw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { QUANTUM_NODES } from '../../core/catalog/quantum'
import type { GameEngine } from '../../core/engine'
import { formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { ICONS } from '../components/iconMap'
import { useI18n } from '../i18n'
import { PATH_COLOR, QuantumDetails } from './QuantumDetails'
import { QuantumResetDialog } from './QuantumResetDialog'

const CELL = 130
const NODE = 76
const MIN_ZOOM = 0.3
const MAX_ZOOM = 2
const DRAG_THRESHOLD = 5

interface View {
  x: number
  y: number
  k: number
}

const clampZoom = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k))

// Enquadramento: centro dos nós no centro da área, com zoom que cabe o mapa inteiro.
function fitView(width: number, height: number): View {
  const xs = QUANTUM_NODES.map((n) => n.position.x * CELL)
  const ys = QUANTUM_NODES.map((n) => n.position.y * CELL)
  const w = Math.max(...xs) - Math.min(...xs) + NODE * 2
  const h = Math.max(...ys) - Math.min(...ys) + NODE * 2
  const k = width > 0 && height > 0 ? clampZoom(Math.min(width / w, height / h)) : 1
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2
  return { x: width / 2 - cx * k, y: height / 2 - cy * k, k }
}

// Limites do pan: o centro do mapa não sai da área visível.
function clampView(v: View, width: number, height: number): View {
  const xs = QUANTUM_NODES.map((n) => n.position.x * CELL)
  const ys = QUANTUM_NODES.map((n) => n.position.y * CELL)
  const lim = (min: number, max: number, size: number, off: number) => {
    const lo = size - max * v.k - NODE * v.k
    const hi = -min * v.k + NODE * v.k
    return lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, off))
  }
  return {
    k: v.k,
    x: lim(Math.min(...xs), Math.max(...xs), width, v.x),
    y: lim(Math.min(...ys), Math.max(...ys), height, v.y),
  }
}

// Tela da árvore Quantum (Bíblia 10): mapa com pan e zoom, seleção de nó.
export function QuantumTree({ engine, onClose }: { engine: GameEngine; onClose: () => void }) {
  const { t, locale } = useI18n()
  const area = useRef<HTMLDivElement | null>(null)
  const fitted = useRef(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 })
  const [selected, setSelected] = useState<string | null>(null)
  const [flash, setFlash] = useState<{ id: string; n: number } | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ moved: boolean; dist: number }>({ moved: false, dist: 0 })

  const size = () => ({ w: area.current?.clientWidth ?? 0, h: area.current?.clientHeight ?? 0 })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => previous?.focus?.()
  }, [])

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) =>
      setView((v) => {
        const k = clampZoom(v.k * factor)
        const r = k / v.k
        const el = area.current
        return clampView({ k, x: px - (px - v.x) * r, y: py - (py - v.y) * r }, el?.clientWidth ?? 0, el?.clientHeight ?? 0)
      }),
    [],
  )
  const zoomCenter = (factor: number) => {
    const { w, h } = size()
    zoomAt(factor, w / 2, h / 2)
  }

  // Roda: o React registra onWheel como passivo, então o listener é nativo para poder impedir a rolagem da página.
  useEffect(() => {
    const el = area.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gesture.current = { moved: false, dist: 0 }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current.dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const cur = { x: e.clientX, y: e.clientY }
    const rect = area.current?.getBoundingClientRect()
    if (pointers.current.size === 1) {
      const dx = cur.x - prev.x
      const dy = cur.y - prev.y
      if (!gesture.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      if (!gesture.current.moved) {
        gesture.current.moved = true
        area.current?.setPointerCapture?.(e.pointerId)
      }
      pointers.current.set(e.pointerId, cur)
      setView((v) => {
        const { w, h } = size()
        return clampView({ ...v, x: v.x + dx, y: v.y + dy }, w, h)
      })
    } else if (pointers.current.size === 2 && rect) {
      pointers.current.set(e.pointerId, cur)
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      if (gesture.current.dist > 0 && dist > 0) {
        gesture.current.moved = true
        zoomAt(dist / gesture.current.dist, (a!.x + b!.x) / 2 - rect.left, (a!.y + b!.y) / 2 - rect.top)
      }
      gesture.current.dist = dist
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (area.current?.hasPointerCapture?.(e.pointerId)) area.current.releasePointerCapture(e.pointerId)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), 700)
    return () => clearTimeout(timer)
  }, [flash])

  const buy = (id: string) => {
    if (engine.buyQuantumNode(id).ok) setFlash((f) => ({ id, n: (f?.n ?? 0) + 1 }))
  }

  const levelOf = (id: string) => engine.state.meta.quantumNodes[id] ?? 0
  const zoomBtn = 'grid size-11 place-items-center rounded-lg border border-neon-cyan/40 bg-panel/90 text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-40'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('quantum.title')}
      data-testid="quantum-tree"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-40 flex flex-col bg-void"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-neon-cyan/20 bg-panel px-3 py-2">
        <Network className="size-5 shrink-0 text-neon-cyan" aria-hidden />
        <h2 className="min-w-0 flex-1 truncate font-mono text-base font-bold text-white">{t('quantum.title')}</h2>
        <div className="flex items-baseline gap-1.5 font-mono text-sm" data-testid="quantum-balance">
          <span className="hidden text-white/50 sm:inline">{t('quantum.balance')}</span>
          <span className="font-bold text-neon-magenta tabular-nums">{formatCount(engine.state.meta.quantumCores, locale)}</span>
        </div>
        <button
          type="button"
          data-testid="quantum-reset-open"
          onClick={() => setResetOpen(true)}
          disabled={engine.quantumCoresSpent <= 0}
          title={engine.quantumCoresSpent <= 0 ? t('quantum.reset.nothing') : undefined}
          aria-label={t('quantum.reset.open')}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-neon-magenta/50 px-3 font-mono text-sm text-neon-magenta hover:bg-neon-magenta/10 disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t('quantum.reset.open')}</span>
        </button>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('quantum.close')}
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div
        ref={(el) => {
          area.current = el
          // Enquadramento inicial, uma vez, quando a área existe e tem tamanho.
          if (el && !fitted.current) {
            fitted.current = true
            setView(fitView(el.clientWidth, el.clientHeight))
          }
        }}
        data-testid="quantum-map"
        role="group"
        aria-label={t('quantum.map')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative min-h-0 flex-1 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
      >
        <div
          data-testid="quantum-world"
          data-zoom={view.k.toFixed(3)}
          className="absolute top-0 left-0 origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          <svg width="1" height="1" className="absolute top-0 left-0 overflow-visible" aria-hidden>
            {QUANTUM_NODES.flatMap((n) =>
              n.prerequisites.map((p) => {
                const from = QUANTUM_NODES.find((d) => d.id === p)
                if (!from) return null
                const lit = levelOf(p) >= 1
                const color = PATH_COLOR[n.path]
                return (
                  <line
                    key={`${p}-${n.id}`}
                    data-testid={`quantum-line-${p}-${n.id}`}
                    data-lit={lit}
                    x1={from.position.x * CELL}
                    y1={from.position.y * CELL}
                    x2={n.position.x * CELL}
                    y2={n.position.y * CELL}
                    stroke={color}
                    strokeWidth={lit ? 3 : 2}
                    strokeOpacity={lit ? 1 : 0.25}
                    strokeDasharray={lit ? undefined : '6 6'}
                    style={lit ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
                  />
                )
              }),
            )}
          </svg>
          {QUANTUM_NODES.map((n) => {
            const info = engine.quantumNodeInfo(n.id)
            const level = info?.level ?? 0
            const status = info?.status ?? 'locked'
            const visual = status === 'locked' ? 'locked' : status === 'maxed' ? 'maxed' : level > 0 ? 'partial' : 'available'
            const Icon = ICONS[n.icon]
            const color = PATH_COLOR[n.path]
            const isSel = selected === n.id
            const name = t(n.nameKey as MessageKey)
            const max = n.maxLevel === null ? '∞' : String(n.maxLevel)
            return (
              <button
                key={n.id}
                type="button"
                data-testid={`quantum-node-${n.id}`}
                data-status={visual}
                aria-pressed={isSel}
                aria-label={`${name}, ${t(`quantum.path.${n.path}` as MessageKey)}, ${level}/${max}, ${t(`quantum.status.${visual}` as MessageKey)}`}
                onClick={() => setSelected(n.id)}
                className={`absolute flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 bg-panel font-mono outline-offset-4 focus-visible:outline-2 focus-visible:outline-white ${visual === 'locked' ? 'opacity-45 grayscale' : ''} ${visual === 'maxed' ? 'bg-white/10' : ''}`}
                style={{
                  width: NODE,
                  height: NODE,
                  left: n.position.x * CELL - NODE / 2,
                  top: n.position.y * CELL - NODE / 2,
                  borderColor: color,
                  borderStyle: visual === 'locked' ? 'dashed' : 'solid',
                  color,
                  boxShadow: isSel ? `0 0 0 3px #fff, 0 0 18px ${color}` : visual === 'locked' ? 'none' : `0 0 ${visual === 'available' ? 6 : 14}px ${color}`,
                }}
              >
                {flash?.id === n.id && <span key={flash.n} data-testid={`quantum-flash-${n.id}`} aria-hidden className="quantum-flash pointer-events-none absolute -inset-1 rounded-xl border-2" style={{ borderColor: color, boxShadow: `0 0 24px ${color}` }} />}
                {Icon && <Icon className="size-7" aria-hidden />}
                <span className="text-[11px] leading-none font-bold text-white tabular-nums">
                  {level}/{max}
                </span>
              </button>
            )
          })}
        </div>

        <div className="absolute right-3 bottom-3 flex flex-col gap-2">
          <button type="button" className={zoomBtn} aria-label={t('quantum.zoomIn')} data-testid="quantum-zoom-in" onClick={() => zoomCenter(1.25)} disabled={view.k >= MAX_ZOOM}>
            <Plus className="size-5" aria-hidden />
          </button>
          <button type="button" className={zoomBtn} aria-label={t('quantum.zoomOut')} data-testid="quantum-zoom-out" onClick={() => zoomCenter(1 / 1.25)} disabled={view.k <= MIN_ZOOM}>
            <Minus className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <QuantumDetails engine={engine} selected={selected} onBuy={buy} />
      </div>
      {resetOpen && <QuantumResetDialog engine={engine} onDone={() => setResetOpen(false)} onCancel={() => setResetOpen(false)} />}
    </div>
  )
}

// Botão do rodapé + tela da árvore.
export function QuantumTreeControl({ engine, buttonClass, icon, label }: { engine: GameEngine; buttonClass: string; icon: React.ReactNode; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" data-testid="quantum-button" className={buttonClass} onClick={() => setOpen(true)}>
        {icon}
        <span className="lg:truncate">{label}</span>
      </button>
      {open && <QuantumTree engine={engine} onClose={() => setOpen(false)} />}
    </>
  )
}
