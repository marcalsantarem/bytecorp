import { Check, Clock, Rocket, Zap } from 'lucide-react'
import { useId, useRef } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { useI18n } from '../i18n'
import { useDuration } from '../components/useDuration'
import { useModal } from '../useModal'
import { useOfflineSummary, type OfflineSource, type PendingOffline } from './useOfflineSummary'

// Janela de resumo ao retornar (Bíblia 14.3): sem penalidade e sem sequência diária (14.6).
export function OfflineSummary({ engine, source }: { engine: GameEngine; source: OfflineSource }) {
  const { pending, dismiss } = useOfflineSummary(source)
  if (!pending) return null
  return <SummaryDialog engine={engine} pending={pending} onClose={dismiss} />
}

function SummaryDialog({ engine, pending, onClose }: { engine: GameEngine; pending: PendingOffline; onClose: () => void }) {
  const { t, locale } = useI18n()
  const duration = useDuration()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)
  const { result, stageBefore } = pending
  const grants = pending.grants ?? 0

  const stageNow = engine.state.run.stage
  const stageDef = stageBefore && stageBefore !== stageNow ? engine.catalog.stages.find((s) => s.id === stageNow) : undefined

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="offline-summary"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <Clock className="size-5 text-neon-cyan" aria-hidden />
          {t('offline.title')}
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded border border-neon-cyan/30 p-2 font-mono text-sm">
          <dt className="text-white/60">{t('offline.away')}</dt>
          <dd className="text-right text-white tabular-nums" data-testid="offline-away">{duration(result.awayMs)}</dd>
          <dt className="text-white/60">{t('offline.credited')}</dt>
          <dd className="text-right text-white tabular-nums" data-testid="offline-credited">{duration(result.creditedMs)}</dd>
          <dt className="text-white/60">{t('offline.bytes')}</dt>
          <dd className="text-right font-bold text-neon-cyan tabular-nums" data-testid="offline-bytes">+{formatBytes(result.bytes, locale)}</dd>
        </dl>
        {result.cappedMs > 0 && (
          <p className="text-sm text-white/60" data-testid="offline-capped">
            {t('offline.capped', { time: duration(result.creditedMs) })}
          </p>
        )}
        {(stageDef || grants > 0) && (
          <section data-testid="offline-gains">
            <h3 className="mb-1 font-mono text-xs font-bold tracking-wider text-white/80 uppercase">{t('offline.gains')}</h3>
            {stageDef && (
              <p className="flex items-center gap-1.5 text-sm text-white/80" data-testid="offline-stage">
                <Rocket className="size-4 shrink-0 text-neon-magenta" aria-hidden />
                {t('offline.stageReached', { name: t(stageDef.nameKey as MessageKey) })}
              </p>
            )}
            {grants > 0 && (
              <p className="flex items-center gap-1.5 text-sm text-white/80" data-testid="offline-grants">
                <Zap className="size-4 shrink-0 text-neon-cyan" aria-hidden />
                {t('offline.grantsReceived', { count: grants })}
              </p>
            )}
          </section>
        )}
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-neon-cyan/60 bg-neon-cyan/20 px-3 py-2 font-mono text-sm font-bold text-white hover:bg-neon-cyan/30"
        >
          <Check className="size-4" aria-hidden />
          {t('offline.continue')}
        </button>
      </div>
    </div>
  )
}
