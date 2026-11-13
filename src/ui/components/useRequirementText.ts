import type { Requirement } from '../../core/catalog'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import { isMessageKey } from '../../i18n'
import { useI18n } from '../i18n'

// Texto do requisito de desbloqueio, compartilhado por loja e agentes.
export function useRequirementText(engine: GameEngine): (req: Requirement) => string {
  const { t, locale } = useI18n()
  return (req) => {
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
}
