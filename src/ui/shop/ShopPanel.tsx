import { useState } from 'react'
import type { EquipmentCategory } from '../../core/catalog'
import type { GameEngine } from '../../core/engine'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'
import { CategoryTabs } from './CategoryTabs'
import { EquipmentCard } from './EquipmentCard'
import { UpgradeCard } from './UpgradeCard'

const VIEWS = ['equipment', 'upgrades'] as const

export function ShopPanel({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const [view, setView] = useState<(typeof VIEWS)[number]>('equipment')
  const [category, setCategory] = useState<EquipmentCategory>('networking')
  const infos = engine.equipmentList()
  const items = engine.catalog.equipment.flatMap((def, i) => {
    const info = infos[i]
    return info && def.category === category && info.status !== 'hidden' ? [{ def, info }] : []
  })
  const available = new Set<EquipmentCategory>(
    engine.catalog.equipment.flatMap((def, i) => {
      const info = infos[i]
      return info && info.status === 'unlocked' && info.modes.x1.quantity > 0 ? [def.category] : []
    }),
  )
  const upgrades = engine.upgradeList().flatMap((info) => {
    const def = engine.catalog.upgrades.find((u) => u.id === info.id)
    return def ? [{ def, info }] : []
  })

  return (
    <NeonPanel>
      <h2 className="font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">{t('shop.title')}</h2>
      <div role="tablist" aria-label={t('shop.view.label')} className="grid grid-cols-2 gap-1">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`min-h-11 rounded border px-2 font-mono text-xs font-bold lg:min-h-9 ${view === v ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            {t(`shop.view.${v}`)}
          </button>
        ))}
      </div>
      {view === 'upgrades' ? (
        <ul className="flex flex-col gap-2">
          {upgrades.map(({ def, info }) => (
            <UpgradeCard key={def.id} engine={engine} def={def} info={info} />
          ))}
        </ul>
      ) : (
        <>
          <CategoryTabs value={category} onChange={setCategory} available={available} />
          {items.length === 0 ? (
            <p className="text-sm text-white/50">{t('shop.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map(({ def, info }) => (
                <EquipmentCard key={def.id} engine={engine} def={def} info={info} />
              ))}
            </ul>
          )}
        </>
      )}
    </NeonPanel>
  )
}
