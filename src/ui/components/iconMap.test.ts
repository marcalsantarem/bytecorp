import { describe, expect, it } from 'vitest'
import { CATALOG } from '../../core/catalog'
import { ICONS } from './iconMap'

describe('mapa de ícones', () => {
  it('cobre o ícone de todo equipamento do catálogo', () => {
    const faltando = CATALOG.equipment.filter((e) => !(e.icon in ICONS)).map((e) => `${e.id}:${e.icon}`)
    expect(faltando).toEqual([])
  })

  it('cobre o ícone de todo agente do catálogo', () => {
    const faltando = CATALOG.agents.filter((a) => !(a.icon in ICONS)).map((a) => `${a.id}:${a.icon}`)
    expect(faltando).toEqual([])
  })

  it('cobre o ícone de toda melhoria do catálogo', () => {
    const faltando = CATALOG.upgrades.filter((u) => !(u.icon in ICONS)).map((u) => `${u.id}:${u.icon}`)
    expect(faltando).toEqual([])
  })
})
