import { useI18n } from '../i18n'

// Duração em h/min, arredondada para baixo ("menos de 1 min" abaixo de um minuto).
export function useDuration() {
  const { t } = useI18n()
  return (ms: number): string => {
    const minutes = Math.floor(Math.max(0, ms) / 60_000)
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0 && m === 0) return t('offline.duration.lessThanMinute')
    if (h === 0) return t('offline.duration.m', { m })
    if (m === 0) return t('offline.duration.h', { h })
    return t('offline.duration.hm', { h, m })
  }
}
