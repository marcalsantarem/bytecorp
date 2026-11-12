import type { GameEngine } from '../../core/engine'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'
import { AgentCard } from './AgentCard'

export function AgentsPanel({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const items = engine.agentList().flatMap((info) => {
    const def = engine.catalog.agents.find((a) => a.id === info.id)
    return def && info.status !== 'hidden' ? [{ def, info }] : []
  })

  return (
    <NeonPanel>
      <h2 className="font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">{t('agents.title')}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-white/50">{t('agents.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(({ def, info }) => (
            <AgentCard key={def.id} engine={engine} def={def} info={info} />
          ))}
        </ul>
      )}
    </NeonPanel>
  )
}
