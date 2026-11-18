import { useCallback, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import type { TutorialStepDef } from '../../core/catalog/tutorial'
import type { GameEngine } from '../../core/engine'
import type { MessageKey } from '../../i18n'
import { useI18n } from '../i18n'
import { useEngineRevision } from '../useEngine'
import { useAnyModalOpen } from '../useModal'
import { MARGIN, MAX_WIDTH, placeHint, type Box } from './placement'

// Tutorial contextual (Bíblia 16.1, T-088): um balão por vez junto ao elemento alvo do passo atual.
// Os alvos são marcados com data-tutorial="<id>" (ou, para os botões antigos, data-testid="<id>").
// Alvo numa aba oculta (mobile) aponta para o botão da aba; alvo ausente mostra o balão solto.

type Anchor = { kind: 'target' | 'tab'; rect: DOMRect; tab: string | null } | { kind: 'none'; tab: null }

function visible(el: Element | null): boolean {
  return el !== null && el.getClientRects().length > 0
}

// Alvo marcado; numa lista (ul/ol), o primeiro item, para o destaque não cobrir a coluna inteira.
export function findTutorialTarget(target: string): HTMLElement | null {
  const sel = (attr: string) => `[${attr}="${target}"]`
  const all = [...document.querySelectorAll<HTMLElement>(`${sel('data-tutorial')}, ${sel('data-testid')}`)]
  const el = all.find(visible) ?? all[0] ?? null
  if (el && (el.tagName === 'UL' || el.tagName === 'OL') && el.firstElementChild instanceof HTMLElement) return el.firstElementChild
  return el
}

// Retângulo do alvo recortado pelas áreas roladas que o contêm (a coluna da loja, por exemplo).
function visibleRect(el: HTMLElement): DOMRect {
  const r = el.getBoundingClientRect()
  let { left, top, right, bottom } = r
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(p)
    if (overflowX === 'visible' && overflowY === 'visible') continue
    const c = p.getBoundingClientRect()
    left = Math.max(left, c.left)
    top = Math.max(top, c.top)
    right = Math.min(right, c.right)
    bottom = Math.min(bottom, c.bottom)
  }
  return right > left && bottom > top ? new DOMRect(left, top, right - left, bottom - top) : r
}

// Onde ancorar o balão: no alvo visível; senão no botão da aba que o contém; senão em lugar nenhum.
function resolveAnchor(target: string): Anchor {
  const el = findTutorialTarget(target)
  if (!el) return { kind: 'none', tab: null }
  if (visible(el)) return { kind: 'target', rect: visibleRect(el), tab: null }
  const tab = el.closest<HTMLElement>('[data-tab]')?.dataset.tab ?? null
  const button = tab ? document.querySelector(`[data-tab-button="${tab}"]`) : null
  if (tab && button && visible(button)) return { kind: 'tab', rect: button.getBoundingClientRect(), tab }
  return { kind: 'none', tab: null }
}

// O botão de clique nunca fica coberto pelo balão (alvo do primeiro passo e ação principal do jogo).
const CLICK_TARGET = 'click-button'

function avoidBoxes(target: string): Box[] {
  if (target === CLICK_TARGET) return []
  const el = findTutorialTarget(CLICK_TARGET)
  return el && visible(el) ? [visibleRect(el)] : []
}

function sameBoxes(a: Box[], b: Box[]): boolean {
  return a.length === b.length && a.every((x, i) => {
    const y = b[i]!
    return x.left === y.left && x.top === y.top && x.right === y.right && x.bottom === y.bottom
  })
}

function sameAnchor(a: Anchor, b: Anchor): boolean {
  if (a.kind !== b.kind || a.tab !== b.tab) return false
  if (a.kind === 'none' || b.kind === 'none') return true
  return a.rect.top === b.rect.top && a.rect.left === b.rect.left && a.rect.width === b.rect.width && a.rect.height === b.rect.height
}

