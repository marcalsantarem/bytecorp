import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RebootEffect } from './RebootEffect'
import { REBOOT_DURATION_MS } from './rebootCanvas'

describe('RebootEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom não implementa Canvas 2D: contexto nulo, o efeito só controla o tempo.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('não renderiza quando inativo', () => {
    render(<RebootEffect active={false} onDone={() => {}} />)
    expect(screen.queryByTestId('reboot-effect')).toBeNull()
  })

  it('termina por tempo, uma só vez', () => {
    const onDone = vi.fn()
    render(<RebootEffect active onDone={onDone} />)
    act(() => vi.advanceTimersByTime(REBOOT_DURATION_MS - 10))
    expect(onDone).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(20))
    act(() => vi.advanceTimersByTime(5000))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('pula por botão, clique e Esc', () => {
    for (const skip of [
      () => fireEvent.click(screen.getByText('Pular')),
      () => fireEvent.click(screen.getByTestId('reboot-effect')),
      () => fireEvent.keyDown(window, { key: 'Escape' }),
    ]) {
      const onDone = vi.fn()
      render(<RebootEffect active onDone={onDone} skipLabel="Pular" />)
      act(() => skip())
      act(() => vi.advanceTimersByTime(REBOOT_DURATION_MS + 100))
      expect(onDone).toHaveBeenCalledTimes(1)
      cleanup()
    }
  })

  it('o botão de pular tem alvo de toque mínimo de 44 px', () => {
    render(<RebootEffect active onDone={vi.fn()} skipLabel="Pular" />)
    const btn = screen.getByText('Pular')
    expect(btn.className).toContain('min-h-11')
    expect(btn.className).toContain('min-w-11')
  })

  it('desmontar cancela sem chamar onDone', () => {
    const onDone = vi.fn()
    const { unmount } = render(<RebootEffect active onDone={onDone} />)
    unmount()
    act(() => vi.advanceTimersByTime(REBOOT_DURATION_MS + 100))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDone).not.toHaveBeenCalled()
  })

  it('com movimento reduzido usa a versão curta', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const onDone = vi.fn()
    render(<RebootEffect active onDone={onDone} />)
    act(() => vi.advanceTimersByTime(700))
    expect(onDone).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
