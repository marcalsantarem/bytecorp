import { useState } from 'react'
import type { EquipmentCategory } from '../../core/catalog'
import type { GameEngine } from '../../core/engine'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'
import { EquipmentCard } from './EquipmentCard'

const CATEGORIES: EquipmentCategory[] = ['networking', 'processing', 'storage', 'cooling', 'infrastructure']

export function ShopPanel({ engine }: { engine: GameEngine }) {
  const { t } = useI18n()
  const [category, setCategory] = useState<EquipmentCategory>('networking')
  const infos = engine.equipmentList()
  const items = engine.catalog.equipment.flatMap((def, i) => {
    const info = infos[i]
    return info && def.category === category && info.status !== 'hidden' ? [{ def, info }] : []
  })

  return (
    <NeonPanel>
      <h2 className="font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">{t('shop.title')}</h2>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
        aria-label={t('shop.category')}
        className="min-h-11 rounded border border-neon-cyan/30 bg-void px-2 py-1.5 font-mono text-sm text-neon-cyan lg:hidden"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`category.${c}`)}
          </option>
        ))}
      </select>
      <div role="tablist" aria-label={t('shop.category')} className="hidden flex-wrap gap-1 lg:flex">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`rounded border px-2 py-1 font-mono text-[11px] ${category === c ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            {t(`category.${c}`)}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-white/50">{t('shop.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(({ def, info }) => (
            <EquipmentCard key={def.id} engine={engine} def={def} info={info} />
          ))}
        </ul>
      )}
    </NeonPanel>
  )
}
