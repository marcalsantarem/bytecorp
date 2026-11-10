import { Network, RotateCcw, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { useI18n } from '../i18n'

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-neon-cyan/15 bg-panel/60 p-3">
      <h2 className="font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">{title}</h2>
      {children}
    </section>
  )
}

// Lugar reservado para a loja (T-011).
export function ShopPanel() {
  const { t } = useI18n()
  return (
    <Panel title={t('shop.title')}>
      <p className="text-sm text-white/50">{t('shop.placeholder')}</p>
    </Panel>
  )
}

// Lugar reservado para os agentes.
export function AgentsPanel() {
  const { t } = useI18n()
  return (
    <Panel title={t('agents.title')}>
      <p className="text-sm text-white/50">{t('agents.placeholder')}</p>
    </Panel>
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

// Reservado para a infraestrutura e a cena (T-012).
export function InfraPlaceholder() {
  const { t } = useI18n()
  return <p className="font-mono text-xs text-white/40">{t('core.infraPlaceholder')}</p>
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
    <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-neon-cyan/15 bg-panel/90 px-2 py-2">
      {FOOTER.map(({ key, icon }) => (
        <button
          key={key}
          type="button"
          disabled
          className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-50 lg:px-4"
        >
          {icon}
          <span className="truncate">{t(key)}</span>
        </button>
      ))}
    </footer>
  )
}
