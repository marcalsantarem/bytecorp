import { Bot, Cpu, ShoppingCart } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { GameEngine } from '../../core/engine'
import type { MessageKey } from '../../i18n'
import { useI18n } from '../i18n'
import { FooterActions } from './Panels'
import { ResourceBar } from './ResourceBar'

type Tab = 'shop' | 'agents' | 'core'

const TABS: { id: Tab; label: MessageKey; icon: ReactNode }[] = [
  { id: 'shop', label: 'tab.shop', icon: <ShoppingCart className="size-5" aria-hidden /> },
  { id: 'agents', label: 'tab.agents', icon: <Bot className="size-5" aria-hidden /> },
  { id: 'core', label: 'tab.core', icon: <Cpu className="size-5" aria-hidden /> },
]

interface Props {
  engine: GameEngine
  onReset: () => Promise<void>
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

// Casca: desktop em três colunas (lg+); mobile mostra uma coluna por vez, com abas inferiores.
// `left` = estatísticas e agentes (aba "agentes"); `center` = núcleo; `right` = loja.
export function GameLayout({ engine, onReset, left, center, right }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('core')
  const show = (own: Tab) => (tab === own ? 'flex' : 'hidden') + ' lg:flex'
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ResourceBar engine={engine} onReset={onReset} />
      <main className="flex min-h-0 flex-1 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <div className={`${show('agents')} min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3 lg:border-r lg:border-neon-cyan/10`}>{left}</div>
        <div className={`${show('core')} min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-3`}>{center}</div>
        <div className={`${show('shop')} min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3 lg:border-l lg:border-neon-cyan/10`}>{right}</div>
      </main>
      <nav className="flex shrink-0 border-t border-neon-cyan/20 bg-panel lg:hidden" aria-label={t('tab.label')}>
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 min-h-11 justify-center py-2 font-mono text-xs ${tab === id ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-white/50'}`}
          >
            {icon}
            {t(label)}
          </button>
        ))}
      </nav>
      <FooterActions />
    </div>
  )
}
