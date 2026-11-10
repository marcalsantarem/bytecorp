import { describe, expect, it } from 'vitest'
import { DICTIONARIES, detectLocale, translate } from './index'
import { ptBR } from './pt-BR'

describe('i18n', () => {
  it('todos os idiomas têm exatamente as chaves do dicionário de referência', () => {
    const reference = Object.keys(ptBR).sort()
    for (const dict of Object.values(DICTIONARIES)) {
      expect(Object.keys(dict).sort()).toEqual(reference)
      for (const value of Object.values(dict)) expect(value.trim()).not.toBe('')
    }
  })

  it('interpola parâmetros e preserva marcadores ausentes', () => {
    expect(translate('pt-BR', 'click.perClick', { value: '1 B' })).toBe('+1 B por clique')
    expect(translate('en', 'click.perClick')).toBe('+{value} per click')
  })

  it('detecta o idioma do navegador com fallback para pt-BR', () => {
    expect(detectLocale(['en-US'])).toBe('en')
    expect(detectLocale(['pt-PT', 'en'])).toBe('pt-BR')
    expect(detectLocale(['fr-FR'])).toBe('pt-BR')
  })
})
