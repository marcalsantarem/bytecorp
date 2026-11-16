import { act, fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeEngine, renderWithEngine, tr } from '../testUtils'
import { AcceleratorInventoryControl } from './AcceleratorInventory'

const item = (id: string, multiplier: number, remainingMs: number) => ({ id, multiplier, remainingMs })

function setup(opts: { inventory?: ReturnType<typeof item>[]; active?: ReturnType<typeof item> | null } = {}) {
  const engine = makeEngine()
  const acc = engine.state.meta.accelerators
  acc.inventory = opts.inventory ?? []
  acc.active = opts.active ?? null
  renderWithEngine(engine, () => <AcceleratorInventoryControl engine={engine} buttonClass="b" />)
  return engine
}

const open = () => fireEvent.click(screen.getByTestId('accelerator-button'))

describe('AcceleratorInventoryControl', () => {
  it('botão desabilitado com inventário vazio', () => {
    setup()
    expect((screen.getByTestId('accelerator-button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('lista os itens ordenados por multiplicador e tempo, com contador', () => {
    setup({ inventory: [item('a', 2, 900_000), item('b', 5, 900_000), item('c', 2, 1_800_000)] })
    expect(screen.getByTestId('accelerator-button').textContent).toContain('3')
    open()
    const rows = screen.getAllByTestId('accelerator-item').map((r) => r.textContent)
    expect(rows[0]).toContain('5x')
    expect(rows[1]).toContain('30:00')
    expect(rows[2]).toContain('15:00')
  })

  it('ativa direto quando não há ativo', () => {
    const engine = setup({ inventory: [item('a', 2, 900_000)] })
    open()
    fireEvent.click(screen.getByRole('button', { name: tr('accel.activate') }))
    expect(engine.state.meta.accelerators.active?.id).toBe('a')
    expect(engine.state.meta.accelerators.inventory).toHaveLength(0)
    expect(screen.queryByText(tr('accel.replace.title'))).toBeNull()
    expect(screen.getByText(tr('accel.inventory.empty'))).toBeTruthy()
  })

  it('com ativo, pede confirmação e perde o atual', () => {
    const engine = setup({ active: item('x', 2, 600_000), inventory: [item('a', 5, 900_000)] })
    open()
    fireEvent.click(screen.getByRole('button', { name: tr('accel.activate') }))
    const dlg = screen.getByRole('dialog', { name: tr('accel.replace.title') })
    expect(within(dlg).getByText('2x')).toBeTruthy()
    expect(within(dlg).getByText('5x')).toBeTruthy()
    expect(engine.state.meta.accelerators.active?.id).toBe('x')
    fireEvent.click(within(dlg).getByRole('button', { name: tr('accel.replace.discard') }))
    const acc = engine.state.meta.accelerators
    expect(acc.active?.id).toBe('a')
    expect(acc.inventory).toHaveLength(0)
  })

  it('com ativo, guarda o atual no inventário', () => {
    const engine = setup({ active: item('x', 2, 600_000), inventory: [item('a', 5, 900_000)] })
    open()
    fireEvent.click(screen.getByRole('button', { name: tr('accel.activate') }))
    fireEvent.click(screen.getByRole('button', { name: tr('accel.replace.store') }))
    const acc = engine.state.meta.accelerators
    expect(acc.active?.id).toBe('a')
    expect(acc.inventory.map((i) => i.id)).toEqual(['x'])
  })

  it('cancelar não altera nada', () => {
    const engine = setup({ active: item('x', 2, 600_000), inventory: [item('a', 5, 900_000)] })
    open()
    fireEvent.click(screen.getByRole('button', { name: tr('accel.activate') }))
    fireEvent.click(screen.getByRole('button', { name: tr('accel.replace.cancel') }))
    const acc = engine.state.meta.accelerators
    expect(acc.active?.id).toBe('x')
    expect(acc.inventory.map((i) => i.id)).toEqual(['a'])
    expect(screen.queryByRole('dialog', { name: tr('accel.replace.title') })).toBeNull()
    expect(screen.getByRole('dialog', { name: tr('accel.inventory.title') })).toBeTruthy()
  })

  it('mostra aviso ao receber acelerador, sem ativar', () => {
    const engine = setup()
    act(() => engine.events.emit('acceleratorGranted', { source: 'reboot:1', items: [item('n', 2, 900_000)] }))
    expect(screen.getByTestId('accelerator-toast').textContent).toBe(tr('accel.granted', { count: 1 }))
    expect(engine.state.meta.accelerators.active).toBeNull()
    // Aviso ancorado ao rodapé (não fixo no topo), fora do painel de estágio.
    const live = screen.getByTestId('accelerator-toast').parentElement
    expect(live?.getAttribute('role')).toBe('status')
    expect(live?.className).toContain('absolute')
    expect(live?.className).not.toContain('top-28')
  })
})
