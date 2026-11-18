import { Info, Play, Plus, Settings as SettingsIcon, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { SettingsDialog } from '../settings/SettingsDialog'
import { useModal } from '../useModal'
import { StartBackground } from './StartBackground'

interface Props {
  // Havia save válido ao abrir: mostra Continuar e pede confirmação para Novo jogo.
  hasSave: boolean
  onContinue: () => void
  // Novo jogo: com save, apaga o progresso (mantém as configurações) antes de entrar.
  onNewGame: () => Promise<void>
  // Reset da janela de Configurações (T-084).
  onReset: () => Promise<void>
}

type Dialog = 'none' | 'confirm' | 'settings' | 'credits'

const BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase transition-colors disabled:opacity-50'
const PRIMARY = 'border-neon-cyan/70 bg-neon-cyan/15 text-white hover:bg-neon-cyan/25 focus-visible:bg-neon-cyan/25'
const SECONDARY = 'border-white/20 bg-panel/70 text-white/80 hover:border-neon-cyan/40 hover:text-white'

// Tela inicial (Bíblia 17): Continuar, Novo jogo, Configurações e Créditos.
export function StartScreen({ hasSave, onContinue, onNewGame, onReset }: Props) {
  const { t } = useI18n()
  const [dialog, setDialog] = useState<Dialog>('none')
  const [busy, setBusy] = useState(false)
  // Reset feito pelas Configurações daqui (D-24): não há mais progresso a continuar.
  const [wasReset, setWasReset] = useState(false)
  const canContinue = hasSave && !wasReset
  const newGameRef = useRef<HTMLButtonElement>(null)
  const focusNewGame = useRef(false)
  const close = () => setDialog('none')

  const reset = async () => {
    await onReset()
    focusNewGame.current = true
    setWasReset(true)
  }

  // Ao fechar a janela depois do Reset, o foco vai para Novo jogo. Roda depois da limpeza de useModal,
  // que devolveria o foco ao botão Configurações.
  useEffect(() => {
    if (dialog !== 'none' || !focusNewGame.current) return
    focusNewGame.current = false
    newGameRef.current?.focus()
  }, [dialog])

  const startNew = () => {
    if (busy) return
    setBusy(true)
    onNewGame().catch((error: unknown) => {
      console.error('Falha ao iniciar novo jogo', error)
      setBusy(false)
    })
  }

  return (
    <div data-testid="start-screen" className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden px-4 py-8">
      <StartBackground />
      <h1 className="text-center font-mono leading-none font-bold">
        <span className="block text-5xl tracking-widest text-neon-cyan [text-shadow:0_0_8px_#00ffcc,0_0_24px_rgba(0,255,204,0.6)] sm:text-7xl">
          {t('start.logo')}
        </span>
        <span className="mt-2 block text-xl tracking-[0.6em] text-neon-magenta [text-shadow:0_0_8px_#ff007f] sm:text-2xl">
          {t('start.logoSub')}
        </span>
      </h1>

      <nav aria-label={t('start.menu')} className="flex w-full max-w-xs flex-col gap-3">
        {canContinue && (
          <button type="button" data-testid="start-continue" autoFocus disabled={busy} onClick={onContinue} className={`${BUTTON} ${PRIMARY}`}>
            <Play className="size-4" aria-hidden />
            {t('start.continue')}
          </button>
        )}
        <button
          type="button"
          ref={newGameRef}
          data-testid="start-new-game"
          autoFocus={!canContinue}
          disabled={busy}
          onClick={() => (canContinue ? setDialog('confirm') : startNew())}
          className={`${BUTTON} ${canContinue ? SECONDARY : PRIMARY}`}
        >
          <Plus className="size-4" aria-hidden />
          {t('start.newGame')}
        </button>
        <button type="button" data-testid="start-settings" disabled={busy} onClick={() => setDialog('settings')} className={`${BUTTON} ${SECONDARY}`}>
          <SettingsIcon className="size-4" aria-hidden />
          {t('start.settings')}
        </button>
        <button type="button" data-testid="start-credits" disabled={busy} onClick={() => setDialog('credits')} className={`${BUTTON} ${SECONDARY}`}>
          <Info className="size-4" aria-hidden />
          {t('start.credits')}
        </button>
      </nav>

      {dialog === 'confirm' && (
        <SimpleDialog title={t('start.newGame.title')} onClose={close} testId="start-confirm">
          <p className="text-sm text-white/70">{t('start.newGame.body')}</p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              data-testid="start-confirm-yes"
              onClick={() => {
                close()
                startNew()
              }}
              className={`${BUTTON} border-neon-magenta/70 bg-neon-magenta/25 text-white hover:bg-neon-magenta/35`}
            >
              {t('start.newGame.confirm')}
            </button>
            <button type="button" data-autofocus onClick={close} className={`${BUTTON} ${SECONDARY}`}>
              {t('start.newGame.cancel')}
            </button>
          </div>
        </SimpleDialog>
      )}

      {dialog === 'credits' && (
        <SimpleDialog title={t('start.credits.title')} onClose={close} testId="start-credits-dialog">
          <p className="text-sm whitespace-pre-line text-white/70">{t('start.credits.body')}</p>
          <button type="button" data-autofocus onClick={close} className={`${BUTTON} ${SECONDARY}`}>
            <X className="size-4" aria-hidden />
            {t('start.close')}
          </button>
        </SimpleDialog>
      )}

      {dialog === 'settings' && <SettingsDialog onReset={reset} onClose={close} />}
    </div>
  )
}

function SimpleDialog({ title, onClose, testId, children }: { title: string; onClose: () => void; testId: string; children: ReactNode }) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)
  // Foco inicial depois de useModal guardar o elemento anterior (autoFocus rodaria antes e o foco não voltaria).
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <h2 id={titleId} className="font-mono text-lg font-bold text-white">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
