import { BarChart3, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { useDuration } from '../components/useDuration'
import { useI18n } from '../i18n'
import { useModal } from '../useModal'

// Botão "Detalhes" do painel de estatísticas: abre a janela de estatísticas detalhadas (Bíblia 15.5).
export function StatsControl({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        data-testid="stats-button"
        aria-label={t('stats.open')}
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-neon-cyan/30 px-3 py-1 font-mono text-xs text-white/70 hover:bg-neon-cyan/10 hover:text-white lg:min-h-9"
      >
        <BarChart3 className="size-4 shrink-0" aria-hidden />
        {t('stats.details')}
      </button>
      {open && createPortal(<StatsDialog engine={engine} onClose={() => setOpen(false)} />, document.body)}
    </>
  )
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

// Lista vertical única de totais, sem abas nem gráficos. Só lê o estado do engine.
export function StatsDialog({ engine, onClose }: { engine: GameEngine; onClose: () => void }) {
  const { t, locale } = useI18n()
  const duration = useDuration()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)

  const { run, meta, stats } = engine.state
  const bytes = (v: Parameters<typeof formatBytes>[0]) => formatBytes(v, locale)
  const count = (v: Parameters<typeof formatCount>[0]) => formatCount(v, locale)

  const rows: { id: string; label: MessageKey; value: string }[] = [
    { id: 'bytesAllTime', label: 'stats.bytesAllTime', value: bytes(stats.bytesEarnedAllTime) },
    { id: 'bytesRun', label: 'stats.bytesRun', value: bytes(run.bytesEarned) },
    { id: 'bytesFromClicks', label: 'stats.bytesFromClicks', value: bytes(stats.bytesFromClicks) },
    { id: 'bytesFromProduction', label: 'stats.bytesFromProduction', value: bytes(stats.bytesFromProduction) },
    { id: 'clicks', label: 'stats.clicks', value: count(stats.clicks) },
    { id: 'criticalClicks', label: 'stats.criticalClicks', value: count(stats.criticalClicks) },
    { id: 'equipmentRun', label: 'stats.equipmentRun', value: count(sum(Object.values(run.equipment))) },
    { id: 'agentsRun', label: 'stats.agentsRun', value: count(sum(Object.values(run.agents).map((a) => a.count))) },
    { id: 'upgradesRun', label: 'stats.upgradesRun', value: count(run.upgrades.length) },
    { id: 'reboots', label: 'stats.reboots', value: count(stats.reboots) },
    { id: 'quantumCores', label: 'stats.quantumCores', value: count(meta.quantumCores) },
    { id: 'quantumCoresInvested', label: 'stats.quantumCoresInvested', value: count(engine.quantumCoresSpent) },
    { id: 'quantumNodeLevels', label: 'stats.quantumNodeLevels', value: count(sum(Object.values(meta.quantumNodes))) },
    { id: 'treeResets', label: 'stats.treeResets', value: count(meta.treeResets) },
    {
      id: 'achievements',
      label: 'stats.achievements',
      value: t('stats.ofTotal', { value: count(meta.achievements.length), total: count(engine.achievementDefs.length) }),
    },
    { id: 'playTime', label: 'stats.playTime', value: duration(stats.playTimeMs) },
  ]

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <BarChart3 className="size-5 text-neon-cyan" aria-hidden />
          {t('stats.detailsTitle')}
        </h2>
        <dl data-testid="stats-list" className="flex min-h-0 flex-col overflow-y-auto rounded-lg border border-neon-cyan/15 bg-white/[0.03] font-mono text-sm">
          {rows.map(({ id, label, value }) => (
            <div key={id} data-stat={id} className="flex items-baseline justify-between gap-3 border-b border-white/5 px-3 py-2 last:border-b-0">
              <dt className="min-w-0 text-white/60">{t(label)}</dt>
              <dd className="shrink-0 text-right font-bold text-neon-cyan tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 font-mono text-sm text-white/80 hover:bg-white/10"
        >
          <X className="size-4" aria-hidden />
          {t('stats.close')}
        </button>
      </div>
    </div>
  )
}
