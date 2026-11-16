import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { creditAway, PendingOffline } from '../../app/offlineSession'
import { D } from '../../core/decimal'
import type { OfflineResult } from '../../core/progression/offline'
import { I18nProvider } from '../i18n'
import { makeEngine } from '../testUtils'
import { OfflineSummary } from './OfflineSummary'
import { sessionOfflineSource } from './sessionSource'

const H = 3_600_000

function result(): OfflineResult {
  return { awayMs: 3 * H, creditedMs: 3 * H, cappedMs: 0, bytes: D(5000), segments: [] }
}

function setup(initial?: OfflineResult) {
  const engine = makeEngine({ equipment: { home_router: 10 } })
  const offline = new PendingOffline()
  if (initial) offline.set(initial)
  render(
    <I18nProvider>
      <OfflineSummary engine={engine} source={sessionOfflineSource(engine, offline)} />
    </I18nProvider>,
  )
  return { engine, offline }
}

describe('resumo ligado à sessão', () => {
  it('abre com crédito pendente e não reabre depois de fechar', () => {
    const { offline } = setup(result())
    expect(screen.getByTestId('offline-summary')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('offline-summary')).toBeNull()
    expect(offline.peek()).toBeNull()
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(screen.queryByTestId('offline-summary')).toBeNull()
  })

  it('mostra estágio novo e concessões vindos da sessão', () => {
    const engine = makeEngine({ stage: 'garage_company' })
    const offline = new PendingOffline()
    offline.set(result(), { stageBefore: 'solo_hacker', grants: 2 })
    render(
      <I18nProvider>
        <OfflineSummary engine={engine} source={sessionOfflineSource(engine, offline)} />
      </I18nProvider>,
    )
    expect(screen.getByTestId('offline-stage')).toBeTruthy()
    expect(screen.getByTestId('offline-grants')).toHaveTextContent(': 2')
  })

  it('soma créditos seguidos e mantém o estágio do primeiro', () => {
    const engine = makeEngine({ stage: 'garage_company' })
    const offline = new PendingOffline()
    offline.set(result(), { stageBefore: 'solo_hacker', grants: 1 })
    offline.set(result(), { stageBefore: 'garage_company', grants: 2 })
    render(
      <I18nProvider>
        <OfflineSummary engine={engine} source={sessionOfflineSource(engine, offline)} />
      </I18nProvider>,
    )
    expect(screen.getByTestId('offline-stage')).toBeTruthy()
    expect(screen.getByTestId('offline-grants')).toHaveTextContent(': 3')
  })

  it('sem concessões nem mudança de estágio, não há seção de ganhos', () => {
    const engine = makeEngine({ stage: 'solo_hacker' })
    const offline = new PendingOffline()
    offline.set(result(), { stageBefore: 'solo_hacker', grants: 0 })
    render(
      <I18nProvider>
        <OfflineSummary engine={engine} source={sessionOfflineSource(engine, offline)} />
      </I18nProvider>,
    )
    expect(screen.queryByTestId('offline-gains')).toBeNull()
  })

  it('não abre sem pendente', () => {
    setup()
    expect(screen.queryByTestId('offline-summary')).toBeNull()
  })

  it('abre ao creditar depois de montado', async () => {
    const { engine, offline } = setup()
    await act(async () => {
      creditAway(engine, offline, 3 * H)
    })
    expect(screen.getByTestId('offline-summary')).toBeTruthy()
  })
})
