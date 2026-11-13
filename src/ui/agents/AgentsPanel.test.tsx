import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATALOG } from '../../core/catalog'
import { formatBytes, formatCount } from '../../core/format'
import { flush, makeEngine, renderWithEngine, tr } from '../testUtils'
import { AgentsPanel } from './AgentsPanel'

const card = (id: string) => document.querySelector<HTMLElement>(`[data-id="${id}"]`)
const hire = (id: string) => card(id)!.querySelector<HTMLButtonElement>('[data-action="hire"]')!
const level = (id: string) => card(id)!.querySelector<HTMLButtonElement>('[data-action="level"]')!

// echo_ai: revelado com 3.000 B gerados, desbloqueado no estágio Garage Company.
// kai_ver_3: revelado em Garage Company, desbloqueado em Startup Lab.
const ECHO = 'echo_ai'
const KAI = 'kai_ver_3'

describe('painel de agentes', () => {
  it('sem nada revelado mostra a mensagem de vazio', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    expect(screen.getByText(tr('agents.empty'))).toBeInTheDocument()
    expect(card(ECHO)).toBeNull()
  })

  it('agente oculto não aparece', () => {
    const engine = makeEngine({ bytesEarned: 100 })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    expect(card(ECHO)).toBeNull()
    expect(card(KAI)).toBeNull()
  })

  it('agente revelado mostra o requisito e não tem botões', () => {
    const engine = makeEngine({ bytesEarned: 3_000 })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    const el = card(ECHO)!
    expect(el).toHaveAttribute('data-status', 'revealed')
    expect(within(el).getByText(/Desbloqueio:/)).toBeInTheDocument()
    expect(within(el).queryByRole('button')).toBeNull()
  })

  it('agente desbloqueado mostra contratar, evoluir e sem bônus', () => {
    const engine = makeEngine({ stage: 'garage_company', bytes: 10 })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    const el = card(ECHO)!
    expect(el).toHaveAttribute('data-status', 'unlocked')
    expect(within(el).getByTestId('count')).toHaveTextContent('0')
    expect(within(el).getByText(tr('agents.bonusNone'))).toBeInTheDocument()
    expect(within(el).queryByTestId('level')).toBeNull()
    expect(hire(ECHO)).toBeDisabled()
    expect(hire(ECHO)).toHaveTextContent(formatBytes(engine.agentInfo(ECHO)!.hireCost, 'pt-BR'))
    expect(level(ECHO)).toBeDisabled()
    expect(card(KAI)).toHaveAttribute('data-status', 'revealed')
    expect(within(card(KAI)!).queryByRole('button')).toBeNull()
  })

  it('contratar e evoluir debitam e atualizam quantidade e nível', async () => {
    const engine = makeEngine({ stage: 'garage_company', bytes: 20_000, bytesEarned: 20_000 })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    const hireCost = engine.agentInfo(ECHO)!.hireCost.toNumber()
    const bytes0 = engine.state.run.bytes.toNumber()

    expect(hire(ECHO)).toBeEnabled()
    fireEvent.click(hire(ECHO))
    await flush(engine)
    expect(engine.state.run.agents[ECHO]).toEqual({ count: 1, level: 1 })
    expect(engine.state.run.bytes.toNumber()).toBe(bytes0 - hireCost)
    expect(within(card(ECHO)!).getByTestId('count')).toHaveTextContent('1')
    expect(within(card(ECHO)!).getByTestId('level')).toHaveTextContent(tr('agents.level', { level: 1 }))
    expect(within(card(ECHO)!).queryByText(tr('agents.bonusNone'))).toBeNull()

    const levelCost = engine.agentInfo(ECHO)!.levelCost!.toNumber()
    const bytes1 = engine.state.run.bytes.toNumber()
    expect(level(ECHO)).toBeEnabled()
    fireEvent.click(level(ECHO))
    await flush(engine)
    expect(engine.state.run.agents[ECHO]).toEqual({ count: 1, level: 2 })
    expect(engine.state.run.bytes.toNumber()).toBe(bytes1 - levelCost)
    expect(within(card(ECHO)!).getByTestId('level')).toHaveTextContent(tr('agents.level', { level: 2 }))
    expect(within(card(ECHO)!).getByRole('progressbar')).toBeInTheDocument()
  })

  it('segunda contratação sobe a quantidade sem mudar o nível', async () => {
    const engine = makeEngine({ stage: 'garage_company', bytes: 50_000, bytesEarned: 50_000 })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    fireEvent.click(hire(ECHO))
    await flush(engine)
    fireEvent.click(hire(ECHO))
    await flush(engine)
    expect(engine.state.run.agents[ECHO]).toEqual({ count: 2, level: 1 })
    expect(within(card(ECHO)!).getByTestId('count')).toHaveTextContent('2')
  })

  it('Evoluir e Contratar ficam desabilitados sem saldo', () => {
    const engine = makeEngine({ stage: 'garage_company', bytes: 0, bytesEarned: 5_000, agents: { [ECHO]: { count: 1, level: 1 } } })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    expect(level(ECHO)).toBeDisabled()
    expect(hire(ECHO)).toBeDisabled()
  })

  it('exibe o bônus de cada tipo de efeito do catálogo', () => {
    const agents = Object.fromEntries(CATALOG.agents.map((a) => [a.id, { count: 1, level: 1 }]))
    const engine = makeEngine({ stage: 'mega_corporation', bytes: 1e30, bytesEarned: 1e30, agents })
    renderWithEngine(engine, () => <AgentsPanel engine={engine} />)
    const kinds = new Set<string>()
    for (const def of CATALOG.agents) {
      const info = engine.agentInfo(def.id)!
      if (info.status !== 'unlocked') continue
      const bonus = within(card(def.id)!).getByTestId('bonus')
      expect(info.bonus.length).toBeGreaterThan(0)
      for (const e of info.bonus) {
        kinds.add(e.kind)
        const value = e.kind === 'clickFlat' ? formatBytes(e.value, 'pt-BR') : formatCount(e.value, 'pt-BR')
        expect(within(bonus).getAllByText(tr(`agents.effect.${e.kind}`, { value })).length).toBeGreaterThan(0)
      }
    }
    expect(kinds.size).toBeGreaterThan(1)
  })
})
