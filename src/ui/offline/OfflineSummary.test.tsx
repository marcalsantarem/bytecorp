import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { D } from '../../core/decimal'
import type { OfflineResult } from '../../core/progression/offline'
import { I18nProvider } from '../i18n'
import { makeEngine, tr } from '../testUtils'
import { OfflineSummary } from './OfflineSummary'
import type { OfflineSource, PendingOffline } from './useOfflineSummary'

const H = 3_600_000
const MIN = 60_000

function result(over: Partial<OfflineResult> = {}): OfflineResult {
  const creditedMs = over.creditedMs ?? 2 * H + 5 * MIN
  return { awayMs: creditedMs, creditedMs, cappedMs: 0, bytes: D(1500), segments: [], ...over }
}

function makeSource(initial: PendingOffline | null) {
  let pending = initial
  const listeners = new Set<() => void>()
  const source: OfflineSource = {
    peek: () => pending,
    consume: () => {
      const p = pending
      pending = null
      return p
    },
    subscribe: (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
  return { source, set: (p: PendingOffline) => { pending = p; listeners.forEach((l) => l()) }, current: () => pending }
}

function setup(initial: PendingOffline | null) {
  const engine = makeEngine()
  const s = makeSource(initial)
  render(
    <I18nProvider>
      <button>fora</button>
      <OfflineSummary engine={engine} source={s.source} />
    </I18nProvider>,
  )
  return { engine, ...s }
}

describe('OfflineSummary', () => {
  it('mostra tempos formatados e bytes', () => {
    setup({ result: result({ awayMs: 2 * H + 5 * MIN, creditedMs: 2 * H + 5 * MIN }) })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('offline-away')).toHaveTextContent('2 h 5 min')
    expect(screen.getByTestId('offline-credited')).toHaveTextContent('2 h 5 min')
    expect(screen.getByTestId('offline-bytes')).toHaveTextContent('+1,5 kB')
    expect(screen.queryByTestId('offline-capped')).toBeNull()
    expect(screen.queryByTestId('offline-gains')).toBeNull()
  })

  it('formata só horas, só minutos e menos de um minuto', () => {
    setup({ result: result({ awayMs: 3 * H, creditedMs: 8 * MIN }) })
    expect(screen.getByTestId('offline-away')).toHaveTextContent('3 h')
    expect(screen.getByTestId('offline-credited')).toHaveTextContent('8 min')
  })

  it('avisa do limite sem tom de punição', () => {
    setup({ result: result({ awayMs: 10 * H, creditedMs: 8 * H, cappedMs: 2 * H }) })
    expect(screen.getByTestId('offline-capped')).toHaveTextContent(tr('offline.capped', { time: '8 h' }))
    expect(screen.getByTestId('offline-away')).toHaveTextContent('10 h')
  })

  it('não abre com ausência curta ou sem bytes', () => {
    setup({ result: result({ creditedMs: 30_000, awayMs: 30_000 }) })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('não abre sem bytes e descarta o pendente', () => {
    const { current } = setup({ result: result({ bytes: D(0) }) })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(current()).toBeNull()
  })

  it('mostra o novo estágio alcançado', () => {
    const engine = makeEngine({ stage: 'garage_company' })
    const s = makeSource({ result: result(), stageBefore: 'solo_hacker' })
    render(
      <I18nProvider>
        <OfflineSummary engine={engine} source={s.source} />
      </I18nProvider>,
    )
    expect(screen.getByTestId('offline-stage')).toBeInTheDocument()
    expect(screen.queryByTestId('offline-grants')).toBeNull()
  })

  it('não mostra estágio quando não mudou', () => {
    const engine = makeEngine({ stage: 'garage_company' })
    const s = makeSource({ result: result(), stageBefore: 'garage_company' })
    render(
      <I18nProvider>
        <OfflineSummary engine={engine} source={s.source} />
      </I18nProvider>,
    )
    expect(screen.queryByTestId('offline-gains')).toBeNull()
  })

  it('mostra as concessões recebidas, sozinhas', () => {
    setup({ result: result(), grants: 3 })
    expect(screen.getByTestId('offline-grants')).toHaveTextContent(tr('offline.grantsReceived', { count: 3 }))
    expect(screen.queryByTestId('offline-stage')).toBeNull()
  })

  it('omite a seção sem concessões nem estágio novo', () => {
    setup({ result: result(), grants: 0 })
    expect(screen.queryByTestId('offline-gains')).toBeNull()
  })

  it('abre quando o resultado chega depois da montagem', () => {
    const { set } = setup(null)
    expect(screen.queryByRole('dialog')).toBeNull()
    act(() => set({ result: result() }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('Continuar fecha e consome o pendente', () => {
    const { current } = setup({ result: result() })
    expect(screen.getByText(tr('offline.continue')).closest('button')).toHaveFocus()
    fireEvent.click(screen.getByText(tr('offline.continue')))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(current()).toBeNull()
  })

  it('Esc fecha', () => {
    setup({ result: result() })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('prende o foco com Tab', () => {
    setup({ result: result() })
    const button = screen.getByText(tr('offline.continue')).closest('button')!
    button.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(button).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(button).toHaveFocus()
  })
})
