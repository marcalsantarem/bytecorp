import type { AgentDef, Effect } from '../../core/catalog'
import type { AgentInfo, GameEngine } from '../../core/engine'
import { formatBytes, formatCount, type Locale } from '../../core/format'
import { EquipmentIcon } from '../components/EquipmentIcon'
import { useRequirementText } from '../components/useRequirementText'
import { useI18n } from '../i18n'

const BUTTON =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded border border-neon-cyan/50 bg-neon-cyan/15 px-2 py-1 text-center leading-tight font-mono text-xs font-bold text-white hover:bg-neon-cyan/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/40 lg:min-h-10'

function effectValue(effect: Effect, locale: Locale): string {
  return effect.kind === 'clickFlat' ? formatBytes(effect.value, locale) : formatCount(effect.value, locale)
}

export function AgentCard({ engine, def, info }: { engine: GameEngine; def: AgentDef; info: AgentInfo }) {
  const { t, locale } = useI18n()
  const requirementText = useRequirementText(engine)

  if (info.status !== 'unlocked') {
    return (
      <li className="flex items-center gap-3 rounded border border-white/10 bg-void/50 p-2 opacity-70" data-status="revealed" data-id={def.id}>
        <EquipmentIcon name={def.icon} className="size-6 shrink-0 text-white/40" />
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-bold text-white/70">{t(def.nameKey)}</div>
          <div className="text-xs text-white/50">{t('shop.locked', { requirement: requirementText(def.unlock) })}</div>
        </div>
      </li>
    )
  }

  const hired = info.count > 0
  const canHire = engine.state.run.bytes.gte(info.hireCost)
  const canLevel = hired && info.levelCost !== null && engine.state.run.bytes.gte(info.levelCost)
  const progress = Math.min(1, Math.max(0, info.levelProgress ?? 0)) * 100

  return (
    <li className="flex flex-col gap-2 rounded border border-neon-cyan/20 bg-void/60 p-2 lg:p-3" data-status="unlocked" data-id={def.id}>
      <div className="flex items-start gap-3">
        <EquipmentIcon name={def.icon} className="size-7 shrink-0 text-neon-cyan" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-sm font-bold text-white">{t(def.nameKey)}</span>
            <span className="shrink-0 font-mono text-lg font-bold text-neon-cyan tabular-nums" data-testid="count" aria-label={t('agents.hired')}>
              {formatCount(info.count, locale)}
            </span>
          </div>
          <p className="text-xs text-white/50">{t(def.descriptionKey)}</p>
          <div className="font-mono text-xs text-neon-magenta/90">{t('agents.specialty', { specialty: t(def.specialtyKey) })}</div>
        </div>
      </div>
      <ul className="flex flex-col gap-0.5 font-mono text-xs text-white/80" data-testid="bonus">
        {hired ? (
          info.bonus.map((e, i) => <li key={i}>{t(`agents.effect.${e.kind}`, { value: effectValue(e, locale) })}</li>)
        ) : (
          <li className="text-white/40">{t('agents.bonusNone')}</li>
        )}
      </ul>
      {hired && (
        <div className="flex flex-col gap-1">
          <div className="font-mono text-xs text-white/60" data-testid="level">
            {t('agents.level', { level: formatCount(info.level, locale) })}
          </div>
          <div
            role="progressbar"
            aria-label={t('agents.levelProgress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" disabled={!canHire} onClick={() => engine.hireAgent(def.id)} className={BUTTON} data-action="hire">
          <span>{t('agents.hire')}</span>
          <span className="max-w-full whitespace-nowrap tabular-nums text-neon-cyan">{formatBytes(info.hireCost, locale)}</span>
        </button>
        <button type="button" disabled={!canLevel} onClick={() => engine.levelUpAgent(def.id)} className={BUTTON} data-action="level">
          <span>{t('agents.levelUp')}</span>
          {info.levelCost && <span className="max-w-full whitespace-nowrap tabular-nums text-neon-cyan">{formatBytes(info.levelCost, locale)}</span>}
        </button>
      </div>
    </li>
  )
}
