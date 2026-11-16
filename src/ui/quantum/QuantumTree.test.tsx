import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CATALOG } from '../../core/catalog'
import { D } from '../../core/decimal'
import { makeEngine, renderWithEngine, tr } from '../testUtils'
import { QuantumTree } from './QuantumTree'

const open = (engine = makeEngine(), onClose = () => {}) => renderWithEngine(engine, () => <QuantumTree engine={engine} onClose={onClose} />)

describe('Árvore Quantum', () => {
  it('renderiza todos os nós do catálogo e o saldo de cores', () => {
    const engine = makeEngine()
    engine.state.meta.quantumCores = D(7)
    open(engine)
    for (const n of CATALOG.quantumNodes) expect(screen.getByTestId(`quantum-node-${n.id}`)).toBeInTheDocument()
    expect(screen.getByTestId('quantum-balance').textContent).toContain('7')
  })

  it('mostra raízes disponíveis e os demais bloqueados', () => {
    open()
    expect(screen.getByTestId('quantum-node-alpha_core')).toHaveAttribute('data-status', 'available')
    expect(screen.getByTestId('quantum-node-alpha_overclock')).toHaveAttribute('data-status', 'locked')
  })

  it('mostra nó em evolução, nó no máximo e linha acesa', () => {
    const engine = makeEngine()
    engine.state.meta.quantumNodes = { alpha_core: 1, alpha_singularity: 2 }
    open(engine)
    expect(screen.getByTestId('quantum-node-alpha_core')).toHaveAttribute('data-status', 'partial')
    expect(screen.getByTestId('quantum-node-alpha_singularity')).toHaveAttribute('data-status', 'maxed')
    expect(screen.getByTestId('quantum-line-alpha_core-alpha_overclock')).toHaveAttribute('data-lit', 'true')
    expect(screen.getByTestId('quantum-line-alpha_overclock-alpha_parallel')).toHaveAttribute('data-lit', 'false')
  })

  it('seleciona um nó e guarda a seleção', () => {
    open()
    const node = screen.getByTestId('quantum-node-beta_input')
    expect(node).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(node)
    expect(node).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('quantum-details').textContent).toContain(tr('quantum.beta_input.name'))
  })

  it('zoom por botões respeita os limites', () => {
    open()
    const zoom = () => Number(screen.getByTestId('quantum-world').getAttribute('data-zoom'))
    const before = zoom()
    fireEvent.click(screen.getByTestId('quantum-zoom-in'))
    expect(zoom()).toBeGreaterThan(before)
    for (let i = 0; i < 20; i++) fireEvent.click(screen.getByTestId('quantum-zoom-out'))
    expect(zoom()).toBeCloseTo(0.3)
    expect(screen.getByTestId('quantum-zoom-out')).toBeDisabled()
  })

  it('fecha pelo botão e por Esc', () => {
    const onClose = vi.fn()
    open(makeEngine(), onClose)
    fireEvent.click(screen.getByLabelText(tr('quantum.close')))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
