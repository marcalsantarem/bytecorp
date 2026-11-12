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
  return <canvas ref={canvasRef} className="pointer-events-none aspect-square w-[clamp(10rem,calc(100dvh-25rem),18rem)] max-w-full shrink-0 select-none lg:w-[clamp(10rem,calc(100dvh-25rem),24rem)]" aria-hidden />
}
