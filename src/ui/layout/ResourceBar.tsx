import { Activity, Cpu, Database, Languages } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatBytesPerSecond, formatCount, type Locale } from '../../core/format'
import { LOCALES } from '../../i18n'
import { useI18n } from '../i18n'

// Cabeçalho de recursos: Bytes, B/s e Quantum Cores sempre visíveis (bíblia 15.1).
export function ResourceBar({ engine }: { engine: GameEngine }) {
  const { t, locale, setLocale } = useI18n()
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
        <label className="relative flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded border border-neon-cyan/20 px-1.5 py-1 text-white/70 lg:min-h-0 lg:min-w-0 lg:justify-start">
          <Languages className="size-4" aria-hidden />
          <select
            aria-label={t('settings.language')}
            className="absolute inset-0 w-full cursor-pointer opacity-0 lg:static lg:w-auto lg:bg-transparent lg:opacity-100 lg:text-white lg:outline-none" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l} className="bg-panel">
                {t(`language.${l}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
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
