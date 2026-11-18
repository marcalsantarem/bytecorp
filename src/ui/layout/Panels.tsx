import { Network } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import { AcceleratorInventoryControl } from '../accelerator/AcceleratorInventory'
import { AchievementsControl } from '../achievements/AchievementsDialog'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'
import { QuantumTreeControl } from '../quantum/QuantumTree'
import { RebootControl } from '../reboot/RebootControl'
import { StatsControl } from '../stats/StatsDialog'

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
      <StatsControl engine={engine} />
    </Panel>
  )
}

const FOOTER_BUTTON =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-white/10 px-1.5 py-1 text-center font-mono text-[11px] leading-tight lg:flex-none lg:flex-row lg:gap-1.5 lg:px-4 lg:text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-50'

// Ações permanentes do rodapé: Reboot, árvore Quantum, aceleradores e conquistas.
export function FooterActions({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  return (
    <footer className="relative flex shrink-0 items-stretch justify-center gap-1.5 border-t border-neon-cyan/15 bg-panel/90 px-2 py-2">
      <RebootControl engine={engine} buttonClass={`${FOOTER_BUTTON} enabled:border-neon-magenta/50 enabled:text-white enabled:hover:bg-neon-magenta/10`} />
      <QuantumTreeControl
        engine={engine}
        buttonClass={`${FOOTER_BUTTON} enabled:border-neon-cyan/50 enabled:text-white enabled:hover:bg-neon-cyan/10`}
        icon={<Network className="size-4 shrink-0" aria-hidden />}
        label={t('footer.quantumTree')}
      />
      <AcceleratorInventoryControl
        engine={engine}
        buttonClass={`${FOOTER_BUTTON} enabled:border-neon-cyan/50 enabled:text-white enabled:hover:bg-neon-cyan/10`}
      />
      <AchievementsControl
        engine={engine}
        buttonClass={`${FOOTER_BUTTON} enabled:border-neon-cyan/50 enabled:text-white enabled:hover:bg-neon-cyan/10`}
      />
    </footer>
  )
}
