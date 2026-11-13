import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface Icon { src: string; sizes: string; type: string; purpose: string }
const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as Record<string, unknown> & { icons: Icon[] }

function pngSize(path: string): string {
  const buf = readFileSync(path)
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`
}

describe('manifesto PWA', () => {
  it('tem os campos obrigatórios', () => {
    expect(manifest.name).toBe('Byte Corp Idle')
    expect(manifest.short_name).toBe('ByteCorp Idle')
    expect(manifest.start_url).toBe('/')
    expect(manifest.scope).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#050811')
    expect(manifest.background_color).toBe('#050811')
    expect(manifest.lang).toBe('pt-BR')
  })

  it('declara ícones any e maskable que existem com o tamanho declarado', () => {
    expect(manifest.icons.map((i) => i.purpose).sort()).toEqual(['any', 'any', 'maskable'])
    for (const icon of manifest.icons) {
      const path = `public${icon.src}`
      expect(existsSync(path), path).toBe(true)
      expect(pngSize(path), path).toBe(icon.sizes)
    }
  })

  it('tem apple-touch-icon 180x180 e favicons', () => {
    expect(pngSize('public/icons/apple-touch-icon.png')).toBe('180x180')
    expect(pngSize('public/icons/favicon-32.png')).toBe('32x32')
    expect(existsSync('public/icons/icon.svg')).toBe(true)
  })
})
