import { Package, X, Zap } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { GameEngine } from '../../core/engine'
import type { AcceleratorItem } from '../../core/state'
import { ICONS } from '../components/iconMap'
import { useI18n } from '../i18n'
import { useModal } from '../useModal'
import { formatRemaining } from './AcceleratorIndicator'

const TOAST_MS = 5000

function sortItems(items: readonly AcceleratorItem[]): AcceleratorItem[] {
  return [...items].sort((a, b) => b.multiplier - a.multiplier || b.remainingMs - a.remainingMs)
}

function ItemIcon({ multiplier }: { multiplier: number }) {
  const Icon = ICONS[multiplier >= 5 ? 'rocket' : 'zap'] ?? Zap
  return <Icon className="size-5 shrink-0 text-neon-cyan" aria-hidden />
}

// Botão do rodapé com o contador de itens, inventário em janela modal (Bíblia 13.3 a 13.5)
// e aviso discreto ao receber um acelerador. Nada ativa sozinho.
export function AcceleratorInventoryControl({ engine, buttonClass }: { engine: GameEngine; buttonClass: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<number | null>(null)
  const count = engine.state.meta.accelerators.inventory.length

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = engine.events.on('acceleratorGranted', ({ items }) => {
      if (items.length === 0) return
      setToast(items.length)
      clearTimeout(timer)
      timer = setTimeout(() => setToast(null), TOAST_MS)
    })
    return () => {
      off()
      clearTimeout(timer)
    }
  }, [engine])

  return (
    <>
      <button type="button" data-testid="accelerator-button" disabled={count === 0} onClick={() => setOpen(true)} className={buttonClass}>
        <Zap className="size-4 shrink-0" aria-hidden />
        <span className="flex max-w-full items-baseline justify-center gap-1 whitespace-nowrap">
          <span className="lg:truncate">{t('footer.accelerators')}</span>
          {count > 0 && <span className="text-neon-cyan tabular-nums">{count}</span>}
        </span>
      </button>
      <div role="status" aria-live="polite" className={toast === null ? 'sr-only' : 'pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-3'}>
        {toast !== null && (
          <span data-testid="accelerator-toast" className="rounded border border-neon-cyan/50 bg-panel px-3 py-2 font-mono text-xs text-neon-cyan shadow-[0_0_16px_rgba(0,255,204,0.2)]">
            {t('accel.granted', { count: toast })}
          </span>
        )}
      </div>
      {open && <InventoryDialog engine={engine} onClose={() => setOpen(false)} />}
    </>
  )
}

interface Decision {
  current: AcceleratorItem
  incoming: AcceleratorItem
}

function InventoryDialog({ engine, onClose }: { engine: GameEngine; onClose: () => void }) {
  const { t } = useI18n()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [, setRev] = useState(0)
  useModal(ref, onClose)

  // O tempo do ativo corre: atualiza a leitura a cada segundo.
  useEffect(() => {
    const id = setInterval(() => setRev((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const { active, inventory } = engine.state.meta.accelerators
  const items = sortItems(inventory)

  const activate = (item: AcceleratorItem) => {
    const result = engine.activateAccelerator(item.id)
    if (!result.ok && 'needsDecision' in result) setDecision({ current: result.current, incoming: result.incoming })
    else setRev((n) => n + 1)
  }

  const resolve = (replace: 'discard' | 'store') => {
    if (decision) engine.activateAccelerator(decision.incoming.id, { replace })
    setDecision(null)
    setRev((n) => n + 1)
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <Package className="size-5 text-neon-cyan" aria-hidden />
          {t('accel.inventory.title')}
        </h2>
        <p className="text-xs text-white/60">
          {active ? t('accel.inventory.activeNote', { value: active.multiplier, time: formatRemaining(active.remainingMs) }) : t('accel.inventory.hint')}
        </p>
        {items.length === 0 ? (
          <p className="rounded border border-white/10 p-3 text-center text-sm text-white/60">{t('accel.inventory.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label={t('accel.inventory.title')}>
            {items.map((item) => (
              <li key={item.id} data-testid="accelerator-item" className="flex items-center gap-3 rounded border border-neon-cyan/25 bg-white/5 p-2 font-mono text-sm">
                <ItemIcon multiplier={item.multiplier} />
                <span className="font-bold text-neon-cyan tabular-nums">{t('accel.multiplier', { value: item.multiplier })}</span>
                <span className="flex-1 text-white/70 tabular-nums">{formatRemaining(item.remainingMs)}</span>
                <button
                  type="button"
                  onClick={() => activate(item)}
                  className="min-h-11 min-w-20 rounded-lg border border-neon-cyan/60 bg-neon-cyan/15 px-3 text-xs font-bold text-white hover:bg-neon-cyan/25"
                >
                  {t('accel.activate')}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 font-mono text-sm text-white/80 hover:bg-white/10"
        >
          <X className="size-4" aria-hidden />
          {t('accel.close')}
        </button>
      </div>
      {decision && <ReplaceDialog decision={decision} onChoose={resolve} onCancel={() => setDecision(null)} />}
    </div>
  )
}

function Compare({ label, item, tone }: { label: string; item: AcceleratorItem; tone: string }) {
  const { t } = useI18n()
  return (
    <div className={`flex-1 rounded border p-2 text-center font-mono ${tone}`}>
      <div className="text-[10px] tracking-wider text-white/60 uppercase">{label}</div>
      <div className="text-xl font-bold tabular-nums">{t('accel.multiplier', { value: item.multiplier })}</div>
      <div className="text-xs text-white/70 tabular-nums">{formatRemaining(item.remainingMs)}</div>
    </div>
  )
}

const REPLACE_BTN = 'flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-sm'

function ReplaceDialog({ decision, onChoose, onCancel }: { decision: Decision; onChoose: (mode: 'discard' | 'store') => void; onCancel: () => void }) {
  const { t } = useI18n()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onCancel)
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3"
      onClick={(e) => {
        e.stopPropagation()
        onCancel()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-xl border border-neon-magenta/40 bg-panel p-4 shadow-[0_0_24px_rgba(255,0,127,0.25)]"
      >
        <h2 id={titleId} className="font-mono text-base font-bold text-white">
          {t('accel.replace.title')}
        </h2>
        <div className="flex gap-2">
          <Compare label={t('accel.replace.current')} item={decision.current} tone="border-neon-magenta/40 text-neon-magenta" />
          <Compare label={t('accel.replace.incoming')} item={decision.incoming} tone="border-neon-cyan/40 text-neon-cyan" />
        </div>
        <p className="text-xs text-white/70">{t('accel.replace.rule')}</p>
        <button type="button" onClick={() => onChoose('discard')} className={`${REPLACE_BTN} border-neon-magenta/60 bg-neon-magenta/20 font-bold text-white hover:bg-neon-magenta/30`}>
          {t('accel.replace.discard')}
        </button>
        <button type="button" onClick={() => onChoose('store')} className={`${REPLACE_BTN} border-neon-cyan/60 bg-neon-cyan/15 font-bold text-white hover:bg-neon-cyan/25`}>
          {t('accel.replace.store')}
        </button>
        <button type="button" onClick={onCancel} className={`${REPLACE_BTN} border-white/20 text-white/80 hover:bg-white/10`}>
          {t('accel.replace.cancel')}
        </button>
      </div>
    </div>
  )
}
