import { useEffect, useRef } from 'react'
import type { GameEngine } from '../../core/engine'
import { mountCoreScene } from '../../render/coreScene'

// Núcleo visual: só desenha, não é interativo. A limpeza do efeito desmonta a cena.
export function CoreScene({ engine }: { engine: GameEngine }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountCoreScene(canvas, engine.events)
  }, [engine])
  return <canvas ref={canvasRef} className="pointer-events-none aspect-square w-full max-w-72 shrink-0 select-none lg:max-w-96" aria-hidden />
}
