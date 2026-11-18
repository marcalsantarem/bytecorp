import { TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { boot, browserLifecycle, type BootResult, type GameSession } from '../app/bootstrap'
import { startNotifications } from '../app/notifications'
import { useNotifier, useSettingsStore } from './settings/useSettings'
import type { KeyValueStorage } from '../core/save/storage'
import { useI18n } from './i18n'
import { ClickButton } from './core/ClickButton'
import { CoreScene } from './core/CoreScene'
import { StageIndicator } from './core/StageIndicator'
import { GameLayout } from './layout/GameLayout'
import { AchievementNotification } from './achievements/AchievementNotification'
import { AgentsPanel } from './agents/AgentsPanel'
import { StatsPanel } from './layout/Panels'
import { ShopPanel } from './shop/ShopPanel'
import { OfflineSummary } from './offline/OfflineSummary'
import { sessionOfflineSource } from './offline/sessionSource'
import { StartScreen } from './start/StartScreen'
import { TutorialHint } from './tutorial/TutorialHint'
import { useEngineRevision } from './useEngine'

type Phase = { kind: 'loading' } | BootResult

export function App({ storage }: { storage: KeyValueStorage }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })
  // Saiu da tela inicial (Continuar ou Novo jogo).
  const [started, setStarted] = useState(false)
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

  // Notificações locais (T-089): ligadas ao engine da sessão ativa e encerradas com ela.
  const store = useSettingsStore()
  const notifier = useNotifier()
  const engine = phase.kind === 'ready' ? phase.session.engine : null
  useEffect(() => {
    if (!engine) return
    const controller = startNotifications(engine, store, {
      notifier,
      isHidden: browserLifecycle.isHidden,
      onVisibilityChange: browserLifecycle.onVisibilityChange,
    })
    return () => controller.stop()
  }, [engine, store, notifier])

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
            className="min-h-11 rounded-lg border border-neon-magenta/50 bg-neon-magenta/20 px-4 py-2 font-mono text-sm font-bold text-white hover:bg-neon-magenta/30"
            onClick={() => phase.startNewGame().then((session) => {
                sessionRef.current = session
                // O jogador já escolheu começar de novo: entra direto no jogo.
                setStarted(true)
                setPhase({ kind: 'ready', session, hasSave: false })
              })}
          >
            {t('save.corrupt.newGame')}
          </button>
        </div>
      </div>
    )
  }

  // Tela inicial (T-085): o núcleo já roda por trás; o jogo (e o resumo offline) só monta depois.
  if (!started) {
    const { session, hasSave } = phase
    return (
      <StartScreen
        hasSave={hasSave}
        onContinue={() => setStarted(true)}
        onNewGame={async () => {
          if (hasSave) await session.reset()
          setStarted(true)
        }}
        onReset={session.reset}
      />
    )
  }

  return <GameScreen session={phase.session} />
}

export function GameScreen({ session }: { session: Pick<GameSession, 'engine' | 'offline' | 'reset'> }) {
  const { engine, offline, reset: onReset } = session
  useEngineRevision(engine)
  const source = useMemo(() => sessionOfflineSource(engine, offline), [engine, offline])
  return (
    <>
    <OfflineSummary engine={engine} source={source} />
    <AchievementNotification engine={engine} />
    <TutorialHint engine={engine} />
    <GameLayout
      engine={engine}
      onReset={onReset}
      left={
        <>
          <StatsPanel engine={engine} />
          <AgentsPanel engine={engine} />
        </>
      }
      right={<ShopPanel engine={engine} />}
      center={
        <>
          <StageIndicator engine={engine} />
          <CoreScene engine={engine} />
          <ClickButton engine={engine} />
        </>
      }
    />
    </>
  )
}
