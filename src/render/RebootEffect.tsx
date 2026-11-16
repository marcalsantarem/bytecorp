import { useEffect, useRef } from 'react'
import { mountRebootEffect } from './rebootCanvas'

interface RebootEffectProps {
  active: boolean
  /** Chamado uma vez ao fim do efeito ou ao pular. */
  onDone: () => void
  /** Texto do botão de pular (vem do i18n, no AG04). */
  skipLabel?: string
  /** Texto central desenhado no canvas. */
  label?: string
}

// Efeito de tela cheia, pulável por clique, toque, Esc ou botão. O Reboot já foi aplicado no engine.
export function RebootEffect({ active, onDone, skipLabel = 'Skip', label = 'REBOOT' }: RebootEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlRef = useRef<{ finish: () => void } | null>(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!active || !canvas) return
    const reducedMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const control = mountRebootEffect(canvas, {
      label,
      reducedMotion,
      onDone: () => onDoneRef.current(),
    })
    controlRef.current = control
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') control.finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      control.stop()
      controlRef.current = null
    }
  }, [active, label])

  if (!active) return null
  return (
    <div
      className="fixed inset-0 z-50 select-none"
      data-testid="reboot-effect"
      onClick={() => controlRef.current?.finish()}
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      <button
        type="button"
        className="absolute right-4 bottom-4 border border-neon-cyan px-3 py-1 font-mono text-sm text-neon-cyan"
        onClick={(e) => {
          e.stopPropagation()
          controlRef.current?.finish()
        }}
      >
        {skipLabel}
      </button>
    </div>
  )
}
