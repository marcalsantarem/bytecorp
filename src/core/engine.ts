import type { Catalog, Effect, StageDef, UpgradeDef } from './catalog/types'
import { D, type Decimal } from './decimal'
import {
  advanceStageIndex,
  agentBonus,
  agentHireCost,
  agentLevelCost,
  agentStatus,
  bulkCost,
  equipmentStatus,
  orderedStages,
  purchasableQuantity,
  unitCost,
  upgradeStatus,
  type AgentStatus,
  type BuyMode,
  type EquipmentStatus,
  type UpgradeStatus,
} from './economy'
import { EventBus, type GameEvents } from './events'
import {
  computeClickValue,
  computeProduction,
  costDiscountInfo,
  costDiscountPercent,
  criticalChance,
  criticalChanceInfo,
  DEFAULT_MAX_COST_DISCOUNT_PERCENT,
  DEFAULT_MAX_CRITICAL_CHANCE,
  type CappedChance,
  type CappedValue,
  criticalMultiplier,
  globalMultiplier,
  type ProductionBreakdown,
} from './production'
import { applyReboot, DEFAULT_REBOOT_REWARD, rebootRewardOf, type RebootResult, type RebootReward } from './progression/reboot'
import {
  buyQuantumNode,
  DEFAULT_TREE_RESET_COST,
  nodeLevelCost,
  nodeStatus,
  quantumEffects,
  resetQuantumTree,
  spentCores,
  type BuyNodeResult,
  type NodeStatus,
  type QuantumEffects,
  type ResetTreeResult,
  type TreeResetCost,
} from './progression/quantum'
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
  // Tetos da D-13: desconto de custo acumulado (pontos percentuais) e chance de crítico (0 a 1).
  maxCostDiscountPercent: number
  maxCriticalChance: number
  // Fonte de aleatoriedade em [0, 1). Injetável para testes.
  random: () => number
  // Recompensa de Reboot em Quantum Cores; menos de 1 recusa o Reboot (T-034). Padrão: fórmula da D-15 (T-035).
  rebootReward: RebootReward
  // Custo em cores do reset da árvore Quantum, por número de resets já feitos (T-036).
  treeResetCost: TreeResetCost
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

export interface AgentInfo {
  id: string
  status: AgentStatus
  count: number
  // 0 enquanto não há agente contratado.
  level: number
  // Custo da próxima contratação, já com desconto.
  hireCost: Decimal
  // Custo de evoluir o nível coletivo; null sem agente contratado.
  levelCost: Decimal | null
  // Bônus atuais por efeito (primário primeiro), conforme D-10; valores 0 sem agentes.
  bonus: Effect[]
  // Fração de 0 a 1 do saldo em relação ao custo de evolução; null sem agente contratado.
  levelProgress: number | null
}

export interface UpgradeInfo {
  id: string
  status: UpgradeStatus
  // Custo fixo e inteiro; descontos não se aplicam (GDD 4.6).
  cost: number
  effect: Effect
  // Requisito de desbloqueio (Bytes gerados na execução), exibido quando locked.
  unlockBytesEarnedInRun: number
}

export interface StageInfo {
  // undefined só se o estágio do estado não existir no catálogo.
  current: StageDef | undefined
  // Próximo estágio, com o requisito em `requirement`; null no último.
  next: StageDef | null
}

// Limite offline inicial (GDD 14): 8 h.
export const BASE_OFFLINE_CAP_HOURS = 8

export const DEFAULT_CONFIG: EngineConfig = {
  baseClick: 1,
  maxStepMs: 1000,
  criticalChance: 0.05,
  criticalMultiplier: 5,
  maxCostDiscountPercent: DEFAULT_MAX_COST_DISCOUNT_PERCENT,
  maxCriticalChance: DEFAULT_MAX_CRITICAL_CHANCE,
  random: Math.random,
  rebootReward: DEFAULT_REBOOT_REWARD,
  treeResetCost: DEFAULT_TREE_RESET_COST,
}

// Núcleo de lógica. Não conhece interface, renderização nem relógio: quem o
// dirige chama advance(ms) com o tempo decorrido (GDD 4.1 e 24.4).
export class GameEngine {
  readonly events = new EventBus<GameEvents>()
  private _state: GameState
  private cachedProduction: ProductionBreakdown | null = null
  // Incrementado a cada mudança; a interface usa como snapshot.
  private _revision = 0
  // Estágios em ordem e a posição do atual, para olhar só o próximo a cada passo.
  private readonly stages: StageDef[]
  private stageIndex = -1

