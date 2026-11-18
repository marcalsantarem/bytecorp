import { useEffect, useRef } from 'react'
import { mountStartBackground, type QualitySetting, type StartBackgroundControl } from './startBackground'

interface Props {
  /** Qualidade gráfica salva nas configurações. */
  quality: QualitySetting
}

// Canvas do fundo da tela inicial (T-086). Monta ao entrar e libera tudo ao sair.
export function StartBackgroundCanvas({ quality }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlRef = useRef<StartBackgroundControl | null>(null)
  const qualityRef = useRef(quality)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const control = mountStartBackground(canvas, { quality: qualityRef.current })
    controlRef.current = control
    return () => {
      control.stop()
      controlRef.current = null
    }
  }, [])

  useEffect(() => {
    qualityRef.current = quality
    controlRef.current?.setQuality(quality)
  }, [quality])

  return <canvas ref={canvasRef} data-testid="start-background-canvas" className="block h-full w-full" />
}
