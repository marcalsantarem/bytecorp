import type { Locale } from '../core/format'
import { SETTINGS_KEY, type KeyValueStorage } from '../core/save/storage'
import { detectLocale, LOCALES } from '../i18n'

// Configurações do jogador (GDD 15.8), gravadas na chave `settings`, fora do save
// do jogo (D-06): sobrevivem a "Novo jogo" e ao Reset. Formato com versão própria;
// ao mudar o formato, incrementar SETTINGS_VERSION e tratar a versão antiga em parseSettings.
export const SETTINGS_VERSION = 1

export const GRAPHICS_QUALITIES = ['auto', 'low', 'medium', 'high'] as const
export type GraphicsQuality = (typeof GRAPHICS_QUALITIES)[number]

// Categorias de notificação local. Sem `offlineFull` (D-23): sem backend nada roda com o
// jogo fechado, então o aviso de offline cheio não teria quando disparar. Configurações
// antigas que ainda tragam essa chave carregam normalmente; a chave é ignorada.
export const NOTIFICATION_CATEGORIES = ['achievement', 'acceleratorExpired'] as const
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

// D-19: sem seletor no M5; só o valor 1x fica reservado para o M8.
export type GameSpeed = 1

export interface Volumes {
  music: number
  sfx: number
  ui: number
}

export interface NotificationSettings {
  enabled: boolean
  categories: Record<NotificationCategory, boolean>
}

export interface Settings {
  volumes: Volumes // 0 a 100, inteiros; só guardados até o M6
  graphicsQuality: GraphicsQuality // só guardada até o M6
  locale: Locale
  notifications: NotificationSettings
  gameSpeed: GameSpeed
}

export interface SettingsPatch {
  volumes?: Partial<Volumes>
  graphicsQuality?: GraphicsQuality
  locale?: Locale
  notifications?: { enabled?: boolean; categories?: Partial<Record<NotificationCategory, boolean>> }
}

export const VOLUME_MIN = 0
export const VOLUME_MAX = 100

// Idioma padrão vem do navegador (revoga D-11 na parte de idioma).
export function defaultSettings(languages: readonly string[] = []): Settings {
  return {
    volumes: { music: 70, sfx: 80, ui: 80 },
    graphicsQuality: 'auto',
    locale: detectLocale(languages),
    // Desligadas até o jogador ativar: ligar exige pedir permissão ao navegador (T-089).
    notifications: { enabled: false, categories: { achievement: true, acceleratorExpired: true } },
    gameSpeed: 1,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function volume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, Math.round(value)))
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function locale(value: unknown, fallback: Locale): Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value) ? (value as Locale) : fallback
}

// Validação campo a campo: valor inválido ou ausente cai no padrão daquele campo,
// sem descartar o resto (configurações não justificam bloquear o jogo).
function sanitize(input: Record<string, unknown>, defaults: Settings): Settings {
  const volumes = isRecord(input.volumes) ? input.volumes : {}
  const notifications = isRecord(input.notifications) ? input.notifications : {}
  const categories = isRecord(notifications.categories) ? notifications.categories : {}
  const quality = input.graphicsQuality
  return {
    volumes: {
      music: volume(volumes.music, defaults.volumes.music),
      sfx: volume(volumes.sfx, defaults.volumes.sfx),
      ui: volume(volumes.ui, defaults.volumes.ui),
    },
    graphicsQuality: GRAPHICS_QUALITIES.includes(quality as GraphicsQuality) ? (quality as GraphicsQuality) : defaults.graphicsQuality,
    locale: locale(input.locale, defaults.locale),
    notifications: {
      enabled: bool(notifications.enabled, defaults.notifications.enabled),
      categories: Object.fromEntries(
        NOTIFICATION_CATEGORIES.map((c) => [c, bool(categories[c], defaults.notifications.categories[c])]),
      ) as Record<NotificationCategory, boolean>,
    },
    gameSpeed: 1,
  }
}

// Lê o texto da chave `settings`. Nunca lança: ausente, corrompido ou de versão
// futura volta aos padrões. Versão 0 (sem campo version, até o M4) só tinha o idioma.
export function parseSettings(raw: string | null, languages: readonly string[] = []): Settings {
  const defaults = defaultSettings(languages)
  if (raw === null) return defaults
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return defaults
  }
  if (!isRecord(parsed)) return defaults
  const version = parsed.version
  if (version === undefined) return { ...defaults, locale: locale(parsed.locale ?? parsed.language, defaults.locale) }
  if (version !== SETTINGS_VERSION) return defaults
  return sanitize(parsed, defaults)
}

export function serializeSettings(settings: Settings): string {
  return JSON.stringify({ version: SETTINGS_VERSION, ...settings })
}

export function applySettingsPatch(settings: Settings, patch: SettingsPatch): Settings {
  const merged = {
    ...settings,
    ...patch,
    volumes: { ...settings.volumes, ...patch.volumes },
    notifications: {
      ...settings.notifications,
      ...patch.notifications,
      categories: { ...settings.notifications.categories, ...patch.notifications?.categories },
    },
  }
  return sanitize(merged as unknown as Record<string, unknown>, settings)
}

export type SettingsListener = (settings: Settings) => void

// Fonte única das configurações em execução. A UI lê `current`, altera por `update`
// e assina com `subscribe`. Cada alteração grava a chave inteira; as gravações
// entram em fila para não chegarem fora de ordem.
export class SettingsStore {
  private value: Settings
  private listeners = new Set<SettingsListener>()
  private queue: Promise<void> = Promise.resolve()

  constructor(
    private readonly storage: KeyValueStorage,
    initial: Settings,
    private readonly onError: (error: unknown) => void = (error) => console.error('Falha ao salvar configurações', error),
  ) {
    this.value = initial
  }

  get current(): Readonly<Settings> {
    return this.value
  }

  update(patch: SettingsPatch): Promise<void> {
    const next = applySettingsPatch(this.value, patch)
    if (serializeSettings(next) === serializeSettings(this.value)) return this.queue
    this.value = next
    for (const listener of this.listeners) listener(next)
    return this.persist()
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private persist(): Promise<void> {
    this.queue = this.queue
      .then(() => this.storage.set(SETTINGS_KEY, serializeSettings(this.value)))
      .catch(this.onError)
    return this.queue
  }
}

// Carrega as configurações antes de montar a interface. Falha de leitura vira padrões.
export async function loadSettings(
  storage: KeyValueStorage,
  languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages,
): Promise<SettingsStore> {
  let raw: string | null = null
  try {
    raw = await storage.get(SETTINGS_KEY)
  } catch (error) {
    console.error('Falha ao ler configurações', error)
  }
  return new SettingsStore(storage, parseSettings(raw, languages))
}
