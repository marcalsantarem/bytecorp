// Gera o SVG do ícone (>_ verde sobre preto). `scale` controla o tamanho do símbolo.
export function iconSvg({ scale, rounded }) {
  const bg = rounded
    ? '<rect width="512" height="512" rx="112" fill="#000"/>'
    : '<rect width="512" height="512" fill="#000"/>'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="glow" filterUnits="userSpaceOnUse" x="-12" y="-12" width="48" height="48">
      <feGaussianBlur stdDeviation="0.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${bg}
  <g transform="translate(256 256) scale(${scale}) translate(-12 -12)" fill="none" stroke="#00ff41" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <polyline points="4 17 10 11 4 5"/>
    <line x1="12" y1="19" x2="20" y2="19"/>
  </g>
</svg>
`
}
