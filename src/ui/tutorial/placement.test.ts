import { describe, expect, it } from 'vitest'
import { overlaps, placeHint, type Box } from './placement'

const box = (left: number, top: number, w: number, h: number): Box => ({ left, top, right: left + w, bottom: top + h })
const hintBox = (p: { left: number; top: number; width: number }, h: number) => box(p.left, p.top, p.width, h)

// Medidas do mobile 375x812 relatadas na QA do M5 (D1).
const MOBILE = { vw: 375, areaTop: 100, areaBottom: 730 }
const clickButton = box(87, 566, 200, 78)
const shopTab = box(0, 740, 125, 56)

describe('placeHint', () => {
  it('alvo em aba oculta (mobile): não cobre o botão de clique nem a aba', () => {
    const h = 110
    const p = placeHint({ anchor: shopTab, avoid: [clickButton], h, ...MOBILE })
    expect(p.fits).toBe(true)
    expect(overlaps(hintBox(p, h), clickButton)).toBe(false)
    expect(overlaps(hintBox(p, h), shopTab)).toBe(false)
    expect(p.top + h).toBeLessThanOrEqual(MOBILE.areaBottom)
  })

  it('cabe entre o botão de clique e a barra de abas: fica logo acima da barra', () => {
    const h = 60
    const p = placeHint({ anchor: shopTab, avoid: [clickButton], h, ...MOBILE })
    expect(p.top).toBeGreaterThanOrEqual(clickButton.bottom)
    expect(overlaps(hintBox(p, h), clickButton)).toBe(false)
  })

  it('o balão de 194 px do defeito não cobre o botão de clique', () => {
    const h = 194
    const p = placeHint({ anchor: shopTab, avoid: [clickButton], h, ...MOBILE })
    expect(overlaps(hintBox(p, h), clickButton)).toBe(false)
  })

  it('prefere abaixo do alvo quando cabe; acima quando falta espaço embaixo', () => {
    const h = 120
    const high = box(20, 150, 200, 40)
    const below = placeHint({ anchor: high, avoid: [], h, ...MOBILE })
    expect(below.top).toBe(high.bottom + 10)
    expect(below.arrow?.side).toBe('up')
    const low = box(20, 650, 200, 40)
    const above = placeHint({ anchor: low, avoid: [], h, ...MOBILE })
    expect(above.top + h).toBe(low.top - 10)
    expect(above.arrow?.side).toBe('down')
  })

  it('obstáculo logo abaixo do alvo: vai para o lado oposto', () => {
    const h = 120
    const target = box(87, 400, 200, 40)
    const obstacle = box(87, 450, 200, 78)
    const p = placeHint({ anchor: target, avoid: [obstacle], h, ...MOBILE })
    expect(p.top + h).toBeLessThanOrEqual(target.top)
    expect(overlaps(hintBox(p, h), obstacle)).toBe(false)
  })

  it('desktop: alvo na coluna da loja não é coberto e o botão de clique na coluna central também não', () => {
    const desk = { vw: 1280, areaTop: 60, areaBottom: 680 }
    const shopList = box(930, 120, 330, 400)
    const center = box(540, 300, 200, 78)
    const h = 130
    const p = placeHint({ anchor: shopList, avoid: [center], h, ...desk })
    expect(p.fits).toBe(true)
    expect(overlaps(hintBox(p, h), shopList)).toBe(false)
    expect(overlaps(hintBox(p, h), center)).toBe(false)
  })

  it('sem faixa livre que comporte: fits false e fica dentro da área', () => {
    const h = 400
    const target = box(0, 300, 375, 100)
    const p = placeHint({ anchor: target, avoid: [], h, ...MOBILE })
    expect(p.fits).toBe(false)
    expect(p.top).toBeGreaterThanOrEqual(MOBILE.areaTop)
    expect(p.top + h).toBeLessThanOrEqual(MOBILE.areaBottom)
  })
})
