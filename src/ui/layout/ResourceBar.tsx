import { Activity, Cpu, Database, RotateCcw } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatBytesPerSecond, formatCount } from '../../core/format'
import { useI18n } from '../i18n'

// Cabeçalho de recursos: Bytes, B/s e Quantum Cores sempre visíveis (bíblia 15.1).
export function ResourceBar({ engine, onReset }: { engine: GameEngine; onReset: () => Promise<void> }) {
  const { t, locale } = useI18n()
  const { run, meta } = engine.state
  return (
    <header className="z-10 flex shrink-0 items-center justify-between gap-2 border-b border-neon-cyan/20 bg-panel/90 px-3 py-2 backdrop-blur lg:px-4 lg:py-3">
      <h1 className="hidden items-baseline gap-2 font-mono text-lg font-bold tracking-wider text-white lg:flex">
        {t('app.title')}
        <span className="text-xs font-normal tracking-normal text-neon-cyan/50">v{__APP_VERSION__}</span>
      </h1>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-1 font-mono text-xs lg:flex-none lg:justify-end lg:gap-2 lg:text-sm">
        <Stat icon={<Database className="size-4 shrink-0" aria-hidden />} label={t('hud.bytes')} value={formatBytes(run.bytes, locale)} />
        <Stat icon={<Activity className="size-4 shrink-0" aria-hidden />} label={t('hud.production')} value={formatBytesPerSecond(engine.production.total, locale)} />
        <Stat icon={<Cpu className="size-4 shrink-0" aria-hidden />} label={t('hud.quantumCores')} value={formatCount(meta.quantumCores, locale)} accent />
        <ResetButton onReset={onReset} />
      </div>
    </header>
  )
}

const CONFIRM_TIMEOUT_MS = 4000

// Ferramenta de teste: reinicia o jogo por completo, com confirmação em dois passos.
function ResetButton({ onReset }: { onReset: () => Promise<void> }) {
  const { t } = useI18n()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [confirming])

  const click = () => {
    if (busy) return
    if (!confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    setBusy(true)
    onReset()
      .catch((error: unknown) => console.error('Falha ao reiniciar o jogo', error))
      .finally(() => setBusy(false))
  }

  return (
    <button
      type="button"
      aria-label={t(confirming ? 'reset.confirmLabel' : 'reset.label')}
      disabled={busy}
      onClick={click}
      onBlur={() => setConfirming(false)}
      className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded border px-1.5 py-1 text-xs lg:min-h-0 lg:min-w-0 ${
        confirming
          ? 'border-neon-magenta/60 bg-neon-magenta/20 text-neon-magenta'
          : 'border-white/10 text-white/40 hover:border-neon-cyan/30 hover:text-white/70'
      }`}
    >
      <RotateCcw className="size-4 shrink-0" aria-hidden />
      <span className={confirming ? 'text-[10px] leading-tight lg:text-xs' : 'hidden lg:inline'}>{t(confirming ? 'reset.confirm' : 'reset.button')}</span>
    </button>
  )
}

function Stat({ icon, label, value, accent = false }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-start rounded border px-1.5 py-1 lg:flex-none lg:flex-row lg:items-center lg:gap-2 lg:px-2 ${accent ? 'border-neon-magenta/30 text-neon-magenta' : 'border-neon-cyan/20 text-neon-cyan'}`}
    >
      <span className="flex items-center gap-1 text-white/50">
        {icon}
        <span className="text-[10px] leading-tight break-words lg:truncate lg:text-sm">{label}</span>
      </span>
      <span className="max-w-full font-bold tabular-nums break-all lg:truncate">{value}</span>
    </div>
  )
}
