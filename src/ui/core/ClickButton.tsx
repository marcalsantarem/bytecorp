import type { GameEngine } from '../../core/engine'
import { formatBytes } from '../../core/format'
import { NeonPanel } from '../components/NeonPanel'
import { useI18n } from '../i18n'

// Botão de clique abaixo do núcleo. Enter e Espaço funcionam pelo <button> nativo;
// touch-manipulation tira o atraso de clique no mobile.
export function ClickButton({ engine }: { engine: GameEngine }) {
  const { t, locale } = useI18n()
  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => engine.click()}
        className="w-full touch-manipulation rounded-xl transition-transform duration-75 select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95"
      >
        <NeonPanel>
          <span className="block py-3 text-center font-mono text-lg font-bold tracking-wide text-white uppercase">{t('click.button')}</span>
        </NeonPanel>
      </button>
      <span className="font-mono text-xs text-neon-cyan/70 tabular-nums">{t('click.perClick', { value: formatBytes(engine.clickValue, locale) })}</span>
    </div>
  )
}
