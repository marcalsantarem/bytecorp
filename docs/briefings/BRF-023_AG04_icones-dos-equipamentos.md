# BRF-023 · AG04 · Ícones dos equipamentos novos

- **Task:** T-051 (marco M2)
- **Dono:** AG04
- **Depende de:** T-025 (feita)
- **Pode escrever em:** `src/ui/`

## Objetivo

Mostrar o ícone certo nos 10 equipamentos novos, que hoje caem no ícone padrão, e impedir que isso volte a acontecer.

## Contexto

O mapa de nomes de ícone do catálogo para componentes do lucide-react está em `src/ui/components/EquipmentIcon.tsx`. Os ícones novos, por `id` de equipamento em `src/core/catalog/equipment.ts`: `radio-tower`, `globe`, `brain-circuit`, `server-cog`, `database-zap`, `layers`, `thermometer-snowflake`, `sun`, `atom` e `orbit` (confirme os nomes lendo o catálogo). Os agentes (T-023) também usarão ícones lucide: o mapa deve servir a eles.

## Escopo

- Faz: acrescentar os 10 ícones ao mapa; teste em `src/ui/components/` (ambiente node, sem DOM) que falha se algum `icon` de equipamento do `CATALOG` não estiver no mapa; o teste deve cobrir também `CATALOG.agents` (hoje vazio, o AG07 preenche na T-023).
- Não faz: mudar layout, textos, ou fazer o ícone padrão desaparecer (ele continua como proteção para valores desconhecidos).

## Critério de pronto

- [ ] Todos os `icon` do catálogo existem no mapa (o teste prova).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
