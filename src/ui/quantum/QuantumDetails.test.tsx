import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { D } from '../../core/decimal'
import { flush, makeEngine, renderWithEngine, tr } from '../testUtils'
import { QuantumTree } from './QuantumTree'

const open = (engine = makeEngine()) => renderWithEngine(engine, () => <QuantumTree engine={engine} onClose={() => {}} />)
const select = (id: string) => fireEvent.click(screen.getByTestId(`quantum-node-${id}`))

describe('Painel do nó Quantum', () => {
  it('nó raiz disponível: nível, efeito do próximo nível e custo', () => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(5)
    open(engine)
    select('alpha_core')
    expect(screen.getByTestId('quantum-details-level').textContent).toBe('0/∞')
    expect(screen.getByTestId('quantum-details-current').textContent).toBe(tr('quantum.details.none'))
    expect(screen.getByTestId('quantum-details-next').textContent).toBe(tr('agents.effect.globalProductionPercent', { value: '10' }))
    expect(screen.getByTestId('quantum-details-cost').textContent).toBe('1')
    expect(screen.getByTestId('quantum-buy')).toBeEnabled()
    expect(screen.queryByTestId('quantum-buy-reason')).toBeNull()
  })

  it('compra chama o engine, atualiza saldo, nível e dá destaque ao nó', async () => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(5)
    open(engine)
    select('alpha_core')
    fireEvent.click(screen.getByTestId('quantum-buy'))
    await flush(engine)
    expect(engine.state.meta.quantumNodes.alpha_core).toBe(1)
    expect(screen.getByTestId('quantum-balance').textContent).toContain('4')
    expect(screen.getByTestId('quantum-details-level').textContent).toBe('1/∞')
    expect(screen.getByTestId('quantum-details-current').textContent).toBe(tr('agents.effect.globalProductionPercent', { value: '10' }))
    expect(screen.getByTestId('quantum-details-next').textContent).toBe(tr('agents.effect.globalProductionPercent', { value: '20' }))
    expect(screen.getByTestId('quantum-flash-alpha_core')).toBeInTheDocument()
    expect(screen.getByTestId('quantum-node-alpha_core')).toHaveAttribute('data-status', 'partial')
  })

  it('nó bloqueado mostra o motivo e os pré-requisitos pendentes', () => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(50)
    open(engine)
    select('alpha_overclock')
    expect(screen.getByTestId('quantum-buy')).toBeDisabled()
    expect(screen.getByTestId('quantum-buy-reason').textContent).toBe(tr('quantum.reason.locked'))
    expect(screen.getByTestId('quantum-prereq-alpha_core')).toHaveAttribute('data-met', 'false')
  })

  it('pré-requisito cumprido e saldo insuficiente com motivo', () => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(0)
    engine.state.meta.quantumNodes = { alpha_core: 1 }
    open(engine)
    select('alpha_overclock')
    expect(screen.getByTestId('quantum-prereq-alpha_core')).toHaveAttribute('data-met', 'true')
    expect(screen.getByTestId('quantum-buy')).toBeDisabled()
    expect(screen.getByTestId('quantum-buy-reason').textContent).toBe(tr('quantum.reason.insufficient', { missing: '2' }))
  })

  it('nó no máximo: sem próximo nível nem custo, compra desabilitada', () => {
    const engine = makeEngine()
    engine.state.meta.quantumNodes = { alpha_core: 1, alpha_overclock: 1, alpha_parallel: 1, alpha_singularity: 2 }
    open(engine)
    select('alpha_singularity')
    expect(screen.getByTestId('quantum-buy')).toBeDisabled()
    expect(screen.getByTestId('quantum-buy-reason').textContent).toBe(tr('quantum.reason.maxed'))
    expect(screen.queryByTestId('quantum-details-next')).toBeNull()
    expect(screen.queryByTestId('quantum-details-cost')).toBeNull()
  })

  it('raiz sem pré-requisitos mostra o aviso', () => {
    open()
    select('beta_input')
    expect(screen.getByTestId('quantum-details').textContent).toContain(tr('quantum.details.noPrereqs'))
  })
})

describe('Reset da árvore Quantum', () => {
  const withSpent = (cores: number) => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(cores)
    engine.state.meta.quantumNodes = { alpha_core: 2 } // gastou 1 + 1 = 2 (floor(1,8) = 1)
    return engine
  }

  it('botão desabilitado sem níveis comprados', () => {
    open()
    expect(screen.getByTestId('quantum-reset-open')).toBeDisabled()
  })

  it('dois passos: resumo, confirmação final, reset sem Reboot', async () => {
    const engine = withSpent(2)
    engine.state.run.bytes = D(777)
    open(engine)
    fireEvent.click(screen.getByTestId('quantum-reset-open'))
    expect(screen.getByTestId('quantum-reset-refund').textContent).toBe('+2')
    expect(screen.getByTestId('quantum-reset-cost').textContent).toBe('-3')
    expect(screen.getByTestId('quantum-reset-final').textContent).toBe('1')
    expect(screen.queryByTestId('quantum-reset-confirm')).toBeNull()
    fireEvent.click(screen.getByTestId('quantum-reset-next'))
    expect(engine.state.meta.treeResets).toBe(0)
    fireEvent.click(screen.getByTestId('quantum-reset-confirm'))
    await flush(engine)
    expect(engine.state.meta.treeResets).toBe(1)
    expect(engine.state.meta.quantumNodes).toEqual({})
    expect(engine.state.meta.quantumCores.toNumber()).toBe(1)
    expect(engine.state.run.bytes.toNumber()).toBe(777)
    expect(screen.queryByTestId('quantum-reset-dialog')).toBeNull()
    expect(screen.getByTestId('quantum-balance').textContent).toContain('1')
  })

  it('recusa clara sem saldo e não altera o estado', () => {
    const engine = withSpent(0) // 0 + 2 devolvidos < 3
    open(engine)
    fireEvent.click(screen.getByTestId('quantum-reset-open'))
    expect(screen.getByTestId('quantum-reset-refused').textContent).toBe(tr('quantum.reset.refused', { missing: '1' }))
    expect(screen.queryByTestId('quantum-reset-next')).toBeNull()
    expect(screen.queryByTestId('quantum-reset-confirm')).toBeNull()
    expect(engine.state.meta.quantumNodes).toEqual({ alpha_core: 2 })
  })

  it('Esc e Cancelar fecham só a janela de reset', () => {
    const onClose = vi.fn()
    const engine = withSpent(5)
    renderWithEngine(engine, () => <QuantumTree engine={engine} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('quantum-reset-open'))
    fireEvent.keyDown(screen.getByTestId('quantum-reset-dialog'), { key: 'Escape' })
    expect(screen.queryByTestId('quantum-reset-dialog')).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('quantum-reset-open'))
    fireEvent.click(screen.getByText(tr('reboot.cancel')))
    expect(screen.queryByTestId('quantum-reset-dialog')).toBeNull()
    expect(engine.state.meta.treeResets).toBe(0)
  })
})
