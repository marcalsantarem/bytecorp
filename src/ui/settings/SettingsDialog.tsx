import { Gauge, Globe, Bell, Database, Monitor, RotateCcw, Settings as SettingsIcon, Volume2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { setNotificationsEnabled } from '../../app/notifications'
import { GRAPHICS_QUALITIES, NOTIFICATION_CATEGORIES, VOLUME_MAX, VOLUME_MIN, type NotificationCategory, type Volumes } from '../../app/settings'
import { LOCALES, type MessageKey } from '../../i18n'
import { useI18n } from '../i18n'
import { useModal } from '../useModal'
import { useNotifier, useSettings, useSettingsStore } from './useSettings'

// Botão de engrenagem do cabeçalho: abre a janela de Configurações (Bíblia 15.8).
export function SettingsControl({ onReset }: { onReset: () => Promise<void> }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        data-testid="settings-button"
        aria-label={t('settings.open')}
        title={t('settings.open')}
        onClick={() => setOpen(true)}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded border border-white/10 px-1.5 py-1 text-white/50 hover:border-neon-cyan/30 hover:text-white/80 lg:min-h-9 lg:min-w-9"
      >
        <SettingsIcon className="size-5 shrink-0" aria-hidden />
      </button>
      {/* Portal: o cabeçalho usa backdrop-blur, que prenderia o `fixed` da janela dentro dele. */}
      {open && createPortal(<SettingsDialog onReset={onReset} onClose={() => setOpen(false)} />, document.body)}
    </>
  )
}

const VOLUME_KEYS: { id: keyof Volumes; label: MessageKey }[] = [
  { id: 'music', label: 'settings.volume.music' },
  { id: 'sfx', label: 'settings.volume.sfx' },
  { id: 'ui', label: 'settings.volume.ui' },
]

const QUALITY_LABEL: Record<(typeof GRAPHICS_QUALITIES)[number], MessageKey> = {
  auto: 'settings.graphics.auto',
  low: 'settings.graphics.low',
  medium: 'settings.graphics.medium',
  high: 'settings.graphics.high',
}

const CATEGORY_LABEL: Record<NotificationCategory, MessageKey> = {
  achievement: 'settings.notifications.achievement',
  acceleratorExpired: 'settings.notifications.acceleratorExpired',
}

const CHOICE = 'min-h-11 flex-1 rounded-lg border px-2 py-1 font-mono text-xs'
const CHOICE_ON = 'border-neon-cyan/70 bg-neon-cyan/15 font-bold text-white'
const CHOICE_OFF = 'border-white/15 text-white/60 hover:bg-white/5'

