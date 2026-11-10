import type { Catalog } from './catalog/types'
import type { Decimal } from './decimal'
import { EventBus, type GameEvents } from './events'
import { computeClickValue, computeProduction, type ProductionBreakdown } from './production'
import { createInitialState, type GameState } from './state'

export interface EngineConfig {
  baseClick: number
  // Maior passo de simulação. Entre dois passos a produção é constante e a
  // integração é exata; o passo limita só a granularidade de temporizadores.
  maxStepMs: number
}

export const DEFAULT_CONFIG: EngineConfig = { baseClick: 1, maxStepMs: 1000 }

// Núcleo de lógica. Não conhece interface, renderização nem relógio: quem o
// dirige chama advance(ms) com o tempo decorrido (GDD 4.1 e 24.4).
export class GameEngine {
  readonly events = new EventBus<GameEvents>()
  private _state: GameState
  private cachedProduction: ProductionBreakdown | null = null
  // Incrementado a cada mudança; a interface usa como snapshot.
  private _revision = 0

  constructor(
    readonly catalog: Catalog,
    state: GameState = createInitialState(Date.now()),
    readonly config: EngineConfig = DEFAULT_CONFIG,
  ) {
    this._state = state
  }

  get state(): GameState {
    return this._state
  }

  get revision(): number {
    return this._revision
  }

  get production(): ProductionBreakdown {
    this.cachedProduction ??= computeProduction(this._state, this.catalog)
    return this.cachedProduction
  }

  get clickValue(): Decimal {
    return computeClickValue(this._state, this.catalog, this.config.baseClick)
  }

  replaceState(state: GameState): void {
    this._state = state
    this.invalidate()
    this.events.emit('stateReplaced', {})
  }

  // Avança o tempo de jogo. O resultado depende só do total de ms, não de
  // quantas vezes advance é chamado nem da taxa de quadros.
  advance(ms: number): void {
    if (!(ms > 0)) return
    let remaining = ms
    while (remaining > 0) {
      const step = Math.min(remaining, this.config.maxStepMs)
      this.step(step)
      remaining -= step
    }
    this._revision++
    this.events.emit('tick', { dtMs: ms })
  }

  click(): Decimal {
    const gained = this.clickValue
    this.earn(gained)
    const { stats } = this._state
    stats.clicks++
    stats.bytesFromClicks = stats.bytesFromClicks.add(gained)
    this._revision++
    this.events.emit('click', { gained, critical: false })
    return gained
  }

  // Chamado por todo sistema que altere algo que afete a produção.
  invalidate(): void {
    this.cachedProduction = null
    this._revision++
  }

  private step(ms: number): void {
    const gained = this.production.total.mul(ms / 1000)
    if (gained.gt(0)) {
      this.earn(gained)
      this._state.stats.bytesFromProduction = this._state.stats.bytesFromProduction.add(gained)
    }
    this._state.stats.playTimeMs += ms
  }

  private earn(amount: Decimal): void {
    const { run, stats } = this._state
    run.bytes = run.bytes.add(amount)
    run.bytesEarned = run.bytesEarned.add(amount)
    stats.bytesEarnedAllTime = stats.bytesEarnedAllTime.add(amount)
  }
}
