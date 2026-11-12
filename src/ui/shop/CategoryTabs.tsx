import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { EquipmentCategory } from '../../core/catalog'
import { EquipmentIcon } from '../components/EquipmentIcon'
import { useI18n } from '../i18n'

export const CATEGORIES: EquipmentCategory[] = ['networking', 'processing', 'storage', 'cooling', 'infrastructure']

const CATEGORY_ICON: Record<EquipmentCategory, string> = {
  networking: 'router',
  processing: 'cpu',
  storage: 'hard-drive',
  cooling: 'snowflake',
  infrastructure: 'plug-zap',
}

interface Props {
  value: EquipmentCategory
  onChange: (c: EquipmentCategory) => void
  /** Categorias com ao menos um equipamento possível de comprar. */
  available: ReadonlySet<EquipmentCategory>
}

export function CategoryTabs({ value, onChange, available }: Props) {
  const { t } = useI18n()
  const refs = useRef<Partial<Record<EquipmentCategory, HTMLButtonElement | null>>>({})

  // Traz a aba ativa para a vista na barra rolável (só a barra, não a página).
  useEffect(() => {
    refs.current[value]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = CATEGORIES.indexOf(value)
    let next: number
    if (e.key === 'ArrowRight') next = (i + 1) % CATEGORIES.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + CATEGORIES.length) % CATEGORIES.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = CATEGORIES.length - 1
    else return
    e.preventDefault()
    const c = CATEGORIES[next]
    if (!c) return
    onChange(c)
    refs.current[c]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={t('shop.category')}
      onKeyDown={onKeyDown}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {CATEGORIES.map((c) => {
        const active = value === c
        return (
          <button
            key={c}
            ref={(el) => {
              refs.current[c] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(c)}
            className={`relative flex min-h-11 shrink-0 items-center gap-1.5 rounded border px-2.5 font-mono text-xs whitespace-nowrap lg:min-h-9 lg:px-2 lg:text-[11px] ${active ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            <EquipmentIcon name={CATEGORY_ICON[c]} className="size-4 shrink-0" />
            {t(`category.${c}`)}
            {available.has(c) && (
              <span
                role="img"
                aria-label={t('shop.category.available')}
                data-testid="category-available"
                className="size-2 shrink-0 rounded-full bg-neon-magenta shadow-[0_0_6px_var(--color-neon-magenta)]"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
