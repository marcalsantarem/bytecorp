import { act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CATALOG } from '../core/catalog'
import { D } from '../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../core/engine'
import { createInitialState, type RunState } from '../core/state'
import { translate, type MessageKey, type MessageParams } from '../i18n'
import { I18nProvider } from './i18n'
import { useEngineRevision } from './useEngine'

export interface RunSetup {
  bytes?: number
  bytesEarned?: number
  stage?: RunState['stage']
  equipment?: RunState['equipment']
  agents?: RunState['agents']
  upgrades?: string[]
}

/** Engine com o catálogo real e um estado de teste; sem relógio, o tempo só anda por advance. */
export function makeEngine(setup: RunSetup = {}): GameEngine {
  const state = createInitialState(0)
  const { run } = state
  run.bytes = D(setup.bytes ?? 0)
  run.bytesEarned = D(setup.bytesEarned ?? setup.bytes ?? 0)
  if (setup.stage) run.stage = setup.stage
  run.equipment = { ...setup.equipment }
  run.agents = { ...setup.agents }
  run.upgrades = [...(setup.upgrades ?? [])]
  return new GameEngine(CATALOG, state, { ...DEFAULT_CONFIG, random: () => 0.99 })
}

// Como o App: lê a revisão e recria os filhos a cada mudança (um elemento fixo não re-renderizaria).
function Live({ engine, ui }: { engine: GameEngine; ui: () => ReactNode }) {
  useEngineRevision(engine)
  return <>{ui()}</>
}

export function renderWithEngine(engine: GameEngine, ui: ReactNode | (() => ReactNode)) {
  const build = typeof ui === 'function' ? ui : () => ui
  return render(
    <I18nProvider>
      <Live engine={engine} ui={build} />
    </I18nProvider>,
  )
}

/** Notifica a interface como o relógio faria (sem avançar o tempo) e espera o quadro seguinte. */
export async function flush(engine: GameEngine): Promise<void> {
  await act(async () => {
    engine.events.emit('tick', { dtMs: 0 })
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  })
}

export const tr = (key: MessageKey, params?: MessageParams) => translate('pt-BR', key, params)
export const nameOf = (key: MessageKey) => tr(key)
