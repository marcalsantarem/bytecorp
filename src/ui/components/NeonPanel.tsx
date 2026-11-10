import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  glow?: 'cyan' | 'magenta'
  className?: string
}

// Painel neon com cantos chanfrados e brilho ciano ou magenta (ver .neon-* em index.css).
export function NeonPanel({ children, glow = 'cyan', className = '' }: Props) {
  return (
    <div className={`neon-glow neon-glow-${glow} ${className}`}>
      <div className="neon-edge">
        <div className="neon-body">{children}</div>
      </div>
    </div>
  )
}
