import { Check, RotateCcw, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { GameEngine } from '../../core/engine'
import { formatCount } from '../../core/format'
import { useI18n } from '../i18n'
import { useModal } from '../useModal'

// Janela de reset da árvore Quantum (Bíblia 10), em dois passos: resumo e confirmação final.
// Reset da árvore não faz Reboot.
export function QuantumResetDialog({ engine, onDone, onCancel }: { engine: GameEngine; onDone: () => void; onCancel: () => void }) {
  const { t, locale } = useI18n()
  const titleId = useId()
  const [step, setStep] = useState<1 | 2>(1)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  useModal(dialogRef, onCancel)

  const refunded = engine.quantumCoresSpent
  const cost = engine.quantumTreeResetCost
  const balance = engine.state.meta.quantumCores
  const final = balance.add(refunded).sub(cost)
  const refused = final.lt(0)

  // Ao trocar de passo o botão focado some; devolve o foco ao Cancelar.
  useEffect(() => {
    cancelRef.current?.focus()
  }, [step])

  const confirm = () => {
    engine.resetQuantumTree()
    onDone()
  }

  const row = (label: string, value: string, testId: string, cls: string) => (
    <>
      <dt className="text-white/60">{label}</dt>
      <dd className={`text-right font-bold tabular-nums ${cls}`} data-testid={testId}>
        {value}
      </dd>
    </>
  )

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="quantum-reset-dialog"
        data-step={step}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-neon-magenta/40 bg-panel p-4 shadow-[0_0_24px_rgba(255,0,127,0.25)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <RotateCcw className="size-5 text-neon-magenta" aria-hidden />
          {t('quantum.reset.title')}
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded border border-neon-magenta/30 p-2 font-mono text-sm">
          {row(t('quantum.reset.refund'), `+${formatCount(refunded, locale)}`, 'quantum-reset-refund', 'text-neon-cyan')}
          {row(t('quantum.reset.cost'), `-${formatCount(cost, locale)}`, 'quantum-reset-cost', 'text-neon-magenta')}
          {row(t('quantum.reset.final'), refused ? '—' : formatCount(final, locale), 'quantum-reset-final', 'text-white')}
        </dl>
        {refused ? (
          <p role="alert" data-testid="quantum-reset-refused" className="text-sm text-neon-magenta">
            {t('quantum.reset.refused', { missing: formatCount(final.neg(), locale) })}
          </p>
        ) : (
          <p className="text-sm text-white/70">{step === 1 ? t('quantum.reset.body') : t('quantum.reset.final.warn')}</p>
        )}
        <p className="text-xs text-white/50">{t('quantum.reset.noReboot')}</p>
        <div className="flex gap-2 font-mono text-sm">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-white/80 hover:bg-white/10"
          >
            <X className="size-4" aria-hidden />
            {refused ? t('quantum.reset.close') : t('reboot.cancel')}
          </button>
          {!refused && step === 1 && (
            <button
              type="button"
              data-testid="quantum-reset-next"
              onClick={() => setStep(2)}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neon-cyan/60 bg-neon-cyan/15 px-3 py-2 font-bold text-white hover:bg-neon-cyan/25"
            >
              {t('quantum.reset.continue')}
            </button>
          )}
          {!refused && step === 2 && (
            <button
              type="button"
              data-testid="quantum-reset-confirm"
              onClick={confirm}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neon-magenta/60 bg-neon-magenta/20 px-3 py-2 font-bold text-white hover:bg-neon-magenta/30"
            >
              <Check className="size-4" aria-hidden />
              {t('quantum.reset.confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