  constructor(
    readonly catalog: Catalog,
    state: GameState = createInitialState(Date.now()),
    readonly config: EngineConfig = DEFAULT_CONFIG,
  ) {
    this._state = state
    this.stages = orderedStages(catalog)
    this.syncStage()
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

  // Desconto de custo bruto e efetivo (depois do teto), para a interface e as estatísticas.
  get costDiscount(): CappedValue {
    return costDiscountInfo(this._state, this.catalog, this.config.maxCostDiscountPercent)
  }

  // Chance de crítico bruta e efetiva (depois do teto).
  get criticalChanceInfo(): CappedChance {
    return criticalChanceInfo(this._state, this.catalog, this.config.criticalChance, this.config.maxCriticalChance)
  }

  replaceState(state: GameState): void {
    this._state = state
    this.syncStage()
    this.invalidate()
    this.events.emit('stateReplaced', {})
  }

  // Cores que um Reboot daria agora (0 = Reboot indisponível).
  get rebootRewardNow(): number {
    return rebootRewardOf(this._state, this.catalog, this.config.rebootReward)
  }

  // Reboot (GDD 9.2 e 9.3): recusa sem recompensa; senão zera `run` e soma os cores.
  reboot(): RebootResult {
    const result = applyReboot(this._state, this.catalog, this.config.rebootReward, Date.now())
    if (!result.ok) return result
    this.syncStage()
    this.invalidate()
    this.events.emit('reboot', { reward: result.reward, rebootNumber: result.rebootNumber })
    return result
  }

  // Compra um nível do nó Quantum (GDD 10); recusa sem alterar o estado.
  buyQuantumNode(id: string): BuyNodeResult {
    const result = buyQuantumNode(this._state, this.catalog, id)
    if (!result.ok) return result
    this.invalidate()
    this.events.emit('quantumNodePurchased', { id, level: result.level, cost: result.cost })
    return result
  }

  // Reset da árvore: devolve os cores gastos e cobra o custo crescente; recusa sem saldo.
  resetQuantumTree(): ResetTreeResult {
    const result = resetQuantumTree(this._state, this.catalog, this.config.treeResetCost)
    if (!result.ok) return result
    this.invalidate()
    this.events.emit('quantumTreeReset', { refunded: result.refunded, cost: result.cost, resetNumber: result.resetNumber })
    return result
  }

  // Custo em cores do próximo reset da árvore.
  get quantumTreeResetCost(): number {
    return Math.max(0, Math.floor(this.config.treeResetCost(this._state.meta.treeResets)))
  }

  // Cores gastos na árvore (o que o reset devolveria).
  get quantumCoresSpent(): number {
    return spentCores(this._state, this.catalog)
  }

  // Limite de ganho offline em ms: base mais os níveis de offlineCapHours da árvore Quantum.
  // Só exposto; o cálculo offline é do M4.
  get offlineCapMs(): number {
    const hours = BASE_OFFLINE_CAP_HOURS + (quantumEffects(this._state, this.catalog).offlineCapHours ?? 0)
    return Math.max(0, hours) * 3_600_000
  }

  // Efeitos agregados por tipo (aplicados em production.ts).
  get quantumEffects(): QuantumEffects {
    return quantumEffects(this._state, this.catalog)
  }

  // Nível, custo do próximo nível e situação do nó; undefined se o id não existe.
  quantumNodeInfo(id: string): { level: number; nextCost: number; status: NodeStatus } | undefined {
    const def = this.catalog.quantumNodes.find((n) => n.id === id)
    if (!def) return undefined
    const level = this._state.meta.quantumNodes[id] ?? 0
    return { level, nextCost: nodeLevelCost(def, level), status: nodeStatus(def, this._state) }
  }

  // Estágio atual e o próximo, para a interface.
  get stageInfo(): StageInfo {
    return { current: this.stages[this.stageIndex], next: this.stages[this.stageIndex + 1] ?? null }
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
    const { random } = this.config
    const critical = random() < criticalChance(this._state, this.catalog, this.config.criticalChance, this.config.maxCriticalChance)
    const value = this.clickValue
    const gained = critical
      ? value.mul(criticalMultiplier(this._state, this.catalog, this.config.criticalMultiplier))
      : value
    this.earn(gained)
    const { stats } = this._state
    stats.clicks++
    if (critical) stats.criticalClicks++
    stats.bytesFromClicks = stats.bytesFromClicks.add(gained)
    this.checkStage()
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
    const discount = costDiscountPercent(this._state, this.catalog, this.config.maxCostDiscountPercent)
    const quantity = purchasableQuantity(mode, def.baseCost, def.costGrowth, owned, run.bytes, discount)
    if (quantity <= 0) return 0
    const cost = bulkCost(def.baseCost, def.costGrowth, owned, quantity, discount)
    run.bytes = run.bytes.sub(cost)
    run.equipment[id] = owned + quantity
    this.invalidate()
    this.events.emit('purchase', { id, quantity, cost })
    this.checkStage()
    return quantity
  }

  equipmentInfo(id: string): EquipmentInfo | undefined {
    const def = this.catalog.equipment.find((e) => e.id === id)
    if (!def) return undefined
    const { run } = this._state
    const owned = run.equipment[id] ?? 0
    const discount = costDiscountPercent(this._state, this.catalog, this.config.maxCostDiscountPercent)
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

  // Contratação individual (GDD 7.2). Devolve false se bloqueado, inexistente ou sem saldo.
  // O nível coletivo começa em 1 na primeira contratação.
  hireAgent(id: string): boolean {
    const def = this.catalog.agents.find((a) => a.id === id)
    if (!def || agentStatus(def, this._state, this.catalog) !== 'unlocked') return false
    const { run } = this._state
    const entry = run.agents[id] ?? { count: 0, level: 0 }
    const cost = agentHireCost(def, entry.count, costDiscountPercent(this._state, this.catalog, this.config.maxCostDiscountPercent))
    if (run.bytes.lt(cost)) return false
    run.bytes = run.bytes.sub(cost)
    run.agents[id] = { count: entry.count + 1, level: Math.max(1, entry.level) }
    this.invalidate()
    this.events.emit('agentHired', { id, count: entry.count + 1, cost })
    this.checkStage()
    return true
  }

  // Evolui o nível coletivo em um (GDD 7.4). Exige ao menos um agente do tipo e saldo.
  levelUpAgent(id: string): boolean {
    const def = this.catalog.agents.find((a) => a.id === id)
    if (!def || agentStatus(def, this._state, this.catalog) !== 'unlocked') return false
    const { run } = this._state
    const entry = run.agents[id]
    if (!entry || entry.count < 1) return false
    const cost = agentLevelCost(def, entry.level, costDiscountPercent(this._state, this.catalog, this.config.maxCostDiscountPercent))
    if (run.bytes.lt(cost)) return false
    run.bytes = run.bytes.sub(cost)
    entry.level++
    this.invalidate()
    this.events.emit('agentLeveled', { id, level: entry.level, cost })
    return true
  }

  agentInfo(id: string): AgentInfo | undefined {
    const def = this.catalog.agents.find((a) => a.id === id)
    if (!def) return undefined
    const { run } = this._state
    const count = run.agents[id]?.count ?? 0
    const level = count > 0 ? (run.agents[id]?.level ?? 1) : 0
    const discount = costDiscountPercent(this._state, this.catalog, this.config.maxCostDiscountPercent)
    const levelCost = count > 0 ? agentLevelCost(def, level, discount) : null
    return {
      id,
      status: agentStatus(def, this._state, this.catalog),
      count,
      level,
      hireCost: agentHireCost(def, count, discount),
      levelCost,
      bonus: agentBonus(def, count, level),
      levelProgress: levelCost ? Math.min(1, run.bytes.div(levelCost).toNumber()) : null,
    }
  }

  // Lista única ordenada pelo próximo custo de contratação, do menor ao maior
  // (empate: ordem do catálogo, pois a ordenação é estável).
  agentList(): AgentInfo[] {
    return this.catalog.agents
      .map((a) => this.agentInfo(a.id)!)
      .sort((a, b) => a.hireCost.cmp(b.hireCost))
  }

  // Compra de melhoria comum (GDD 8): única por execução, imediata, custo fixo.
  // Devolve false se inexistente, bloqueada, já comprada ou sem saldo.
  buyUpgrade(id: string): boolean {
    const def = this.catalog.upgrades.find((u) => u.id === id)
    if (!def || upgradeStatus(def, this._state) !== 'available') return false
    const { run } = this._state
    if (run.bytes.lt(def.cost)) return false
    run.bytes = run.bytes.sub(def.cost)
    run.upgrades.push(id)
    this.invalidate()
    this.events.emit('upgradePurchased', { id, cost: def.cost })
    return true
  }

  upgradeInfo(id: string): UpgradeInfo | undefined {
    const def = this.catalog.upgrades.find((u) => u.id === id)
    return def && this.toUpgradeInfo(def)
  }

  // Lista única ordenada por custo crescente (empate: ordem do catálogo).
  upgradeList(): UpgradeInfo[] {
    return this.catalog.upgrades.map((u) => this.toUpgradeInfo(u)).sort((a, b) => a.cost - b.cost)
  }

  private toUpgradeInfo(def: UpgradeDef): UpgradeInfo {
    return {
      id: def.id,
      status: upgradeStatus(def, this._state),
      cost: def.cost,
      effect: def.effect,
      unlockBytesEarnedInRun: def.unlockBytesEarnedInRun,
    }
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
    this.checkStage()
  }

  // Ao carregar um estado: localiza o estágio salvo e corrige em silêncio o que
  // estiver abaixo do que os requisitos já garantem. Estágio fora do catálogo
  // fica como está e não avança.
  private syncStage(): void {
    const index = this.stages.findIndex((s) => s.id === this._state.run.stage)
    this.stageIndex = index < 0 ? -1 : advanceStageIndex(this.stages, index, this._state, this.catalog)
  }

  // Avança enquanto o próximo estágio estiver atingido; um evento por estágio.
  private checkStage(): void {
    if (this.stageIndex < 0) return
    this.stageIndex = advanceStageIndex(this.stages, this.stageIndex, this._state, this.catalog, (from, to) => {
      this.invalidate()
      this.events.emit('stageChanged', { from: from.id, to: to.id })
    })
  }

  private earn(amount: Decimal): void {
    const { run, stats } = this._state
    run.bytes = run.bytes.add(amount)
    run.bytesEarned = run.bytesEarned.add(amount)
    stats.bytesEarnedAllTime = stats.bytesEarnedAllTime.add(amount)
  }
}
