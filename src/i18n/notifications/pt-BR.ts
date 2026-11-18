// Textos das notificações locais do navegador (T-089, GDD 22).
export const notificationsPtBR = {
  'notification.achievement.title': 'Conquista desbloqueada',
  'notification.achievement.titleMany': '{count} conquistas desbloqueadas',
  'notification.achievement.more': '{names} e mais {count}',
  'notification.acceleratorExpired.title': 'Acelerador terminou',
  'notification.acceleratorExpired.body': 'O acelerador {multiplier}x acabou. Volte para ativar outro.',
} as const

export type NotificationMessageKey = keyof typeof notificationsPtBR
