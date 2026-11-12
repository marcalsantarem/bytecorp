import type { UpgradeDef } from './types'

// Melhorias comuns (GDD 8). Valores provisórios (T-024, docs/AG07/melhorias-m2.md).
// Lista ordenada por custo crescente. Custo ~2x o desbloqueio, como nos equipamentos.
// Desconto total possível das melhorias: 4,5 pontos percentuais (soma com o dos agentes).
export const UPGRADES: UpgradeDef[] = [
  { id: 'macro_script', nameKey: 'upgrade.macro_script.name', descriptionKey: 'upgrade.macro_script.desc', icon: 'terminal', cost: 50, effect: { kind: 'clickFlat', value: 1 }, unlockBytesEarnedInRun: 25 },
  { id: 'overclock_basic', nameKey: 'upgrade.overclock_basic.name', descriptionKey: 'upgrade.overclock_basic.desc', icon: 'gauge', cost: 400, effect: { kind: 'globalProductionPercent', value: 5 }, unlockBytesEarnedInRun: 200 },
  { id: 'ergonomic_keys', nameKey: 'upgrade.ergonomic_keys.name', descriptionKey: 'upgrade.ergonomic_keys.desc', icon: 'keyboard', cost: 1_500, effect: { kind: 'clickPercent', value: 50 }, unlockBytesEarnedInRun: 750 },
  { id: 'bulk_discount', nameKey: 'upgrade.bulk_discount.name', descriptionKey: 'upgrade.bulk_discount.desc', icon: 'ticket-percent', cost: 2_500, effect: { kind: 'costDiscountPercent', value: 1 }, unlockBytesEarnedInRun: 1_000 },
  { id: 'neural_macro', nameKey: 'upgrade.neural_macro.name', descriptionKey: 'upgrade.neural_macro.desc', icon: 'zap', cost: 20_000, effect: { kind: 'clickFlat', value: 10 }, unlockBytesEarnedInRun: 10_000 },
  { id: 'task_scheduler', nameKey: 'upgrade.task_scheduler.name', descriptionKey: 'upgrade.task_scheduler.desc', icon: 'layers', cost: 100_000, effect: { kind: 'globalProductionPercent', value: 10 }, unlockBytesEarnedInRun: 50_000 },
  { id: 'haptic_gloves', nameKey: 'upgrade.haptic_gloves.name', descriptionKey: 'upgrade.haptic_gloves.desc', icon: 'hand-coins', cost: 150_000, effect: { kind: 'clickPercent', value: 100 }, unlockBytesEarnedInRun: 75_000 },
  { id: 'supplier_contract', nameKey: 'upgrade.supplier_contract.name', descriptionKey: 'upgrade.supplier_contract.desc', icon: 'piggy-bank', cost: 5_000_000, effect: { kind: 'costDiscountPercent', value: 1.5 }, unlockBytesEarnedInRun: 2_500_000 },
  { id: 'distributed_cache', nameKey: 'upgrade.distributed_cache.name', descriptionKey: 'upgrade.distributed_cache.desc', icon: 'rocket', cost: 60_000_000, effect: { kind: 'globalProductionPercent', value: 15 }, unlockBytesEarnedInRun: 30_000_000 },
  { id: 'corporate_volume', nameKey: 'upgrade.corporate_volume.name', descriptionKey: 'upgrade.corporate_volume.desc', icon: 'badge-percent', cost: 5_000_000_000, effect: { kind: 'costDiscountPercent', value: 2 }, unlockBytesEarnedInRun: 2_500_000_000 },
  { id: 'load_balancer', nameKey: 'upgrade.load_balancer.name', descriptionKey: 'upgrade.load_balancer.desc', icon: 'trending-up', cost: 100_000_000_000, effect: { kind: 'globalProductionPercent', value: 25 }, unlockBytesEarnedInRun: 50_000_000_000 },
  { id: 'quantum_scheduler', nameKey: 'upgrade.quantum_scheduler.name', descriptionKey: 'upgrade.quantum_scheduler.desc', icon: 'sparkles', cost: 10_000_000_000_000, effect: { kind: 'globalProductionPercent', value: 40 }, unlockBytesEarnedInRun: 5_000_000_000_000 },
]
