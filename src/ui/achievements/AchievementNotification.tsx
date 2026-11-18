import { Award, Gem, Medal, Trophy, X, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { AchievementRarity, AchievementReward } from '../../core/catalog/achievements'
import { D } from '../../core/decimal'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { useI18n } from '../i18n'
import { useEngineRevision } from '../useEngine'
import { useAnyModalOpen } from '../useModal'

// Aparência por raridade: ícone e cor (borda, brilho e selo).
export const RARITY: Record<AchievementRarity, { icon: LucideIcon; color: string; labelKey: MessageKey }> = {
  bronze: { icon: Medal, color: '#d08a4f', labelKey: 'achievement.rarity.bronze' },
  silver: { icon: Award, color: '#c9d3e0', labelKey: 'achievement.rarity.silver' },
  gold: { icon: Trophy, color: '#ffd23f', labelKey: 'achievement.rarity.gold' },
  diamond: { icon: Gem, color: '#7fe9ff', labelKey: 'achievement.rarity.diamond' },
}

export function useRewardText() {
  const { t, locale } = useI18n()
  return (reward: AchievementReward): string => {
    switch (reward.kind) {
      case 'bytes':
        return t('achievement.reward.bytes', { amount: formatBytes(D(reward.amount), locale) })
      case 'quantumCores':
        return t('achievement.reward.quantumCores', { amount: formatCount(D(reward.amount), locale) })
      case 'temporaryBonus':
        return t('achievement.reward.temporaryBonus', {
          value: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(reward.multiplier),
          minutes: reward.minutes,
        })
    }
  }
}

// Notificação central de conquista (Bíblia 11.7): uma por vez, na ordem da fila do engine,
// fecha só pelo jogador, sem histórico. Não bloqueia o jogo e espera janelas modais fecharem.
export function AchievementNotification({ engine }: { engine: GameEngine }) {
  useEngineRevision(engine)
  const modalOpen = useAnyModalOpen()
  // Força a releitura após fechar: dismiss altera a fila sem emitir evento.
  const [, setDismissed] = useState(0)
  const id = engine.achievementNotification
  if (modalOpen || id === null) return null
  const info = engine.achievementInfo(id)
  const dismiss = () => {
    engine.dismissAchievementNotification()
    setDismissed((n) => n + 1)
  }
  // Id fora do catálogo (catálogo mudou desde o save): descarta em silêncio.
  if (!info) return <DiscardUnknown key={id} engine={engine} id={id} onDone={() => setDismissed((n) => n + 1)} />
  const queued = (engine.state.meta.achievementQueue?.length ?? 1) - 1
  return <Card key={id} engine={engine} id={id} queued={queued} onClose={dismiss} />
}

function DiscardUnknown({ engine, id, onDone }: { engine: GameEngine; id: string; onDone: () => void }) {
  useEffect(() => {
    // Só descarta se ainda for a atual (o StrictMode repete o efeito).
    if (engine.achievementNotification !== id) return
    engine.dismissAchievementNotification()
    onDone()
  })
  return null
}

function Card({ engine, id, queued, onClose }: { engine: GameEngine; id: string; queued: number; onClose: () => void }) {
  const { t } = useI18n()
  const rewardText = useRewardText()
  const titleId = useId()
  const info = engine.achievementInfo(id)!
  const { icon: Icon, color, labelKey } = RARITY[info.rarity]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 grid place-items-center p-4" aria-live="polite">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-testid="achievement-notification"
        data-achievement={id}
        style={{ borderColor: color, boxShadow: `0 0 28px color-mix(in srgb, ${color} 40%, transparent)` }}
        className="pointer-events-auto relative flex w-full max-w-sm flex-col items-center gap-2 rounded-xl border-2 bg-panel/95 px-5 pt-5 pb-4 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('achievement.toast.close')}
          title={t('achievement.toast.close')}
          className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </button>
        <p className="font-mono text-xs font-bold tracking-wider text-white/70 uppercase">{t('achievement.toast.title')}</p>
        <Icon className="size-12" style={{ color }} aria-hidden />
        <span
          data-testid="achievement-rarity"
          className="rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase"
          style={{ color, borderColor: color }}
        >
          {t(labelKey)}
        </span>
        <h2 id={titleId} className="font-mono text-lg font-bold text-white" data-testid="achievement-name">
          {info.nameKey ? t(info.nameKey as MessageKey) : id}
        </h2>
        {info.descriptionKey && (
          <p className="text-sm text-white/75" data-testid="achievement-description">{t(info.descriptionKey as MessageKey)}</p>
        )}
        {info.reward && (
          <p className="mt-1 rounded border border-neon-cyan/30 px-3 py-1 font-mono text-sm" data-testid="achievement-reward">
            <span className="text-white/60">{t('achievement.toast.reward')}: </span>
            <span className="font-bold text-neon-cyan tabular-nums">{rewardText(info.reward)}</span>
          </p>
        )}
        {queued > 0 && (
          <p className="font-mono text-xs text-white/50" data-testid="achievement-queued">{t('achievement.toast.pending', { count: queued })}</p>
        )}
      </div>
    </div>
  )
}
