import { useState } from 'react'
import type { EquipmentDef, Requirement } from '../../core/catalog'
import type { BuyMode } from '../../core/economy'
import type { EquipmentInfo, GameEngine } from '../../core/engine'
import { formatBytes, formatBytesPerSecond, formatCount } from '../../core/format'
import { isMessageKey, type MessageKey } from '../../i18n'
import { EquipmentIcon } from '../components/EquipmentIcon'
import { useI18n } from '../i18n'

const MODES: { mode: BuyMode; label: MessageKey }[] = [
  { mode: 'x1', label: 'shop.mode.x1' },
  { mode: 'x10', label: 'shop.mode.x10' },
  { mode: 'max', label: 'shop.mode.max' },
]

const BAR_STEP = 25

export function EquipmentCard({ engine, def, info }: { engine: GameEngine; def: EquipmentDef; info: EquipmentInfo }) {
  const { t, locale } = useI18n()
  const [mode, setMode] = useState<BuyMode>('x1')

  const requirementText = (req: Requirement): string => {
    switch (req.kind) {
      case 'always':
        return ''
      case 'bytesEarnedInRun':
        return t('shop.req.bytesEarned', { amount: formatBytes(req.amount, locale) })
      case 'stageReached':
        return t('shop.req.stage', { stage: t(`stage.${req.stage}`) })
      case 'equipmentOwned': {
        const key = engine.catalog.equipment.find((e) => e.id === req.equipment)?.nameKey
        return t('shop.req.equipmentOwned', {
          count: formatCount(req.count, locale),
          name: key && isMessageKey(key) ? t(key) : req.equipment,
        })
      }
    }
  }

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

  const current = info.modes[mode]
  const quantity = current.quantity
  const shown = quantity > 0 ? quantity : mode === 'x10' ? 10 : 1
  const progress = ((info.owned % BAR_STEP) / BAR_STEP) * 100

  return (
    <li className="flex flex-col gap-2 rounded border border-neon-cyan/20 bg-void/60 p-2 lg:p-3" data-status="unlocked" data-id={def.id}>
      <div className="flex items-start gap-3">
        <EquipmentIcon name={def.icon} className="size-7 shrink-0 text-neon-cyan" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-sm font-bold text-white">{t(def.nameKey)}</span>
            <span className="shrink-0 font-mono text-lg font-bold text-neon-cyan tabular-nums" data-testid="owned">
              {formatCount(info.owned, locale)}
            </span>
          </div>
          <p className="hidden text-xs text-white/50 lg:block">{t(def.descriptionKey)}</p>
          <div className="font-mono text-xs text-neon-magenta/90 tabular-nums">{formatBytesPerSecond(info.unitProduction, locale)}</div>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-2">
        <div role="group" aria-label={t('shop.mode.label')} className="flex shrink-0 overflow-hidden rounded border border-white/15">
          {MODES.map(({ mode: m, label }) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-11 px-3 py-1 font-mono text-xs lg:min-h-0 lg:px-2 ${mode === m ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/50 hover:text-white'}`}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={quantity <= 0}
          onClick={() => engine.buyEquipment(def.id, mode)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 min-h-11 rounded border border-neon-cyan/50 bg-neon-cyan/15 px-2 py-1 font-mono text-xs font-bold text-white hover:bg-neon-cyan/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/40 lg:min-h-0"
        >
          <span className="shrink-0">{t('shop.buy', { quantity: formatCount(shown, locale) })}</span>
          <span className="truncate tabular-nums">{formatBytes(current.cost, locale)}</span>
        </button>
      </div>
    </li>
  )
}
