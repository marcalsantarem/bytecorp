import { Check, Circle, Lock } from 'lucide-react'
import { QUANTUM_NODES } from '../../core/catalog/quantum'
import type { QuantumNodeDef } from '../../core/catalog/types'
import type { GameEngine } from '../../core/engine'
import { formatCount } from '../../core/format'
import type { MessageKey } from '../../i18n'
import { ICONS } from '../components/iconMap'
import { useEffectText } from '../components/useEffectText'
import { useI18n } from '../i18n'

export const PATH_COLOR: Record<QuantumNodeDef['path'], string> = { alpha: '#00ffcc', beta: '#ff007f', gamma: '#ffb000' }

// Painel do nó selecionado (Bíblia 10): efeito atual e do próximo nível, pré-requisitos, custo e compra.
export function QuantumDetails({ engine, selected, onBuy }: { engine: GameEngine; selected: string | null; onBuy: (id: string) => void }) {
  const { t, locale } = useI18n()
  const effectText = useEffectText()
  const def = QUANTUM_NODES.find((n) => n.id === selected)
  const info = selected ? engine.quantumNodeInfo(selected) : undefined

  if (!def || !info) {
    return (
      <aside data-testid="quantum-details" className="shrink-0 border-t border-neon-cyan/20 bg-panel px-3 py-3 font-mono text-sm md:w-80 md:border-t-0 md:border-l">
        <span className="text-white/50">{t('quantum.details.empty')}</span>
      </aside>
    )
  }

  const color = PATH_COLOR[def.path]
  const Icon = ICONS[def.icon]
  const { level, nextCost, status } = info
  const maxed = status === 'maxed'
  const balance = engine.state.meta.quantumCores
  const missing = Math.max(0, nextCost - balance.toNumber())
  const insufficient = status === 'available' && balance.lt(nextCost)
  const max = def.maxLevel === null ? '∞' : String(def.maxLevel)
  const at = (l: number) => effectText({ ...def.effectPerLevel, value: def.effectPerLevel.value * l })

  let reasonKey: MessageKey | null = null
  let reasonParams: Record<string, string> = {}
  if (status === 'locked') reasonKey = 'quantum.reason.locked'
  else if (maxed) reasonKey = 'quantum.reason.maxed'
  else if (insufficient) {
    reasonKey = 'quantum.reason.insufficient'
    reasonParams = { missing: formatCount(missing, locale) }
  }
  const canBuy = status === 'available' && !insufficient

  return (
    <aside
      data-testid="quantum-details"
      aria-label={t('quantum.details.label')}
      className="max-h-[45vh] shrink-0 space-y-3 overflow-y-auto border-t border-neon-cyan/20 bg-panel px-3 py-3 font-mono text-sm md:max-h-none md:w-80 md:border-t-0 md:border-l"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border-2" style={{ borderColor: color, color }}>
          {Icon && <Icon className="size-7" aria-hidden />}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-white" data-testid="quantum-details-name">
            {t(def.nameKey)}
          </h3>
          <p className="text-xs" style={{ color }}>
            {t(`quantum.path.${def.path}` as MessageKey)}
          </p>
        </div>
      </div>

      <p className="text-white/70">{t(def.descriptionKey)}</p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-white/60">{t('quantum.details.level')}</dt>
        <dd className="text-right font-bold text-white tabular-nums" data-testid="quantum-details-level">
          {level}/{max}
        </dd>
        <dt className="text-white/60">{t('quantum.details.current')}</dt>
        <dd className="text-right text-neon-cyan" data-testid="quantum-details-current">
          {level > 0 ? at(level) : t('quantum.details.none')}
        </dd>
        {!maxed && (
          <>
            <dt className="text-white/60">{t('quantum.details.next')}</dt>
            <dd className="text-right text-neon-magenta" data-testid="quantum-details-next">
              {at(level + 1)}
            </dd>
          </>
        )}
      </dl>

      <section>
        <h4 className="mb-1 text-xs font-bold tracking-wider text-white/80 uppercase">{t('quantum.details.prereqs')}</h4>
        {def.prerequisites.length === 0 ? (
          <p className="text-white/50">{t('quantum.details.noPrereqs')}</p>
        ) : (
          <ul className="space-y-0.5">
            {def.prerequisites.map((p) => {
              const pDef = QUANTUM_NODES.find((n) => n.id === p)
              const met = (engine.state.meta.quantumNodes[p] ?? 0) >= 1
              return (
                <li key={p} data-testid={`quantum-prereq-${p}`} data-met={met} className={`flex items-center gap-1.5 ${met ? 'text-neon-cyan' : 'text-white/60'}`}>
                  {met ? <Check className="size-4 shrink-0" aria-hidden /> : <Circle className="size-4 shrink-0" aria-hidden />}
                  <span>{pDef ? t(pDef.nameKey) : p}</span>
                  <span className="sr-only">{t(met ? 'quantum.details.met' : 'quantum.details.unmet')}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {!maxed && (
        <div className="flex items-baseline justify-between">
          <span className="text-white/60">{t('quantum.details.cost')}</span>
          <span className="font-bold text-neon-magenta tabular-nums" data-testid="quantum-details-cost">
            {formatCount(nextCost, locale)}
          </span>
        </div>
      )}

      <button
        type="button"
        data-testid="quantum-buy"
        disabled={!canBuy}
        aria-describedby={reasonKey ? 'quantum-buy-reason' : undefined}
        onClick={() => onBuy(def.id)}
        className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-neon-cyan/60 bg-neon-cyan/15 px-3 py-2 font-bold text-white hover:bg-neon-cyan/25 disabled:border-white/15 disabled:bg-transparent disabled:text-white/40"
      >
        {status === 'locked' && <Lock className="size-4" aria-hidden />}
        {t('quantum.buy')}
      </button>
      {reasonKey && (
        <p id="quantum-buy-reason" data-testid="quantum-buy-reason" className="text-center text-xs text-white/60">
          {t(reasonKey, reasonParams)}
        </p>
      )}
    </aside>
  )
}
