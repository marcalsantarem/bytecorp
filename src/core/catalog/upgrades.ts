import type { UpgradeDef } from './types'

// Melhorias comuns (GDD 8). Valores provisórios (T-024, T-062; docs/AG07/melhorias-m2.md e melhorias-m3.md).
// Lista ordenada por custo crescente. Custo ~2x o desbloqueio, como nos equipamentos.
// Produção global soma +245 pp; desconto das melhorias soma 8 pp (somam com o dos agentes; teto de 50 pp, D-13).
// Os efeitos de clique (clickFlat) crescem com a renda para o clique seguir com papel visível.
export const UPGRADES: UpgradeDef[] = [
  { id: 'macro_script', nameKey: 'upgrade.macro_script.name', descriptionKey: 'upgrade.macro_script.desc', icon: 'terminal', cost: 50, effect: { kind: 'clickFlat', value: 1 }, unlockBytesEarnedInRun: 25 },
  { id: 'overclock_basic', nameKey: 'upgrade.overclock_basic.name', descriptionKey: 'upgrade.overclock_basic.desc', icon: 'gauge', cost: 400, effect: { kind: 'globalProductionPercent', value: 5 }, unlockBytesEarnedInRun: 200 },
  { id: 'ergonomic_keys', nameKey: 'upgrade.ergonomic_keys.name', descriptionKey: 'upgrade.ergonomic_keys.desc', icon: 'keyboard', cost: 1_500, effect: { kind: 'clickPercent', value: 50 }, unlockBytesEarnedInRun: 750 },
  { id: 'bulk_discount', nameKey: 'upgrade.bulk_discount.name', descriptionKey: 'upgrade.bulk_discount.desc', icon: 'ticket-percent', cost: 2_500, effect: { kind: 'costDiscountPercent', value: 1 }, unlockBytesEarnedInRun: 1_000 },
  { id: 'neural_macro', nameKey: 'upgrade.neural_macro.name', descriptionKey: 'upgrade.neural_macro.desc', icon: 'zap', cost: 20_000, effect: { kind: 'clickFlat', value: 30 }, unlockBytesEarnedInRun: 10_000 },
  { id: 'task_scheduler', nameKey: 'upgrade.task_scheduler.name', descriptionKey: 'upgrade.task_scheduler.desc', icon: 'layers', cost: 100_000, effect: { kind: 'globalProductionPercent', value: 10 }, unlockBytesEarnedInRun: 50_000 },
  { id: 'supplier_contract', nameKey: 'upgrade.supplier_contract.name', descriptionKey: 'upgrade.supplier_contract.desc', icon: 'piggy-bank', cost: 5_000_000, effect: { kind: 'costDiscountPercent', value: 1.5 }, unlockBytesEarnedInRun: 2_500_000 },
  { id: 'haptic_gloves', nameKey: 'upgrade.haptic_gloves.name', descriptionKey: 'upgrade.haptic_gloves.desc', icon: 'hand-coins', cost: 50_000_000, effect: { kind: 'clickFlat', value: 300_000 }, unlockBytesEarnedInRun: 25_000_000 },
  { id: 'distributed_cache', nameKey: 'upgrade.distributed_cache.name', descriptionKey: 'upgrade.distributed_cache.desc', icon: 'rocket', cost: 60_000_000, effect: { kind: 'globalProductionPercent', value: 15 }, unlockBytesEarnedInRun: 30_000_000 },
  { id: 'corporate_volume', nameKey: 'upgrade.corporate_volume.name', descriptionKey: 'upgrade.corporate_volume.desc', icon: 'badge-percent', cost: 5_000_000_000, effect: { kind: 'costDiscountPercent', value: 2 }, unlockBytesEarnedInRun: 2_500_000_000 },
  { id: 'load_balancer', nameKey: 'upgrade.load_balancer.name', descriptionKey: 'upgrade.load_balancer.desc', icon: 'trending-up', cost: 100_000_000_000, effect: { kind: 'globalProductionPercent', value: 30 }, unlockBytesEarnedInRun: 50_000_000_000 },
  { id: 'quantum_scheduler', nameKey: 'upgrade.quantum_scheduler.name', descriptionKey: 'upgrade.quantum_scheduler.desc', icon: 'sparkles', cost: 10_000_000_000_000, effect: { kind: 'globalProductionPercent', value: 25 }, unlockBytesEarnedInRun: 5_000_000_000_000 },
  { id: 'quantum_gloves', nameKey: 'upgrade.quantum_gloves.name', descriptionKey: 'upgrade.quantum_gloves.desc', icon: 'mouse-pointer-click', cost: 3.5e13, effect: { kind: 'clickFlat', value: 3e10 }, unlockBytesEarnedInRun: 1.75e13 },
  { id: 'photonic_bus', nameKey: 'upgrade.photonic_bus.name', descriptionKey: 'upgrade.photonic_bus.desc', icon: 'cable', cost: 4e13, effect: { kind: 'globalProductionPercent', value: 30 }, unlockBytesEarnedInRun: 2e13 },
  { id: 'facility_contract', nameKey: 'upgrade.facility_contract.name', descriptionKey: 'upgrade.facility_contract.desc', icon: 'handshake', cost: 1e15, effect: { kind: 'costDiscountPercent', value: 1.5 }, unlockBytesEarnedInRun: 5e14 },
  { id: 'entangled_cache', nameKey: 'upgrade.entangled_cache.name', descriptionKey: 'upgrade.entangled_cache.desc', icon: 'database-zap', cost: 5e15, effect: { kind: 'globalProductionPercent', value: 35 }, unlockBytesEarnedInRun: 2.5e15 },
  { id: 'neural_overdrive', nameKey: 'upgrade.neural_overdrive.name', descriptionKey: 'upgrade.neural_overdrive.desc', icon: 'brain-circuit', cost: 1e16, effect: { kind: 'clickFlat', value: 6e12 }, unlockBytesEarnedInRun: 5e15 },
  { id: 'orbital_orchestrator', nameKey: 'upgrade.orbital_orchestrator.name', descriptionKey: 'upgrade.orbital_orchestrator.desc', icon: 'workflow', cost: 4e16, effect: { kind: 'globalProductionPercent', value: 45 }, unlockBytesEarnedInRun: 2e16 },
  { id: 'megacorp_charter', nameKey: 'upgrade.megacorp_charter.name', descriptionKey: 'upgrade.megacorp_charter.desc', icon: 'landmark', cost: 5e17, effect: { kind: 'costDiscountPercent', value: 2 }, unlockBytesEarnedInRun: 2.5e17 },
  { id: 'singularity_core', nameKey: 'upgrade.singularity_core.name', descriptionKey: 'upgrade.singularity_core.desc', icon: 'crown', cost: 3e18, effect: { kind: 'globalProductionPercent', value: 30 }, unlockBytesEarnedInRun: 1.5e18 },
]
