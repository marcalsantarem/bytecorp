// Posicionamento do balão do tutorial (função pura, sem DOM): escolhe a faixa vertical livre mais
// próxima da âncora dentro da área de conteúdo, sem cobrir a âncora nem os obstáculos (o botão de clique).

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

export interface PlacementInput {
  anchor: Box
  // Obstáculos que o balão não deve cobrir além da âncora.
  avoid: Box[]
  // Altura medida do balão; a largura é calculada aqui.
  h: number
  vw: number
  // Faixa vertical permitida (área de conteúdo, entre cabeçalho e rodapé).
  areaTop: number
  areaBottom: number
}

export interface Placement {
  left: number
  top: number
  width: number
  // Seta: 'up' com o balão abaixo da âncora, 'down' acima; null quando o balão não encosta nela.
  arrow: { side: 'up' | 'down'; left: number } | null
  // false: nenhuma faixa livre comporta o balão; ele fica na maior faixa e pode cobrir algo.
  fits: boolean
}

export const MARGIN = 8
export const GAP = 10
export const MAX_WIDTH = 320

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

export function placeHint({ anchor, avoid, h, vw, areaTop, areaBottom }: PlacementInput): Placement {
  const width = Math.min(MAX_WIDTH, vw - 2 * MARGIN)
  const center = (anchor.left + anchor.right) / 2
  const left = clamp(center - width / 2, MARGIN, vw - width - MARGIN)
  const lo = areaTop + MARGIN
  const hi = areaBottom - MARGIN

  // Obstáculos que cruzam a faixa horizontal do balão, com folga vertical.
  const blocks = [anchor, ...avoid]
    .filter((b) => b.right > left && b.left < left + width)
    .map((b) => ({ top: b.top - GAP, bottom: b.bottom + GAP }))
    .sort((a, b) => a.top - b.top)

  // Faixas livres entre os obstáculos, dentro de [lo, hi].
  const free: { start: number; end: number }[] = []
  let cursor = lo
  for (const b of blocks) {
    if (b.top > cursor) free.push({ start: cursor, end: Math.min(b.top, hi) })
    cursor = Math.max(cursor, b.bottom)
  }
  if (cursor < hi) free.push({ start: cursor, end: hi })
  const usable = free.filter((f) => f.end > f.start)

  // Em cada faixa que comporta o balão, a posição mais próxima da âncora (logo abaixo ou logo acima).
  const anchorMid = (anchor.top + anchor.bottom) / 2
  let best: { top: number; dist: number } | null = null
  for (const f of usable) {
    if (f.end - f.start < h) continue
    const wanted = f.start >= anchorMid ? anchor.bottom + GAP : anchor.top - GAP - h
    const top = clamp(wanted, f.start, f.end - h)
    const dist = Math.abs(top + h / 2 - anchorMid)
    if (!best || dist < best.dist) best = { top, dist }
  }

  let top: number
  const fits = best !== null
  if (best) top = best.top
  else {
    // Nada comporta: a maior faixa livre, começando nela e sem sair da área.
    const biggest = usable.reduce<{ start: number; end: number } | null>((a, f) => (!a || f.end - f.start > a.end - a.start ? f : a), null)
    top = clamp(biggest ? biggest.start : lo, lo, hi - h)
  }

  const arrowLeft = clamp(center - left, 16, width - 16)
  let arrow: Placement['arrow'] = null
  if (Math.abs(top - (anchor.bottom + GAP)) <= 1) arrow = { side: 'up', left: arrowLeft }
  else if (Math.abs(top + h - (anchor.top - GAP)) <= 1) arrow = { side: 'down', left: arrowLeft }

  return { left, top, width, arrow, fits }
}

// Dois retângulos se sobrepõem (área positiva).
export function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}
