import { describe, expect, it } from 'vitest'
import { D } from './decimal'
import { formatBytes, formatBytesPerSecond, formatCount } from './format'

describe('formatBytes', () => {
  it('formata valores abaixo de 1 kB sem zeros desnecessários', () => {
    expect(formatBytes(0, 'pt-BR')).toBe('0 B')
    expect(formatBytes(0.5, 'pt-BR')).toBe('0,5 B')
    expect(formatBytes(15, 'en')).toBe('15 B')
    expect(formatBytes(999.999, 'en')).toBe('999.99 B')
  })

  it('usa base 1000 e o separador decimal do idioma', () => {
    expect(formatBytes(1000, 'pt-BR')).toBe('1 kB')
    expect(formatBytes(1500, 'pt-BR')).toBe('1,5 kB')
    expect(formatBytes(1500, 'en')).toBe('1.5 kB')
    expect(formatBytes(1_234_567, 'en')).toBe('1.23 MB')
    expect(formatBytes(1e24, 'en')).toBe('1 YB')
  })

  it('trunca em vez de arredondar para nunca exibir mais do que o saldo', () => {
    expect(formatBytes(999_999, 'en')).toBe('999.99 kB')
    expect(formatBytes(1_999, 'en')).toBe('1.99 kB')
  })

  it('passa para notação científica depois da última unidade', () => {
    expect(formatBytes(D('1e30'), 'en')).toBe('1 QB')
    expect(formatBytes(D('1.234e33'), 'en')).toBe('1.23e33 B')
    expect(formatBytes(D('5e1000'), 'pt-BR')).toBe('5e1000 B')
  })

  it('formata produção por segundo', () => {
    expect(formatBytesPerSecond(2500, 'pt-BR')).toBe('2,5 kB/s')
  })
})

describe('formatCount', () => {
  it('agrupa milhares conforme o idioma', () => {
    expect(formatCount(1234567, 'en')).toBe('1,234,567')
    expect(formatCount(1234567, 'pt-BR')).toBe('1.234.567')
  })

  it('usa notação científica em contagens muito grandes', () => {
    expect(formatCount(D('2.5e20'), 'pt-BR')).toBe('2,5e20')
  })
})
