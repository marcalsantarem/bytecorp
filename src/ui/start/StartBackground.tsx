import { useContext, useSyncExternalStore } from 'react'
import { StartBackgroundCanvas } from '../../render/StartBackgroundCanvas'
import { SettingsContext } from '../settings/useSettings'

const noSubscribe = () => () => {}

// Fundo animado da tela inicial (T-086, AG05): camada absoluta atrás do menu, sem
// eventos de ponteiro. Lê a qualidade gráfica salva; fora do provedor usa 'auto'.
export function StartBackground() {
  const store = useContext(SettingsContext)
  const quality = useSyncExternalStore(
    store ? (listener) => store.subscribe(listener) : noSubscribe,
    () => store?.current.graphicsQuality ?? 'auto',
  )
  return (
    <div data-testid="start-background" className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <StartBackgroundCanvas quality={quality} />
    </div>
  )
}
