import type { UpgradeDef } from '../../core/catalog'
import type { GameEngine, UpgradeInfo } from '../../core/engine'
import { formatBytes } from '../../core/format'
import { EquipmentIcon } from '../components/EquipmentIcon'
import { useEffectText } from '../components/useEffectText'
import { useI18n } from '../i18n'

export function UpgradeCard({ engine, def, info }: { engine: GameEngine; def: UpgradeDef; info: UpgradeInfo }) {
  const { t, locale } = useI18n()
  const effectText = useEffectText()
  const locked = info.status === 'locked'
  const purchased = info.status === 'purchased'
  const canBuy = info.status === 'available' && engine.state.run.bytes.gte(info.cost)

  return (
    <li
      className={`flex flex-col gap-2 rounded border bg-void/60 p-2 lg:p-3 ${locked ? 'border-white/10 opacity-70' : 'border-neon-cyan/20'}`}
      data-status={info.status}
      data-id={def.id}
    >
      <div className="flex items-start gap-3">
        <EquipmentIcon name={def.icon} className={`size-7 shrink-0 ${locked || purchased ? 'text-white/40' : 'text-neon-cyan'}`} />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm font-bold break-words text-white">{t(def.nameKey)}</div>
          <p className="text-xs text-white/50">{t(def.descriptionKey)}</p>
          <div className="font-mono text-xs text-neon-magenta/90">{effectText(info.effect)}</div>
          {locked && (
            <div className="text-xs text-white/50" data-testid="requirement">
              {t('shop.locked', { requirement: t('shop.req.bytesEarned', { amount: formatBytes(info.unlockBytesEarnedInRun, locale) }) })}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={!canBuy}
        onClick={() => engine.buyUpgrade(def.id)}
        className="flex min-h-11 min-w-0 items-center justify-between gap-2 rounded border border-neon-cyan/50 bg-neon-cyan/15 px-3 py-1 font-mono text-xs font-bold text-white hover:bg-neon-cyan/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/40 lg:min-h-10"
        data-action="buy"
      >
        <span>{purchased ? t('upgrades.purchased') : locked ? t('upgrades.locked') : t('upgrades.buy')}</span>
        <span className="whitespace-nowrap tabular-nums text-neon-cyan">{formatBytes(info.cost, locale)}</span>
      </button>
    </li>
  )
}
