import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GameEngine } from '../../core/engine'
import { I18nProvider } from '../i18n'
import { makeEngine, tr } from '../testUtils'
import { useModal } from '../useModal'
import { TutorialHint } from './TutorialHint'

// O jsdom não calcula layout: um elemento conta como visível se não estiver dentro de [hidden].
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
    const list = this.closest('[hidden]') ? [] : [new DOMRect(10, 10, 100, 40)]
    return Object.assign(list, { item: (i: number) => list[i] ?? null }) as unknown as DOMRectList
  })
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(10, 10, 100, 40))
})
afterEach(() => vi.restoreAllMocks())

function Modal() {
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, () => {})
  return <div ref={ref} />
}

function setup(engine: GameEngine, extra: ReactNode = null) {
  return render(
    <I18nProvider>
      {extra}
      <TutorialHint engine={engine} />
    </I18nProvider>,
  )
}

const hint = () => screen.queryByTestId('tutorial-hint')

describe('TutorialHint', () => {
  it('mostra o passo atual junto ao alvo, com destaque', () => {
    const engine = makeEngine()
    setup(engine, <button data-tutorial="click-button">x</button>)
    expect(hint()?.dataset.step).toBe('click')
    expect(hint()?.dataset.anchor).toBe('target')
    expect(screen.getByText(tr('tutorial.click.title'))).toBeTruthy()
    expect(screen.getByText(tr('tutorial.click.text'))).toBeTruthy()
    expect(screen.getByTestId('tutorial-highlight')).toBeTruthy()
  })

  it('não bloqueia o alvo: o destaque ignora o ponteiro e o passo some ao concluir a ação', () => {
    const engine = makeEngine()
    setup(engine, <button data-tutorial="click-button" onClick={() => engine.click()}>x</button>)
    expect(screen.getByTestId('tutorial-highlight').className).toContain('pointer-events-none')
    act(() => {
      fireEvent.click(screen.getByText('x'))
    })
    expect(hint()).toBeNull()
  })

  it('alvo ausente: mostra o balão solto, sem destaque', () => {
    const engine = makeEngine()
    setup(engine)
    expect(hint()?.dataset.anchor).toBe('none')
    expect(screen.queryByTestId('tutorial-highlight')).toBeNull()
    expect(screen.getByTestId('tutorial-got-it')).toBeTruthy()
  })

  it('"Entendi" dispensa o passo comum', () => {
    const engine = makeEngine()
    const reasons: string[] = []
    engine.events.on('tutorialChanged', (e) => reasons.push(e.reason))
    setup(engine)
    act(() => {
      fireEvent.click(screen.getByTestId('tutorial-got-it'))
    })
    expect(reasons).toContain('stepDismissed')
    expect(engine.state.meta.tutorial.completedSteps).toContain('click')
    expect(hint()).toBeNull()
  })

  it('"Entendi" conclui o passo manual', () => {
    const engine = makeEngine({ bytes: 1000 })
    engine.click()
    const first = engine.catalog.equipment[0]!
    engine.buyEquipment(first.id, 'x1')
    expect(engine.tutorialStep?.id).toBe('passiveProduction')
    // A notificação de conquista (se houver) tem a vez; o balão espera ela fechar.
    while (engine.achievementNotification !== null) engine.dismissAchievementNotification()
    const reasons: string[] = []
    engine.events.on('tutorialChanged', (e) => reasons.push(e.reason))
    setup(engine)
    act(() => {
      fireEvent.click(screen.getByTestId('tutorial-got-it'))
    })
    expect(reasons).toContain('completed')
    expect(engine.state.meta.tutorial.completedSteps).toContain('passiveProduction')
  })

  it('"Pular tutorial" dispensa tudo', () => {
    const engine = makeEngine()
    setup(engine)
    act(() => {
      fireEvent.click(screen.getByTestId('tutorial-skip'))
    })
    expect(engine.state.meta.tutorial.dismissed).toBe(true)
    expect(hint()).toBeNull()
  })

  it('alvo numa aba oculta: aponta para o botão da aba e indica a aba', async () => {
    const engine = makeEngine({ bytes: 1000 })
    engine.click()
    expect(engine.tutorialStep?.id).toBe('firstEquipment')
    setup(
      engine,
      <>
        <div data-tab="shop" hidden>
          <ul data-tutorial="shop-equipment" />
        </div>
        <button data-tab-button="shop">loja</button>
      </>,
    )
    expect(hint()?.dataset.anchor).toBe('tab')
    expect(screen.getByTestId('tutorial-tab-hint').textContent).toBe(tr('tutorialHint.openTab', { tab: tr('tab.shop') }))

    // Ao abrir a aba, o balão passa para o alvo.
    const tab = screen.getByText('loja')
    await act(async () => {
      tab.closest('body')!.querySelector('[data-tab="shop"]')!.removeAttribute('hidden')
      fireEvent.click(tab)
      await new Promise((r) => setTimeout(r, 10))
    })
    expect(hint()?.dataset.anchor).toBe('target')
    expect(screen.queryByTestId('tutorial-tab-hint')).toBeNull()
  })

  it('espera a notificação de conquista fechar', () => {
    const engine = makeEngine({ bytes: 1000 })
    engine.click()
    engine.buyEquipment(engine.catalog.equipment[0]!.id, 'x1')
    if (engine.achievementNotification === null) return
    setup(engine)
    expect(hint()).toBeNull()
  })

  it('não aparece com uma janela modal aberta', () => {
    const engine = makeEngine()
    setup(engine, <Modal />)
    expect(hint()).toBeNull()
  })

  it('passa ao próximo passo quando o núcleo avança', () => {
    const engine = makeEngine({ bytes: 1000 })
    setup(engine)
    expect(hint()?.dataset.step).toBe('click')
    act(() => {
      engine.click()
    })
    expect(hint()?.dataset.step).toBe('firstEquipment')
    expect(screen.getByText(tr('tutorial.firstEquipment.title'))).toBeTruthy()
  })
})