export function SettingsDialog({ onReset, onClose }: { onReset: () => Promise<void>; onClose: () => void }) {
  const { t } = useI18n()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const store = useSettingsStore()
  const settings = useSettings()
  useModal(ref, onClose)

  const notifier = useNotifier()
  const notificationsOn = settings.notifications.enabled
  const [notifBusy, setNotifBusy] = useState(false)
  const [notifWarning, setNotifWarning] = useState<'denied' | 'unsupported' | null>(null)

  // Ligar pede a permissão do navegador (ação do jogador); só grava ligado se concedida.
  const toggleNotifications = (enabled: boolean) => {
    setNotifBusy(true)
    setNotifWarning(null)
    setNotificationsEnabled(store, notifier, enabled)
      .then((result) => {
        if (result === 'denied' || result === 'unsupported') setNotifWarning(result)
      })
      .catch((error: unknown) => console.error('Falha ao alterar notificações', error))
      .finally(() => setNotifBusy(false))
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-3" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-neon-cyan/40 bg-panel p-4 shadow-[0_0_24px_rgba(0,255,204,0.2)]"
      >
        <h2 id={titleId} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <SettingsIcon className="size-5 text-neon-cyan" aria-hidden />
          {t('settings.title')}
        </h2>

        <Section icon={<Volume2 className="size-4" aria-hidden />} title={t('settings.audio')}>
          {VOLUME_KEYS.map(({ id, label }) => (
            <VolumeSlider
              key={id}
              label={t(label)}
              value={settings.volumes[id]}
              onChange={(value) => void store.update({ volumes: { [id]: value } })}
            />
          ))}
        </Section>

        <Section icon={<Monitor className="size-4" aria-hidden />} title={t('settings.graphics')}>
          <div role="radiogroup" aria-label={t('settings.graphics.quality')} className="flex gap-1.5">
            {GRAPHICS_QUALITIES.map((q) => (
              <button
                key={q}
                type="button"
                role="radio"
                aria-checked={settings.graphicsQuality === q}
                onClick={() => void store.update({ graphicsQuality: q })}
                className={`${CHOICE} ${settings.graphicsQuality === q ? CHOICE_ON : CHOICE_OFF}`}
              >
                {t(QUALITY_LABEL[q])}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Globe className="size-4" aria-hidden />} title={t('settings.language')}>
          <div role="radiogroup" aria-label={t('settings.language')} className="flex gap-1.5">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                lang={l}
                aria-checked={settings.locale === l}
                onClick={() => void store.update({ locale: l })}
                className={`${CHOICE} ${settings.locale === l ? CHOICE_ON : CHOICE_OFF}`}
              >
                {t(`language.${l}`)}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Bell className="size-4" aria-hidden />} title={t('settings.notifications')}>
          <Toggle
            label={t('settings.notifications.enabled')}
            checked={notificationsOn}
            disabled={notifBusy}
            onChange={toggleNotifications}
          />
          {notifWarning && (
            <p role="alert" data-testid="settings-notifications-warning" className="rounded border border-neon-magenta/40 bg-neon-magenta/10 px-2 py-1.5 text-xs text-white/80">
              {t(notifWarning === 'denied' ? 'settings.notifications.denied' : 'settings.notifications.unsupported')}
            </p>
          )}
          <div className="flex flex-col gap-1 pl-3">
            {NOTIFICATION_CATEGORIES.map((c) => (
              <Toggle
                key={c}
                label={t(CATEGORY_LABEL[c])}
                checked={settings.notifications.categories[c]}
                disabled={!notificationsOn}
                onChange={(on) => void store.update({ notifications: { categories: { [c]: on } } })}
              />
            ))}
          </div>
        </Section>

        <Section icon={<Gauge className="size-4" aria-hidden />} title={t('settings.speed')}>
          <div className="flex items-center justify-between gap-2 rounded border border-white/10 px-2 py-2 font-mono text-xs text-white/40">
            <span>{t('settings.speed.value')}</span>
            <span data-testid="settings-speed-soon" className="rounded border border-white/15 px-1.5 py-0.5 uppercase">
              {t('settings.speed.soon')}
            </span>
          </div>
        </Section>

        <Section icon={<Database className="size-4" aria-hidden />} title={t('settings.data')}>
          <p className="text-xs text-white/60">{t('settings.data.resetHint')}</p>
          <ResetButton onReset={onReset} onDone={onClose} />
        </Section>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 font-mono text-sm text-white/80 hover:bg-white/10"
        >
          <X className="size-4" aria-hidden />
          {t('settings.close')}
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-neon-cyan/15 bg-white/[0.03] p-3">
      <h3 className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-neon-cyan/80 uppercase">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const { t } = useI18n()
  const id = useId()
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <label htmlFor={id} className="w-20 shrink-0 text-white/70">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={VOLUME_MIN}
        max={VOLUME_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 min-w-0 flex-1 accent-neon-cyan"
      />
      <span className="w-10 shrink-0 text-right text-neon-cyan tabular-nums">{t('settings.volume.value', { value })}</span>
    </div>
  )
}

function Toggle({ label, checked, disabled = false, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className={`flex min-h-11 items-center justify-between gap-2 font-mono text-xs ${disabled ? 'text-white/30' : 'text-white/80'}`}>
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 accent-neon-cyan disabled:cursor-not-allowed"
      />
    </label>
  )
}

const CONFIRM_TIMEOUT_MS = 4000

// Reinicia o jogo por completo, com confirmação em dois passos (D-11, mantida pela D-21).
function ResetButton({ onReset, onDone }: { onReset: () => Promise<void>; onDone: () => void }) {
  const { t } = useI18n()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [confirming])

  const click = () => {
    if (busy) return
    if (!confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    setBusy(true)
    onReset()
      .then(onDone)
      .catch((error: unknown) => {
        console.error('Falha ao reiniciar o jogo', error)
        setBusy(false)
      })
  }

  return (
    <button
      type="button"
      data-testid="settings-reset"
      aria-label={t(confirming ? 'reset.confirmLabel' : 'reset.label')}
      disabled={busy}
      onClick={click}
      onBlur={() => setConfirming(false)}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-sm disabled:opacity-50 ${
        confirming
          ? 'border-neon-magenta/70 bg-neon-magenta/25 font-bold text-white'
          : 'border-neon-magenta/40 text-neon-magenta hover:bg-neon-magenta/10'
      }`}
    >
      <RotateCcw className="size-4 shrink-0" aria-hidden />
      {t(confirming ? 'reset.confirm' : 'reset.button')}
    </button>
  )
}
