import type { GameEngine } from '../../core/engine'
import type { MessageKey } from '../../i18n'
import { NeonPanel } from '../components/NeonPanel'
import { useRequirementText } from '../components/useRequirementText'
import { useI18n } from '../i18n'

// Estágio corporativo atual e requisito do próximo (sem barra de progresso).
export function StageIndicator({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const requirementText = useRequirementText(engine)
  const { current, next } = engine.stageInfo
  if (!current) return null
  return (
    <div className="w-full max-w-sm min-w-0">
      <NeonPanel>
        <p className="font-mono text-[11px] tracking-wider text-neon-cyan/70 uppercase">{t('stage.label')}</p>
        <p className="font-mono text-sm font-bold break-words text-neon-cyan">{t(current.nameKey as MessageKey)}</p>
        {next && (
          <p className="mt-1 font-mono text-xs break-words text-white/60">
            {t('stage.next', { name: t(next.nameKey as MessageKey), requirement: requirementText(next.requirement) })}
          </p>
        )}
      </NeonPanel>
    </div>
  )
}
