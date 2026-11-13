import type { EquipmentCategory } from '../../core/catalog'

interface Def {
  category: EquipmentCategory
}

interface Info {
  status: string
  owned: number
  modes: { x1: { quantity: number } }
}

/** Categorias com ao menos um equipamento desbloqueado, comprável em x1 e ainda sem nenhuma unidade. */
export function categoriesWithNewEquipment(
  defs: readonly Def[],
  infos: readonly (Info | undefined)[],
): Set<EquipmentCategory> {
  return new Set(
    defs.flatMap((def, i) => {
      const info = infos[i]
      return info && info.status === 'unlocked' && info.owned === 0 && info.modes.x1.quantity > 0 ? [def.category] : []
    }),
  )
}
