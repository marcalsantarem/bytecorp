import { Box } from 'lucide-react'
import { ICONS } from './iconMap'

// Ícone desconhecido cai num padrão.
export function EquipmentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name]
  return Icon ? <Icon className={className} aria-hidden /> : <Box className={className} aria-hidden />
}
