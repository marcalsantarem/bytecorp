import { Lock, Trophy, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AchievementCategory, AchievementDef } from '../../core/catalog/achievements'
import type { GameEngine } from '../../core/engine'
import { formatBytes, formatBytesPerSecond, formatCount } from '../../core/format'
import type { AchievementInfo, AchievementProgress } from '../../core/progression/achievements'
import type { MessageKey } from '../../i18n'
import { useDuration } from '../components/useDuration'
import { useI18n } from '../i18n'
import { useModal } from '../useModal'
import { RARITY, useRewardText } from './AchievementNotification'

const CATEGORY_KEY: Record<AchievementCategory, MessageKey> = {
  production: 'achievements.category.production',
  clicks: 'achievements.category.clicks',
  equipment: 'achievements.category.equipment',
  agents: 'achievements.category.agents',
  reboots: 'achievements.category.reboots',
  quantum: 'achievements.category.quantum',
  milestones: 'achievements.category.milestones',
}

// Botão permanente do rodapé com contador (Bíblia 11 e 15.6); abrir conclui o passo do tutorial.
export function AchievementsControl({ engine, buttonClass }: { engine: GameEngine; buttonClass: string }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const value = formatCount(engine.state.meta.achievements.length, locale)
  const total = formatCount(engine.achievementDefs.length, locale)
  const onOpen = () => {
    setOpen(true)
    engine.completeTutorialStep('achievements')
  }
  return (
    <>
      <button
        type="button"
        data-testid="achievements-button"
        data-tutorial="achievements-button"
        aria-label={t('achievements.open', { value, total })}
        className={buttonClass}
        onClick={onOpen}
      >
        <Trophy className="size-4 shrink-0" aria-hidden />
        <span className="lg:truncate">{t('footer.achievements')}</span>
        <span data-testid="achievements-counter" className="text-[10px] text-neon-cyan/80 tabular-nums lg:text-xs">
          {t('achievements.counter', { value, total })}
        </span>
      </button>
      {open && createPortal(<AchievementsDialog engine={engine} onClose={() => setOpen(false)} />, document.body)}
    </>
  )
}

