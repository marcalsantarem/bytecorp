import { TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { boot, type BootResult, type GameSession } from '../app/bootstrap'
import type { GameEngine } from '../core/engine'
import type { KeyValueStorage } from '../core/save/storage'
import { useI18n } from './i18n'
import { ClickButton } from './core/ClickButton'
import { CoreScene } from './core/CoreScene'
import { GameLayout } from './layout/GameLayout'
import { AgentsPanel, StatsPanel } from './layout/Panels'
import { ShopPanel } from './shop/ShopPanel'
import { useEngineRevision } from './useEngine'

type Phase = { kind: 'loading' } | BootResult

export function App({ storage }: { storage: KeyValueStorage }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })
  // Sessão ativa (a primeira ou a de um novo jogo), para encerrar na limpeza.
  const sessionRef = useRef<GameSession | null>(null)

  useEffect(() => {
    let cancelled = false
    boot(storage).then((result) => {
      if (cancelled) {
        if (result.kind === 'ready') result.session.stop()
        return
      }
      if (result.kind === 'ready') sessionRef.current = result.session
      setPhase(result)
    })
    return () => {
      cancelled = true
      sessionRef.current?.stop()
      sessionRef.current = null
    }
  }, [storage])

  if (phase.kind === 'loading') {
    return <div className="grid min-h-screen place-items-center font-mono text-neon-cyan/70">{t('loading')}</div>
  }

  if (phase.kind === 'corrupt') {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="max-w-md rounded-xl border border-neon-magenta/40 bg-panel p-6 text-center">
          <TriangleAlert className="mx-auto mb-3 size-10 text-neon-magenta" aria-hidden />
          <h1 className="mb-2 font-mono text-lg font-bold text-white">{t('save.corrupt.title')}</h1>
          <p className="mb-5 text-sm text-white/70">{t('save.corrupt.body')}</p>
          <button
            type="button"
            className="rounded-lg border border-neon-magenta/50 bg-neon-magenta/20 px-4 py-2 font-mono text-sm font-bold text-white hover:bg-neon-magenta/30"
            onClick={() => phase.startNewGame().then((session) => {
                sessionRef.current = session
                setPhase({ kind: 'ready', session })
              })}
          >
            {t('save.corrupt.newGame')}
          </button>
        </div>
      </div>
    )
  }

  return <GameScreen engine={phase.session.engine} />
}

function GameScreen({ engine }: { engine: GameEngine }) {
  useEngineRevision(engine)
  return (
    <GameLayout
      engine={engine}
      left={
        <>
          <StatsPanel engine={engine} />
          <AgentsPanel />
        </>
      }
      right={<ShopPanel engine={engine} />}
      center={
        <>
          <CoreScene engine={engine} />
          <ClickButton engine={engine} />
        </>
      }
    />
  )
}
