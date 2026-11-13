// Gera os ícones do PWA em public/icons/ (os arquivos ficam versionados).
// Uso: node scripts/generate-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { iconSvg } from './icon-svg.mjs'

const out = new URL('../public/icons/', import.meta.url)
mkdirSync(out, { recursive: true })

const any = iconSvg({ scale: 20, rounded: true })
const maskable = iconSvg({ scale: 15, rounded: false })
const favicon = iconSvg({ scale: 21, rounded: true })

writeFileSync(new URL('icon.svg', out), any)

function png(svg, size, name) {
  const data = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(new URL(name, out), data)
}

png(any, 192, 'icon-192.png')
png(any, 512, 'icon-512.png')
png(maskable, 512, 'icon-maskable-512.png')
// iOS aplica os próprios cantos: precisa de quadrado cheio.
png(iconSvg({ scale: 17, rounded: false }), 180, 'apple-touch-icon.png')
png(favicon, 32, 'favicon-32.png')
