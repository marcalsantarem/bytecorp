import type { Effect } from '../../core/catalog'
import { formatBytes, formatCount } from '../../core/format'
import { useI18n } from '../i18n'

// Texto do benefício de um efeito (reaproveita as chaves agents.effect.*).
export function useEffectText(): (effect: Effect) => string {
  const { t, locale } = useI18n()
  return (effect) => {
    const value = effect.kind === 'clickFlat' ? formatBytes(effect.value, locale) : formatCount(effect.value, locale)
    return t(`agents.effect.${effect.kind}`, { value })
  }
}
