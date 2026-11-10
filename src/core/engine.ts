import type { Catalog } from './catalog/types'
import { D, type Decimal } from './decimal'
import { bulkCost, equipmentStatus, purchasableQuantity, unitCost, type BuyMode, type EquipmentStatus } from './economy'
import { EventBus, type GameEvents } from './events'
import { computeClickValue, computeProduction, costDiscountPercent, globalMultiplier, type ProductionBreakdown } from './production'
import { createInitialState, type GameState } from './state'

export interface EngineConfig {
  baseClick: number
  // Maior passo de simulação. Entre dois passos a produção é constante e a
  // integração é exata; o passo limita só a granularidade de temporizadores.
  maxStepMs: number
  // Chance de crítico por clique, de 0 a 1, e multiplicador sobre o ganho final
  // (GDD 5.4 e 5.5). Valores provisórios (A-04).
  criticalChance: number
  criticalMultiplier: number
  // Fonte de aleatoriedade em [0, 1). Injetável para testes.
  random: () => number
}

export interface EquipmentModeInfo {
  // Quantidade que a compra efetivaria agora (0 se não couber ou estiver bloqueado).
  quantity: number
  // Custo total da quantidade (x1: 1; x10: 10; max: quantity, ou 1 se for 0).
  cost: Decimal
}

export interface EquipmentInfo {
  id: string
  status: EquipmentStatus
  owned: number
  // Custo da próxima unidade, já com desconto.
  nextCost: Decimal
  modes: Record<BuyMode, EquipmentModeInfo>
  // baseProduction × multiplicador global.
  unitProduction: Decimal
}

export const DEFAULT_CONFIG: EngineConfig = {
  baseClick: 1,
  maxStepMs: 1000,
  criticalChance: 0.05,
  criticalMultiplier: 5,
  random: Math.random,
}

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

  // Um clique (GDD 5.3 a 5.5): sem limite nem combo. O crítico multiplica o
  // ganho final, já com acréscimos e percentuais; clickValue segue sem crítico.
  click(): Decimal {
    const { criticalChance, criticalMultiplier, random } = this.config
    const critical = random() < criticalChance
    const value = this.clickValue
    const gained = critical ? value.mul(criticalMultiplier) : value
    this.earn(gained)
    const { stats } = this._state
    stats.clicks++
    if (critical) stats.criticalClicks++
    stats.bytesFromClicks = stats.bytesFromClicks.add(gained)
    this._revision++
    this.events.emit('click', { gained, critical })
    return gained
  }

  // Compra de equipamento (GDD 4.4): imediata, sem confirmação. Devolve a
  // quantidade comprada; 0 se bloqueado, inexistente ou sem saldo (x10 é tudo ou nada).
  buyEquipment(id: string, mode: BuyMode): number {
    const def = this.catalog.equipment.find((e) => e.id === id)
    if (!def || equipmentStatus(def, this._state, this.catalog) !== 'unlocked') return 0
    const { run } = this._state
    const owned = run.equipment[id] ?? 0
    const discount = costDiscountPercent(this._state, this.catalog)
    const quantity = purchasableQuantity(mode, def.baseCost, def.costGrowth, owned, run.bytes, discount)
    if (quantity <= 0) return 0
    const cost = bulkCost(def.baseCost, def.costGrowth, owned, quantity, discount)
    run.bytes = run.bytes.sub(cost)
    run.equipment[id] = owned + quantity
    this.invalidate()
    this.events.emit('purchase', { id, quantity, cost })
    return quantity
  }

  equipmentInfo(id: string): EquipmentInfo | undefined {
    const def = this.catalog.equipment.find((e) => e.id === id)
    if (!def) return undefined
    const { run } = this._state
    const owned = run.equipment[id] ?? 0
    const discount = costDiscountPercent(this._state, this.catalog)
    const status = equipmentStatus(def, this._state, this.catalog)
    const mode = (m: BuyMode, want: number): EquipmentModeInfo => {
      const q =
        status === 'unlocked' ? purchasableQuantity(m, def.baseCost, def.costGrowth, owned, run.bytes, discount) : 0
      return { quantity: q, cost: bulkCost(def.baseCost, def.costGrowth, owned, q || want, discount) }
    }
    return {
      id,
      status,
      owned,
      nextCost: unitCost(def.baseCost, def.costGrowth, owned, discount),
      modes: { x1: mode('x1', 1), x10: mode('x10', 10), max: mode('max', 1) },
      unitProduction: D(def.baseProduction).mul(globalMultiplier(this._state, this.catalog)),
    }
  }

  // Na ordem do catálogo.
  equipmentList(): EquipmentInfo[] {
    return this.catalog.equipment.map((e) => this.equipmentInfo(e.id)!)
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
