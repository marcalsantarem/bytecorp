import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATALOG } from '../../core/catalog'
import { formatBytes, formatCount } from '../../core/format'
import { flush, makeEngine, renderWithEngine, tr } from '../testUtils'
import { ShopPanel } from './ShopPanel'

const card = (id: string) => document.querySelector<HTMLElement>(`[data-id="${id}"]`)
const tab = (name: string) => screen.getByRole('tab', { name })
const buyButton = (el: HTMLElement) => within(el).getByRole('button', { name: /^Comprar/ })
const nameOfEquipment = (id: string) => {
  const key = CATALOG.equipment.find((e) => e.id === id)!.nameKey
  return tr(key as Parameters<typeof tr>[0])
}
const nameOfUpgrade = (id: string) => {
  const key = CATALOG.upgrades.find((u) => u.id === id)!.nameKey
  return tr(key as Parameters<typeof tr>[0])
}

describe('loja de equipamentos', () => {
  it('não mostra item oculto', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    expect(card('home_router')).not.toBeNull()
    expect(card('wifi_mesh')).toBeNull()
    expect(screen.queryByText(nameOfEquipment('wifi_mesh'))).not.toBeInTheDocument()
  })

  it('item revelado mostra o requisito e não tem botão de compra', () => {
    const engine = makeEngine({ bytesEarned: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const el = card('wifi_mesh')!
    expect(el).toHaveAttribute('data-status', 'revealed')
    expect(within(el).getByText(nameOfEquipment('wifi_mesh'))).toBeInTheDocument()
    expect(within(el).getByText(/Desbloqueio:/)).toBeInTheDocument()
    expect(within(el).queryByRole('button')).toBeNull()
  })

  it('item desbloqueado mostra custo e produção', () => {
    const engine = makeEngine({ bytes: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const el = card('home_router')!
    const info = engine.equipmentInfo('home_router')!
    expect(el).toHaveAttribute('data-status', 'unlocked')
    expect(within(el).getByText(formatBytes(info.modes.x1.cost, 'pt-BR'))).toBeInTheDocument()
    expect(within(el).getByText(/B\/s$/)).toBeInTheDocument()
    expect(within(el).getByTestId('owned')).toHaveTextContent('0')
  })

  it('sem saldo o botão fica desabilitado e o custo continua visível', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const el = card('home_router')!
    expect(buyButton(el)).toBeDisabled()
    expect(within(el).getByText(formatBytes(engine.equipmentInfo('home_router')!.modes.x1.cost, 'pt-BR'))).toBeInTheDocument()
  })

  it('comprar debita, sobe a quantidade e a produção', async () => {
    const engine = makeEngine({ bytes: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const cost = engine.equipmentInfo('home_router')!.modes.x1.cost
    const bytesBefore = engine.state.run.bytes
    const productionBefore = engine.production.total
    fireEvent.click(buyButton(card('home_router')!))
    await flush(engine)
    expect(engine.state.run.equipment['home_router']).toBe(1)
    expect(engine.state.run.bytes.toNumber()).toBeCloseTo(bytesBefore.sub(cost).toNumber(), 9)
    expect(engine.production.total.gt(productionBefore)).toBe(true)
    expect(within(card('home_router')!).getByTestId('owned')).toHaveTextContent('1')
  })

  it('seletor x1/x10/MAX compra a quantidade certa', async () => {
    const engine = makeEngine({ bytes: 1000 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const el = () => card('home_router')!
    const modeButton = (name: string) => within(el()).getByRole('button', { name })

    fireEvent.click(modeButton('x10'))
    expect(modeButton('x10')).toHaveAttribute('aria-pressed', 'true')
    expect(buyButton(el())).toHaveTextContent('Comprar 10')
    fireEvent.click(buyButton(el()))
    await flush(engine)
    expect(within(el()).getByTestId('owned')).toHaveTextContent(formatCount(10, 'pt-BR'))

    const expectedMax = engine.equipmentInfo('home_router')!.modes.max.quantity
    expect(expectedMax).toBeGreaterThan(1)
    fireEvent.click(modeButton('MAX'))
    expect(buyButton(el())).toHaveTextContent(`Comprar ${formatCount(expectedMax, 'pt-BR')}`)
    fireEvent.click(buyButton(el()))
    await flush(engine)
    expect(engine.state.run.equipment['home_router']).toBe(10 + expectedMax)

    const before = engine.state.run.equipment['home_router']!
    engine.state.run.bytes = engine.state.run.bytes.add(1e9)
    engine.invalidate() // muda o estado fora dos métodos do engine: avisa a interface como o jogo faria
    await flush(engine)
    fireEvent.click(modeButton('x1'))
    fireEvent.click(buyButton(el()))
    await flush(engine)
    expect(engine.state.run.equipment['home_router']).toBe(before + 1)
  })

  it('x10 sem saldo para dez fica desabilitado', () => {
    const engine = makeEngine({ bytes: 20 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const el = card('home_router')!
    fireEvent.click(within(el).getByRole('button', { name: 'x10' }))
    expect(buyButton(el)).toBeDisabled()
    expect(buyButton(el)).toHaveTextContent('Comprar 10')
  })

  it('o seletor de um cartão não afeta os outros', () => {
    const engine = makeEngine({ bytes: 1000, bytesEarned: 1000 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const router = card('home_router')!
    fireEvent.click(within(router).getByRole('button', { name: 'x10' }))
    fireEvent.click(tab(tr('category.processing')))
    const server = card('home_server')!
    expect(within(server).getByRole('button', { name: 'x1' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('trocar de categoria troca a lista', () => {
    const engine = makeEngine({ bytes: 100, bytesEarned: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    expect(card('home_router')).not.toBeNull()
    expect(card('home_server')).toBeNull()
    fireEvent.click(tab(tr('category.processing')))
    expect(card('home_server')).not.toBeNull()
    expect(card('home_router')).toBeNull()
  })

  it('categoria sem itens visíveis mostra a mensagem de vazio', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    fireEvent.click(tab(tr('category.cooling')))
    expect(screen.getByText(tr('shop.empty'))).toBeInTheDocument()
  })
})

describe('abas de categoria', () => {
  it('usa role=tab com aria-selected e uma só aba na ordem de tabulação', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const list = screen.getByRole('tablist', { name: tr('shop.category') })
    const tabs = within(list).getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    expect(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1)
    expect(tab(tr('category.networking'))).toHaveAttribute('aria-selected', 'true')
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1)
  })

  it('navega pelo teclado com setas, Home e End e leva o foco', () => {
    const engine = makeEngine()
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    const press = (key: string) => fireEvent.keyDown(document.activeElement ?? document.body, { key })
    tab(tr('category.networking')).focus()
    press('ArrowRight')
    expect(tab(tr('category.processing'))).toHaveAttribute('aria-selected', 'true')
    expect(tab(tr('category.processing'))).toHaveFocus()
    press('ArrowLeft')
    press('ArrowLeft')
    expect(tab(tr('category.infrastructure'))).toHaveAttribute('aria-selected', 'true')
    press('ArrowRight')
    expect(tab(tr('category.networking'))).toHaveAttribute('aria-selected', 'true')
    press('End')
    expect(tab(tr('category.infrastructure'))).toHaveFocus()
    press('Home')
    expect(tab(tr('category.networking'))).toHaveFocus()
    press('a')
    expect(tab(tr('category.networking'))).toHaveAttribute('aria-selected', 'true')
  })

  it('ponto de novo equipamento só aparece com equipamento novo e comprável', async () => {
    const dot = (name: string) => within(tab(name)).queryByTestId('category-available')

    const poor = makeEngine({ bytesEarned: 60 })
    const view = renderWithEngine(poor, () => <ShopPanel engine={poor} />)
    expect(dot(tr('category.networking'))).toBeNull()
    expect(dot(tr('category.processing'))).toBeNull()
    view.unmount()

    const engine = makeEngine({ bytes: 200, bytesEarned: 60 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    expect(dot(tr('category.networking'))).not.toBeNull()
    expect(dot(tr('category.processing'))).not.toBeNull()
    expect(dot(tr('category.cooling'))).toBeNull()
    expect(within(tab(tr('category.networking'))).getByRole('img', { name: tr('shop.category.available') })).toBeInTheDocument()

    fireEvent.click(buyButton(card('home_router')!))
    await flush(engine)
    expect(dot(tr('category.networking'))).toBeNull()
    expect(dot(tr('category.processing'))).not.toBeNull()
  })

  it('o ponto aparece em categorias que não estão selecionadas', () => {
    const engine = makeEngine({ bytes: 200, bytesEarned: 60 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    fireEvent.click(tab(tr('category.processing')))
    expect(within(tab(tr('category.networking'))).queryByTestId('category-available')).not.toBeNull()
  })
})

describe('visões da loja', () => {
  it('alterna entre Equipamentos e Melhorias', () => {
    const engine = makeEngine({ bytes: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    expect(tab(tr('shop.view.equipment'))).toHaveAttribute('aria-selected', 'true')
    expect(card('home_router')).not.toBeNull()
    expect(card('macro_script')).toBeNull()
    expect(screen.getByRole('tablist', { name: tr('shop.category') })).toBeInTheDocument()

    fireEvent.click(tab(tr('shop.view.upgrades')))
    expect(tab(tr('shop.view.upgrades'))).toHaveAttribute('aria-selected', 'true')
    expect(card('macro_script')).not.toBeNull()
    expect(card('home_router')).toBeNull()
    expect(screen.queryByRole('tablist', { name: tr('shop.category') })).toBeNull()

    fireEvent.click(tab(tr('shop.view.equipment')))
    expect(card('home_router')).not.toBeNull()
  })

  it('mantém a categoria escolhida ao voltar de Melhorias', () => {
    const engine = makeEngine({ bytes: 100, bytesEarned: 100 })
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    fireEvent.click(tab(tr('category.processing')))
    fireEvent.click(tab(tr('shop.view.upgrades')))
    fireEvent.click(tab(tr('shop.view.equipment')))
    expect(card('home_server')).not.toBeNull()
  })
})

describe('melhorias comuns', () => {
  const open = (engine: ReturnType<typeof makeEngine>) => {
    renderWithEngine(engine, () => <ShopPanel engine={engine} />)
    fireEvent.click(tab(tr('shop.view.upgrades')))
  }

  it('bloqueada mostra o requisito e o botão desabilitado', () => {
    const engine = makeEngine()
    open(engine)
    const el = card('macro_script')!
    expect(el).toHaveAttribute('data-status', 'locked')
    expect(within(el).getByTestId('requirement')).toHaveTextContent('Desbloqueio:')
    const button = within(el).getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(tr('upgrades.locked'))
    expect(within(el).getByText(nameOfUpgrade('macro_script'))).toBeInTheDocument()
  })

  it('disponível sem saldo mostra o botão desabilitado e o custo', () => {
    const engine = makeEngine({ bytes: 10, bytesEarned: 100 })
    open(engine)
    const el = card('macro_script')!
    expect(el).toHaveAttribute('data-status', 'available')
    expect(within(el).queryByTestId('requirement')).toBeNull()
    expect(within(el).getByRole('button')).toBeDisabled()
    expect(within(el).getByText(formatBytes(50, 'pt-BR'))).toBeInTheDocument()
  })

  it('disponível compra, vira Comprada, sem selo, e não compra de novo', async () => {
    const engine = makeEngine({ bytes: 120, bytesEarned: 120 })
    open(engine)
    const button = () => within(card('macro_script')!).getByRole('button')
    expect(button()).toBeEnabled()
    expect(button()).toHaveTextContent(tr('upgrades.buy'))
    fireEvent.click(button())
    await flush(engine)
    expect(engine.state.run.upgrades).toEqual(['macro_script'])
    expect(engine.state.run.bytes.toNumber()).toBe(70)
    expect(card('macro_script')).toHaveAttribute('data-status', 'purchased')
    expect(button()).toHaveTextContent(tr('upgrades.purchased'))
    expect(button()).toBeDisabled()
    expect(within(card('macro_script')!).queryByTestId('requirement')).toBeNull()
    fireEvent.click(button())
    await flush(engine)
    expect(engine.state.run.upgrades).toEqual(['macro_script'])
    expect(engine.state.run.bytes.toNumber()).toBe(70)
  })

  it('mostra o benefício de cada tipo de efeito', () => {
    const engine = makeEngine({ bytes: 1e30, bytesEarned: 1e30 })
    open(engine)
    const kinds = new Set(CATALOG.upgrades.map((u) => u.effect.kind))
    expect(kinds.size).toBeGreaterThan(1)
    for (const kind of kinds) {
      const def = CATALOG.upgrades.find((u) => u.effect.kind === kind)!
      const value = kind === 'clickFlat' ? formatBytes(def.effect.value, 'pt-BR') : formatCount(def.effect.value, 'pt-BR')
      expect(within(card(def.id)!).getByText(tr(`agents.effect.${kind}`, { value }))).toBeInTheDocument()
    }
  })

  it('lista em ordem de custo crescente', () => {
    const engine = makeEngine({ bytes: 1e30, bytesEarned: 1e30 })
    open(engine)
    const ids = Array.from(document.querySelectorAll('li[data-id]')).map((e) => e.getAttribute('data-id')!)
    const costs = ids.map((id) => CATALOG.upgrades.find((u) => u.id === id)!.cost)
    expect(ids.length).toBe(CATALOG.upgrades.length)
    expect(costs).toEqual([...costs].sort((a, b) => a - b))
  })
})
