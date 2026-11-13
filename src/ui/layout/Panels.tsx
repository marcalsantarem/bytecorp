import { Network, RotateCcw, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <NeonPanel>
      <h2 className="font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">{title}</h2>
      {children}
    </NeonPanel>
  )
}

export function StatsPanel({ engine }: { engine: GameEngine }) {
  const { t, locale } = useI18n()
  const { stats } = engine.state
  return (
    <Panel title={t('stats.title')}>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 font-mono text-sm">
        <dt className="text-white/50">{t('stats.totalGenerated')}</dt>
        <dd className="text-right font-bold text-neon-cyan tabular-nums">{formatBytes(stats.bytesEarnedAllTime, locale)}</dd>
        <dt className="text-white/50">{t('stats.clicks')}</dt>
        <dd className="text-right font-bold text-neon-cyan tabular-nums">{formatCount(stats.clicks, locale)}</dd>
      </dl>
    </Panel>
  )
}

const FOOTER: { key: MessageKey; icon: ReactNode }[] = [
  { key: 'footer.reboot', icon: <RotateCcw className="size-4 shrink-0" aria-hidden /> },
  { key: 'footer.quantumTree', icon: <Network className="size-4 shrink-0" aria-hidden /> },
  { key: 'footer.achievements', icon: <Trophy className="size-4 shrink-0" aria-hidden /> },
]

// Ações permanentes; sem tela ainda, ficam desabilitadas.
export function FooterActions() {
  const { t } = useI18n()
  return (
    <footer className="flex shrink-0 items-center justify-center gap-1.5 border-t border-neon-cyan/15 bg-panel/90 px-2 py-2">
      {FOOTER.map(({ key, icon }) => (
        <button
          key={key}
          type="button"
          disabled
          className="flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-white/10 px-1.5 py-1 text-center font-mono text-[11px] leading-tight lg:min-h-0 lg:flex-none lg:flex-row lg:gap-1.5 lg:px-4 lg:text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-50 lg:px-4"
        >
          {icon}
          <span className="lg:truncate">{t(key)}</span>
        </button>
      ))}
    </footer>
  )
}
