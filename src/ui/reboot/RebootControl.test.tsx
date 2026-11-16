import { act, fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flush, makeEngine, renderWithEngine, tr } from '../testUtils'
import { RebootControl } from './RebootControl'

const ui = (engine: ReturnType<typeof makeEngine>) => () => <RebootControl engine={engine} buttonClass="b" />
const rich = () => makeEngine({ bytes: 1e20, bytesEarned: 1e20 })

beforeEach(() => {
  // jsdom não implementa canvas.
  HTMLCanvasElement.prototype.getContext = (() => null) as never
})

describe('Reboot', () => {
  it('desabilitado com dica quando a recompensa é 0', () => {
    const engine = makeEngine()
    expect(engine.rebootRewardNow).toBeLessThan(1)
    renderWithEngine(engine, ui(engine))
    const button = screen.getByTestId('reboot-button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', tr('reboot.hint'))
  })

  it('habilitado com recompensa >= 1 e mostra a estimativa', () => {
    const engine = rich()
    expect(engine.rebootRewardNow).toBeGreaterThanOrEqual(1)
    renderWithEngine(engine, ui(engine))
    expect(screen.getByTestId('reboot-button')).toBeEnabled()
    expect(screen.getByTestId('reboot-button').textContent).toContain('+')
  })

  it('abre a janela com foco, estimativa e total', () => {
    const engine = rich()
    renderWithEngine(engine, ui(engine))
    fireEvent.click(screen.getByTestId('reboot-button'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(tr('reboot.cancel')).closest('button')).toHaveFocus()
    expect(screen.getByTestId('reboot-reward')).toBeInTheDocument()
    expect(screen.getByTestId('reboot-total')).toBeInTheDocument()
  })

  it('cancelar e Esc não chamam o engine', () => {
    const engine = rich()
    const spy = vi.spyOn(engine, 'reboot')
    renderWithEngine(engine, ui(engine))
    fireEvent.click(screen.getByTestId('reboot-button'))
    fireEvent.click(screen.getByText(tr('reboot.cancel')))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByTestId('reboot-button'))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(spy).not.toHaveBeenCalled()
    expect(screen.queryByTestId('reboot-effect')).toBeNull()
  })

  it('confirmar chama o engine, soma cores, fecha e mostra o efeito até pular', async () => {
    const engine = rich()
    const expected = engine.rebootRewardNow
    const spy = vi.spyOn(engine, 'reboot')
    renderWithEngine(engine, ui(engine))
    fireEvent.click(screen.getByTestId('reboot-button'))
    fireEvent.click(screen.getByText(tr('reboot.confirm')))
    expect(spy).toHaveBeenCalledOnce()
    expect(engine.state.meta.quantumCores.toNumber()).toBe(expected)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('reboot-effect')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByText(tr('reboot.skip')))
    })
    expect(screen.queryByTestId('reboot-effect')).toBeNull()
    await flush(engine)
    expect(screen.getByTestId('reboot-button')).toBeDisabled()
  })
})
