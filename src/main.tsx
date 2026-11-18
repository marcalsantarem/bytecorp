import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IndexedDbStorage } from './platform/indexedDbStorage'
import { createBrowserNotifier } from './platform/localNotifications'
import { registerServiceWorker } from './app/registerServiceWorker'
import { loadSettings } from './app/settings'
import { App } from './ui/App'
import { I18nProvider } from './ui/i18n'
import { NotifierContext } from './ui/settings/useSettings'
import './index.css'

const storage = new IndexedDbStorage()
const notifier = createBrowserNotifier()

registerServiceWorker()

// Configurações (idioma etc.) carregadas antes de montar, para a primeira tela já sair no idioma certo.
async function start() {
  const settings = await loadSettings(storage)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider settings={settings}>
        <NotifierContext.Provider value={notifier}>
          <App storage={storage} />
        </NotifierContext.Provider>
      </I18nProvider>
    </StrictMode>,
  )
}

void start()
