import { Activity, Cpu, Database, Languages, TriangleAlert } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { boot, type BootResult, type GameSession } from '../app/bootstrap'
import type { GameEngine } from '../core/engine'
import { formatBytes, formatBytesPerSecond, formatCount, type Locale } from '../core/format'
import type { KeyValueStorage } from '../core/save/storage'
import { LOCALES } from '../i18n'
import { useI18n } from './i18n'
import { useEngineRevision } from './useEngine'

type Phase = { kind: 'loading' } | BootResult

export function App({ storage }: { storage: KeyValueStorage }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })

  useEffect(() => {
    let session: GameSession | null = null
    let cancelled = false
    boot(storage).then((result) => {
      if (cancelled) {
        if (result.kind === 'ready') result.session.stop()
        return
      }
      if (result.kind === 'ready') session = result.session
      setPhase(result)
    })
    return () => {
      cancelled = true
      session?.stop()
    }
  }, [storage])

  if (phase.kind === 'loading') {
    return <div className="grid min-h-screen place-items-center font-mono text-neon-cyan/70">{t('loading')}</div>
  }

  if (phase.kind === 'corrupt') {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="max-w-md rounded-xl border border-neon-magenta/40 bg-panel p-6 text-center">
          <TriangleAlert className="mx-auto mb-3 size-10 text-neon-magenta" aria-hidden />
          <h1 className="mb-2 font-mono text-lg font-bold text-white">{t('save.corrupt.title')}</h1>
          <p className="mb-5 text-sm text-white/70">{t('save.corrupt.body')}</p>
          <button
            type="button"
            className="rounded-lg border border-neon-magenta/50 bg-neon-magenta/20 px-4 py-2 font-mono text-sm font-bold text-white hover:bg-neon-magenta/30"
            onClick={() => phase.startNewGame().then((session) => setPhase({ kind: 'ready', session }))}
          >
            {t('save.corrupt.newGame')}
          </button>
        </div>
      </div>
    )
  }

  return <GameScreen engine={phase.session.engine} />
}

// Casca provisória do M0: cabeçalho de recursos e botão de clique.
// O layout de três colunas e a loja chegam no M1.
function GameScreen({ engine }: { engine: GameEngine }) {
  useEngineRevision(engine)
  const { t, locale, setLocale } = useI18n()
  const { run, meta } = engine.state

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-neon-cyan/20 bg-panel/90 px-4 py-3 backdrop-blur">
        <h1 className="font-mono text-lg font-bold tracking-wider text-white">{t('app.title')}</h1>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <Stat icon={<Database className="size-4" aria-hidden />} label={t('hud.bytes')} value={formatBytes(run.bytes, locale)} />
          <Stat icon={<Activity className="size-4" aria-hidden />} label={t('hud.production')} value={formatBytesPerSecond(engine.production.total, locale)} />
          <Stat icon={<Cpu className="size-4" aria-hidden />} label={t('hud.quantumCores')} value={formatCount(meta.quantumCores, locale)} accent />
          <label className="flex items-center gap-1 rounded border border-neon-cyan/20 px-2 py-1 text-white/70">
            <Languages className="size-4" aria-hidden />
            <span className="sr-only">{t('settings.language')}</span>
            <select className="bg-transparent text-white outline-none" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
              {LOCALES.map((l) => (
                <option key={l} value={l} className="bg-panel">
                  {t(`language.${l}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="size-48 rounded-full border-2 border-neon-cyan/60 shadow-[0_0_40px_rgba(0,255,204,0.3)]" aria-hidden />
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => engine.click()}
            className="rounded-xl border border-neon-cyan/60 bg-neon-cyan/10 px-8 py-4 font-mono text-base font-bold text-white transition-transform duration-75 select-none active:scale-95"
          >
            {t('click.button')}
          </button>
          <span className="font-mono text-xs text-neon-cyan/70">{t('click.perClick', { value: formatBytes(engine.clickValue, locale) })}</span>
        </div>
      </main>
    </div>
  )
}

function Stat({ icon, label, value, accent = false }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded border px-2 py-1 ${accent ? 'border-neon-magenta/30 text-neon-magenta' : 'border-neon-cyan/20 text-neon-cyan'}`}>
      {icon}
      <span className="text-white/50">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  )
}
