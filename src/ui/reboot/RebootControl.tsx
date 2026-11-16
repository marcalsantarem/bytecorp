import { Check, RotateCcw, ShieldCheck, Trash2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { RebootEffect } from '../../render/RebootEffect'
import { useI18n } from '../i18n'

const LOSES: MessageKey[] = ['reboot.loses.bytes', 'reboot.loses.equipment', 'reboot.loses.agents', 'reboot.loses.upgrades', 'reboot.loses.event']
const KEEPS: MessageKey[] = ['reboot.keeps.cores', 'reboot.keeps.tree', 'reboot.keeps.achievements', 'reboot.keeps.stats', 'reboot.keeps.bonuses']

// Botão de Reboot do rodapé, janela de confirmação (Bíblia 9) e efeito pulável.
export function RebootControl({ engine, buttonClass }: { engine: GameEngine; buttonClass: string }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [effect, setEffect] = useState(false)
  const reward = engine.rebootRewardNow
  const can = reward >= 1

  const confirm = () => {
    const result = engine.reboot()
    setOpen(false)
    if (result.ok) setEffect(true)
  }

  return (
    <>
      <button
        type="button"
        data-testid="reboot-button"
        disabled={!can}
        title={can ? undefined : t('reboot.hint')}
        aria-describedby={can ? undefined : 'reboot-hint'}
        onClick={() => setOpen(true)}
        className={buttonClass}
      >
        <RotateCcw className="size-4 shrink-0" aria-hidden />
        <span className="flex max-w-full items-baseline justify-center gap-1 whitespace-nowrap">
          <span className="lg:truncate">{t('footer.reboot')}</span>
          {can && <span className="text-neon-magenta tabular-nums">+{formatCount(reward, locale)}</span>}
        </span>
      </button>
      {!can && (
        <span id="reboot-hint" className="sr-only">
          {t('reboot.hint')}
        </span>
      )}
      {open && <RebootDialog engine={engine} reward={reward} onConfirm={confirm} onCancel={() => setOpen(false)} />}
      <RebootEffect active={effect} onDone={() => setEffect(false)} skipLabel={t('reboot.skip')} label={t('reboot.effectLabel')} />
    </>
  )
}

function RebootDialog({ engine, reward, onConfirm, onCancel }: { engine: GameEngine; reward: number; onConfirm: () => void; onCancel: () => void }) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    return () => previous?.focus?.()
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onCancelRef.current()
      return
    }
    if (e.key !== 'Tab') return
    // Prende o foco entre os dois botões.
    const first = cancelRef.current
    const last = confirmRef.current
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  const total = engine.state.meta.quantumCores.add(reward)
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-xl border border-neon-magenta/40 bg-panel p-4 shadow-[0_0_24px_rgba(255,0,127,0.25)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <RotateCcw className="size-5 text-neon-magenta" aria-hidden />
          {t('reboot.title')}
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded border border-neon-magenta/30 p-2 font-mono text-sm">
          <dt className="text-white/60">{t('reboot.reward')}</dt>
          <dd className="text-right font-bold text-neon-magenta tabular-nums" data-testid="reboot-reward">+{formatCount(reward, locale)}</dd>
          <dt className="text-white/60">{t('reboot.total')}</dt>
          <dd className="text-right font-bold text-neon-cyan tabular-nums" data-testid="reboot-total">{formatCount(total, locale)}</dd>
        </dl>
        <p className="text-sm text-white/70">{t('reboot.body')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Section icon={<Trash2 className="size-4 text-neon-magenta" aria-hidden />} title={t('reboot.loses')} keys={LOSES} />
          <Section icon={<ShieldCheck className="size-4 text-neon-cyan" aria-hidden />} title={t('reboot.keeps')} keys={KEEPS} />
        </div>
        <div className="flex gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 font-mono text-sm text-white/80 hover:bg-white/10"
          >
            <X className="size-4" aria-hidden />
            {t('reboot.cancel')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neon-magenta/60 bg-neon-magenta/20 px-3 py-2 font-mono text-sm font-bold text-white hover:bg-neon-magenta/30"
          >
            <Check className="size-4" aria-hidden />
            {t('reboot.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, keys }: { icon: React.ReactNode; title: string; keys: MessageKey[] }) {
  const { t } = useI18n()
  return (
    <section>
      <h3 className="mb-1 flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-white/80 uppercase">
        {icon}
        {title}
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-white/70">
        {keys.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>
    </section>
  )
}