function useTutorialStep(engine: GameEngine): TutorialStepDef | null {
  const subscribe = useCallback(
    (notify: () => void) => {
      const offs = [engine.events.on('tutorialChanged', notify), engine.events.on('stateReplaced', notify)]
      return () => offs.forEach((off) => off())
    },
    [engine],
  )
  return useSyncExternalStore(subscribe, () => engine.tutorialStep)
}

export function TutorialHint({ engine }: { engine: GameEngine }) {
  useEngineRevision(engine)
  const step = useTutorialStep(engine)
  const modalOpen = useAnyModalOpen()
  // Não disputa a tela com janelas modais nem com a notificação de conquista.
  if (!step || modalOpen || engine.achievementNotification !== null) return null
  return <Balloon key={step.id} engine={engine} step={step} />
}

// Contorno 4 px para fora do alvo, sem passar das bordas da janela.
function highlightStyle(r: DOMRect): CSSProperties {
  const left = Math.max(r.left - 4, 0)
  const top = Math.max(r.top - 4, 0)
  const right = Math.min(r.right + 4, window.innerWidth)
  const bottom = Math.min(r.bottom + 4, window.innerHeight)
  return { left, top, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) }
}

const TAB_LABEL: Record<string, MessageKey> = { shop: 'tab.shop', agents: 'tab.agents', core: 'tab.core' }

