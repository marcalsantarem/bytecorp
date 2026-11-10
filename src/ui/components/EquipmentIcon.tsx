import {
  Archive,
  BatteryCharging,
  Blocks,
  Box,
  Cpu,
  Database,
  Droplets,
  Fan,
  HardDrive,
  Network,
  PlugZap,
  Router,
  Server,
  Snowflake,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'

// Único mapa entre o nome de ícone do catálogo e o componente do lucide-react.
const ICONS: Record<string, LucideIcon> = {
  router: Router,
  server: Server,
  'hard-drive': HardDrive,
  fan: Fan,
  'plug-zap': PlugZap,
  wifi: Wifi,
  network: Network,
  cpu: Cpu,
  blocks: Blocks,
  database: Database,
  archive: Archive,
  droplets: Droplets,
  snowflake: Snowflake,
  'battery-charging': BatteryCharging,
  zap: Zap,
}

// Ícone desconhecido cai num padrão.
export function EquipmentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name]
  return Icon ? <Icon className={className} aria-hidden /> : <Box className={className} aria-hidden />
}