// Lista por categoria, na ordem do catálogo; sem busca nem filtros. Só lê o engine.
export function AchievementsDialog({ engine, onClose }: { engine: GameEngine; onClose: () => void }) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)

  const list = engine.achievementList()
  const defs = new Map(engine.achievementDefs.map((d) => [d.id, d]))
  const groups = new Map<AchievementCategory, AchievementInfo[]>()
  for (const info of list) {
    const group = groups.get(info.category)
    if (group) group.push(info)
    else groups.set(info.category, [info])
  }
  const unlocked = list.filter((a) => a.unlocked).length
  const count = (n: number) => formatCount(n, locale)

  return (
    // Flex (não grid) para o max-h-full do painel resolver contra a tela e a lista rolar.
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="achievements-dialog"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-2xl flex-col gap-3 rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
            <Trophy className="size-5 text-neon-cyan" aria-hidden />
            {t('achievements.title')}
          </h2>
          <p data-testid="achievements-summary" className="font-mono text-sm text-neon-cyan tabular-nums">
            {t('achievements.summary', { value: count(unlocked), total: count(list.length) })}
          </p>
        </div>
        <div data-testid="achievements-list" className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          {[...groups].map(([category, items]) => (
            <section key={category} data-category={category} aria-labelledby={`${titleId}-${category}`} className="flex flex-col gap-2">
              <h3
                id={`${titleId}-${category}`}
                className="flex items-baseline justify-between gap-2 border-b border-neon-cyan/15 pb-1 font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase"
              >
                <span>{t(CATEGORY_KEY[category])}</span>
                <span className="text-white/50 tabular-nums">
                  {t('achievements.counter', { value: count(items.filter((a) => a.unlocked).length), total: count(items.length) })}
                </span>
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((info) => (
                  <AchievementItem key={info.id} info={info} def={defs.get(info.id)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 font-mono text-sm text-white/80 hover:bg-white/10"
        >
          <X className="size-4" aria-hidden />
          {t('achievements.close')}
        </button>
      </div>
    </div>
  )
}

function AchievementItem({ info, def }: { info: AchievementInfo; def: AchievementDef | undefined }) {
  const { t, locale } = useI18n()
  const rewardText = useRewardText()
  const progressText = useProgressText()
  const hidden = info.secret && !info.unlocked

  if (hidden) {
    return (
      <li data-achievement={info.id} data-state="secret" className="flex gap-3 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-3">
        <Lock className="mt-0.5 size-7 shrink-0 text-white/40" aria-hidden />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-sm font-bold text-white/70">{t('achievements.secret')}</p>
          {info.hintKey && (
            <p className="text-xs text-white/60" data-testid="achievement-hint">
              <span className="text-white/40">{t('achievements.hint')}: </span>
              {t(info.hintKey as MessageKey)}
            </p>
          )}
        </div>
      </li>
    )
  }

  const { icon: Icon, color, labelKey } = RARITY[info.rarity]
  const date = info.unlockedAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(info.unlockedAt.at) : null
  const p = info.progress
  // Estágio é sim/não: posição no catálogo não é progresso, então a barra só enche ao alcançar.
  const ratio = def?.requirement.kind === 'stageReached' ? (info.unlocked ? 1 : 0) : p && p.target.gt(0) ?Math.min(1, p.current.div(p.target).toNumber()) : info.unlocked ? 1 : 0
  const text = p && def ? progressText(def, p) : null

  return (
    <li
      data-achievement={info.id}
      data-state={info.unlocked ? 'unlocked' : 'locked'}
      style={info.unlocked ? { borderColor: color } : undefined}
      className={`flex gap-3 rounded-lg border p-3 ${info.unlocked ? 'bg-white/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}
    >
      <Icon className={`mt-0.5 size-7 shrink-0 ${info.unlocked ? '' : 'opacity-40'}`} style={{ color }} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className={`font-mono text-sm font-bold ${info.unlocked ? 'text-white' : 'text-white/70'}`}>
            {info.nameKey ? t(info.nameKey as MessageKey) : info.id}
          </p>
          <span className="rounded-full border px-1.5 font-mono text-[10px] font-bold tracking-wider uppercase" style={{ color, borderColor: color }}>
            {t(labelKey)}
          </span>
        </div>
        {info.descriptionKey && <p className="text-xs text-white/65">{t(info.descriptionKey as MessageKey)}</p>}
        <div
          role="progressbar"
          aria-label={t('achievements.progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuetext={text ?? undefined}
          className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: info.unlocked ? color : 'var(--color-neon-cyan)' }} />
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 font-mono text-[11px]">
          {text && <span data-testid="achievement-progress" className="text-white/60 tabular-nums">{text}</span>}
          {info.reward && (
            <span data-testid="achievement-reward" className="text-neon-cyan tabular-nums">
              <span className="text-white/45">{t('achievements.reward')}: </span>
              {rewardText(info.reward)}
            </span>
          )}
        </div>
        <p data-testid="achievement-status" className={`font-mono text-[11px] ${info.unlocked ? 'text-neon-cyan/80' : 'text-white/40'}`}>
          {date ? t('achievements.unlockedAt', { date }) : t('achievements.locked')}
        </p>
      </div>
    </li>
  )
}

// Atual/alvo no formato do requisito; estágio não tem número (só a barra).
function useProgressText() {
  const { locale } = useI18n()
  const duration = useDuration()
  return (def: AchievementDef, p: AchievementProgress): string | null => {
    const pair = (f: (v: AchievementProgress['current']) => string): string => `${f(p.current)} / ${f(p.target)}`
    switch (def.requirement.kind) {
      case 'stageReached':
        return null
      case 'bytesEarnedAllTime':
      case 'bytesEarnedInRun':
        return pair((v) => formatBytes(v, locale))
      case 'bytesPerSecond':
        return pair((v) => formatBytesPerSecond(v, locale))
      case 'playTimeMs':
        return pair((v) => duration(v.toNumber()))
      default:
        return pair((v) => formatCount(v, locale))
    }
  }
}