function Balloon({ engine, step }: { engine: GameEngine; step: TutorialStepDef }) {
  const { t } = useI18n()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<Anchor>({ kind: 'none', tab: null })
  const [avoid, setAvoid] = useState<Box[]>([])
  // Âncora em que o balão completo não coube: ali ele fica compacto (sem o texto), sem alternar.
  const [compactFor, setCompactFor] = useState<string | null>(null)
  const anchorKey = `${anchor.kind}:${anchor.tab ?? ''}`
  // Alvo em aba oculta: sempre compacto, só título e a aba a abrir.
  const compact = anchor.kind === 'tab' || compactFor === anchorKey
  // Medidas do balão, da janela e da área de conteúdo (entre cabeçalho e rodapé), onde o balão fica
  // para não cobrir as abas, o rodapé nem os recursos.
  const [size, setSize] = useState({ w: 0, h: 0, vw: 0, vh: 0, top: 0, bottom: 0 })

  const measure = useCallback(() => {
    const box = ref.current
    const area = document.querySelector('main')?.getBoundingClientRect()
    const vh = window.innerHeight
    const s = {
      w: box?.offsetWidth ?? 0,
      h: box?.offsetHeight ?? 0,
      vw: window.innerWidth,
      vh,
      top: area && area.height > 0 ? area.top : 0,
      bottom: area && area.height > 0 ? area.bottom : vh,
    }
    setSize((prev) =>
      prev.w === s.w && prev.h === s.h && prev.vw === s.vw && prev.vh === s.vh && prev.top === s.top && prev.bottom === s.bottom ? prev : s,
    )
  }, [])

  // O conteúdo do balão muda com a âncora (linha da aba): mede de novo antes de pintar.
  useLayoutEffect(measure, [measure, anchor.kind, anchor.tab, compact])

  // Acompanha o alvo a cada quadro: cobre redimensionamento, rolagem, troca de aba e cartões que mudam de altura.
  useLayoutEffect(() => {
    let frame = 0
    let scrolled = false
    const update = () => {
      const next = resolveAnchor(step.target)
      setAnchor((prev) => (sameAnchor(prev, next) ? prev : next))
      const nextAvoid = avoidBoxes(step.target)
      setAvoid((prev) => (sameBoxes(prev, nextAvoid) ? prev : nextAvoid))
      measure()
      // Leva o alvo para a vista uma vez por passo (ele pode estar rolado para fora da coluna).
      if (!scrolled && next.kind === 'target') {
        scrolled = true
        findTutorialTarget(step.target)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      }
    }
    const loop = () => {
      update()
      frame = requestAnimationFrame(loop)
    }
    loop()
    // Também por eventos: o quadro não roda com a página oculta e uma troca de aba deve refletir logo.
    let timer = 0
    const soon = () => {
      clearTimeout(timer)
      timer = window.setTimeout(update, 0)
    }
    window.addEventListener('resize', soon)
    document.addEventListener('scroll', soon, true)
    document.addEventListener('click', soon, true)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      window.removeEventListener('resize', soon)
      document.removeEventListener('scroll', soon, true)
      document.removeEventListener('click', soon, true)
    }
  }, [step.target, measure])

  const manual = step.completion.kind === 'manual'
  const gotIt = () => (manual ? engine.completeTutorialStep(step.id) : engine.dismissTutorialStep())

  const placement =
    anchor.kind === 'none' || size.vw === 0
      ? null
      : placeHint({ anchor: anchor.rect, avoid, h: size.h, vw: size.vw, areaTop: size.top, areaBottom: size.bottom })

  // Completo não coube sem cobrir o alvo ou o botão de clique: passa a compacto nesta âncora.
  const misfit = placement !== null && !placement.fits && !compact && size.h > 0
  // Ajuste de estado durante a renderização (padrão do React para estado derivado de medidas).
  if (misfit) setCompactFor(anchorKey)

  let style: CSSProperties
  const arrow = placement?.arrow ?? null
  if (!placement) {
    // Sem alvo: solto, centrado logo abaixo do cabeçalho (longe do botão de clique).
    style = { left: '50%', top: '4.5rem', transform: 'translateX(-50%)', width: `min(${MAX_WIDTH}px, calc(100vw - ${2 * MARGIN}px))` }
  } else {
    style = { left: placement.left, top: placement.top, width: placement.width }
  }

  const tabKey = anchor.kind === 'tab' && anchor.tab ? TAB_LABEL[anchor.tab] : undefined

  return (
    <>
      {anchor.kind !== 'none' && (
        <div
          data-testid="tutorial-highlight"
          aria-hidden
          className="tutorial-highlight pointer-events-none fixed z-20 rounded-lg border-2 border-neon-cyan"
          style={highlightStyle(anchor.rect)}
        />
      )}
      <div
        ref={ref}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-testid="tutorial-hint"
        data-step={step.id}
        data-anchor={anchor.kind}
        data-compact={compact ? 'true' : undefined}
        className={`fixed z-20 flex flex-col rounded-lg border border-neon-cyan/60 bg-panel/95 font-mono ${compact ? 'gap-1 p-2' : 'gap-2 p-3'} text-sm shadow-[0_0_18px_rgba(0,255,204,0.25)] backdrop-blur`}
        style={style}
      >
        {arrow && (
          <span
            aria-hidden
            className={`absolute size-3 rotate-45 border-neon-cyan/60 bg-panel ${arrow.side === 'up' ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-r border-b'}`}
            style={{ left: arrow.left - 6 }}
          />
        )}
        <h2 id={titleId} className="font-bold text-neon-cyan">
          {t(step.titleKey)}
        </h2>
        {!compact && <p className="text-white/85">{t(step.textKey)}</p>}
        {tabKey && (
          <p data-testid="tutorial-tab-hint" className="text-xs text-neon-magenta">
            {t('tutorialHint.openTab', { tab: t(tabKey) })}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            data-testid="tutorial-skip"
            onClick={() => engine.dismissTutorial()}
            className="min-h-11 rounded px-2 text-xs text-white/50 underline-offset-2 hover:text-white hover:underline lg:min-h-8"
          >
            {t('tutorialHint.skip')}
          </button>
          <button
            type="button"
            data-testid="tutorial-got-it"
            onClick={gotIt}
            className="min-h-11 rounded border border-neon-cyan/60 bg-neon-cyan/15 px-4 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/25 lg:min-h-8"
          >
            {t('tutorialHint.gotIt')}
          </button>
        </div>
      </div>
    </>
  )
}
