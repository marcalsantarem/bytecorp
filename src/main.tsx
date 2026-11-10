import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Locale } from './core/format'
import { SETTINGS_KEY } from './core/save/storage'
import { LOCALES } from './i18n'
import { IndexedDbStorage } from './platform/indexedDbStorage'
import { App } from './ui/App'
import { I18nProvider } from './ui/i18n'
import './index.css'

// Configurações ficam fora do save do jogo: sobrevivem a "Novo jogo".
// O painel completo de configurações (GDD 15.8) chega no M5.
interface Settings {
  locale?: Locale
}

async function loadSettings(storage: IndexedDbStorage): Promise<Settings> {
  try {
    const raw = await storage.get(SETTINGS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    const locale = (parsed as Settings).locale
    return { locale: locale && LOCALES.includes(locale) ? locale : undefined }
  } catch {
    return {}
  }
}

const storage = new IndexedDbStorage()
const settings = await loadSettings(storage)
const saveLocale = (locale: Locale) => {
  storage.set(SETTINGS_KEY, JSON.stringify({ ...settings, locale })).catch((error: unknown) => console.error('Falha ao salvar configurações', error))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider initial={settings.locale} onChange={saveLocale}>
      <App storage={storage} />
    </I18nProvider>
  </StrictMode>,
)
