import { Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { GameEngine } from '../../core/engine'
import { useI18n } from '../i18n'

const WARNING_MS = 6000
const EXPIRED_MS = 5000

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${String(m).padStart(2, '0')}:${s}`
}

// Indicador persistente do acelerador ativo (bíblia 13.6): multiplicador, tempo restante,
// barra fina e aviso discreto perto do fim. Sem som. Só lê o estado do engine.
export function AcceleratorIndicator({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const [, setSecond] = useState(0)
  const [ending, setEnding] = useState(false)
  const [expired, setExpired] = useState(false)
  const [total, setTotal] = useState({ id: '', ms: 0 })
  const active = engine.state.meta.accelerators.active

  // Total de referência da barra: o maior tempo restante visto para este acelerador.
  if (active && (total.id !== active.id || active.remainingMs > total.ms)) {
    setTotal({ id: active.id, ms: active.remainingMs })
  }

  useEffect(() => {
    let warnTimer: ReturnType<typeof setTimeout> | undefined
    let expiredTimer: ReturnType<typeof setTimeout> | undefined
    const offs = [
      engine.events.on('acceleratorEnding', () => {
        setEnding(true)
        clearTimeout(warnTimer)
        warnTimer = setTimeout(() => setEnding(false), WARNING_MS)
      }),
      engine.events.on('acceleratorExpired', () => {
        setEnding(false)
        setExpired(true)
        clearTimeout(expiredTimer)
        expiredTimer = setTimeout(() => setExpired(false), EXPIRED_MS)
      }),
      engine.events.on('acceleratorActivated', () => {
        setEnding(false)
        setExpired(false)
      }),
    ]
    return () => {
      offs.forEach((off) => off())
      clearTimeout(warnTimer)
      clearTimeout(expiredTimer)
    }
  }, [engine])

  // Atualiza a leitura a cada 1 s, sem depender de quadros.
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setSecond((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [active?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = active && total.ms > 0 ? Math.min(100, Math.max(0, (active.remainingMs / total.ms) * 100)) : 0
  const tone = ending ? 'border-neon-magenta/70 text-neon-magenta accel-warning' : 'border-neon-cyan/40 text-neon-cyan'

  return (
    <div className="shrink-0 px-3 empty:hidden" data-testid="accelerator-area">
      {active && (
        <div className={`mx-auto mt-1 flex max-w-sm items-center gap-2 rounded border bg-panel/80 px-2 py-1 font-mono text-xs ${tone}`} role="group" aria-label={t('accel.label')}>
          <Zap className="size-4 shrink-0" aria-hidden />
          <span className="font-bold tabular-nums">{t('accel.multiplier', { value: active.multiplier })}</span>
          <span className="tabular-nums" data-testid="accelerator-time">
            {formatRemaining(active.remainingMs)}
          </span>
          <span className="h-1 min-w-8 flex-1 overflow-hidden rounded bg-white/10" aria-hidden>
            <span className="block h-full bg-current" style={{ width: `${pct}%` }} />
          </span>
          {ending && <span className="hidden text-[10px] sm:inline">{t('accel.ending')}</span>}
        </div>
      )}
      <p role="status" aria-live="polite" className={expired ? 'mx-auto mt-1 max-w-sm text-center font-mono text-xs text-white/60' : 'sr-only'}>
        {expired ? t('accel.expired') : ending ? t('accel.ending') : ''}
      </p>
    </div>
  )
}
