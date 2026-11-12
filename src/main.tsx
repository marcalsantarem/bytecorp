import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IndexedDbStorage } from './platform/indexedDbStorage'
import { registerServiceWorker } from './app/registerServiceWorker'
import { App } from './ui/App'
import { I18nProvider } from './ui/i18n'
import './index.css'

// Idioma fixo em pt-BR (ver ui/i18n.tsx): a chave `settings` não é mais lida aqui.
// A janela de configurações (D-11) a reativará.
const storage = new IndexedDbStorage()

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App storage={storage} />
    </I18nProvider>
  </StrictMode>,
)
