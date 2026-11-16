import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeEngine, renderWithEngine, tr } from '../testUtils'
import { AcceleratorIndicator, formatRemaining } from './AcceleratorIndicator'

function setup(active: { multiplier: number; remainingMs: number } | null) {
  const engine = makeEngine()
  if (active) engine.state.meta.accelerators.active = { id: 'a1', ...active }
  renderWithEngine(engine, () => <AcceleratorIndicator engine={engine} />)
  return engine
}

describe('AcceleratorIndicator', () => {
  it('fica oculto sem acelerador ativo', () => {
    setup(null)
    expect(screen.queryByRole('group', { name: tr('accel.label') })).toBeNull()
  })

  it('reserva a mesma faixa com e sem acelerador ativo (sem deslocar o layout)', () => {
    const a = setup(null)
    const idle = screen.getByTestId('accelerator-area').className
    expect(idle).toContain('h-8')
    a.state.meta.accelerators.active = { id: 'a1', multiplier: 2, remainingMs: 60_000 }
    setup({ multiplier: 2, remainingMs: 60_000 })
    expect(screen.getAllByTestId('accelerator-area').every((e) => e.className === idle)).toBe(true)
  })

  it('mostra multiplicador e tempo restante', () => {
    setup({ multiplier: 5, remainingMs: 125_000 })
    expect(screen.getByText('5x')).toBeTruthy()
    expect(screen.getByTestId('accelerator-time').textContent).toBe('02:05')
  })

  it('avisa ao evento acceleratorEnding', () => {
    const engine = setup({ multiplier: 2, remainingMs: 30_000 })
    act(() => engine.events.emit('acceleratorEnding', { item: { id: 'a1', multiplier: 2, remainingMs: 30_000 }, remainingMs: 30_000 }))
    expect(screen.getAllByText(tr('accel.ending')).length).toBeGreaterThan(0)
    expect(screen.getByRole('group', { name: tr('accel.label') }).className).toContain('accel-warning')
  })

  it('mostra a mensagem ao expirar', () => {
    const engine = setup({ multiplier: 2, remainingMs: 1000 })
    act(() => {
      engine.state.meta.accelerators.active = null
      engine.events.emit('acceleratorExpired', { item: { id: 'a1', multiplier: 2, remainingMs: 0 } })
    })
    expect(screen.getByText(tr('accel.expired'))).toBeTruthy()
    expect(screen.queryByRole('group', { name: tr('accel.label') })).toBeNull()
  })

  it('formata mm:ss e h:mm:ss', () => {
    expect(formatRemaining(59_001)).toBe('01:00')
    expect(formatRemaining(3_725_000)).toBe('1:02:05')
  })
})
