# Equipamentos extras por estágio (M2, provisório)

BRF-021, T-025. Valores provisórios; a rever no M2 (com agentes e melhorias) e no M8. Os 15 equipamentos do M1 não mudaram (ver `equipamentos-m1.md`). Total: 25, cinco por categoria.

**T-062 (BRF-044):** a produção de `subsea_backbone`, `supercomputer`, `holo_archive`, `orbital_radiator`, `fusion_cell` e `orbital_plant` foi reduzida (tabela abaixo já atualizada); custos e desbloqueios ficam. A simulação e os tempos desta página são da produção original; a curva atual está em `curva-m2.md`.

## Novos equipamentos

| Id | Categoria | Custo base | Fator | Produção/s | Desbloqueio (bytes na run) | Revelação | Ícone |
|---|---|---|---|---|---|---|---|
| edge_cdn | networking | 1,2 mi | 1,18 | 20.000 | 600.000 | 25.000 bytes | radio-tower |
| subsea_backbone | networking | 3 bi | 1,25 | 29 mi | 1,5 bi | estágio Startup Lab | globe |
| ai_accelerator | processing | 8 mi | 1,20 | 110.000 | 4 mi | 100.000 bytes | brain-circuit |
| supercomputer | processing | 60 bi | 1,25 | 580 mi | 30 bi | estágio Data Center | server-cog |
| data_lake | storage | 110 mi | 1,20 | 1,4 mi | 55 mi | 1,1 mi bytes | database-zap |
| holo_archive | storage | 1,5 tri | 1,25 | 5,9 bi | 750 bi | estágio Data Center | layers |
| immersion_tank | cooling | 450 mi | 1,22 | 5,5 mi | 225 mi | 11 mi bytes | thermometer-snowflake |
| orbital_radiator | cooling | 400 bi | 1,25 | 4 bi | 200 bi | estágio Data Center | sun |
| fusion_cell | infrastructure | 4 bi | 1,25 | 38 mi | 2 bi | 125 mi bytes | atom |
| orbital_plant | infrastructure | 5 tri | 1,25 | 18 bi | 2,5 tri | estágio Corporate Network | orbit |

Critérios: desbloqueio igual à metade do custo base; produção/custo entre 0,011 e 0,014 (os itens do M1 de alto nível ficam em 0,011 a 0,017); fator 1,18 a 1,22 para hardware avançado e 1,25 para tecnologia de ponta; só `bytesEarnedInRun` nos desbloqueios e `stageReached` na revelação dos itens de estágios altos; sem dependência entre categorias. Ícones existem no lucide-react, mas **não estão no mapa de `src/ui/components/EquipmentIcon.tsx`** (pasta do AG04): até serem adicionados, aparece o ícone padrão (Box).

## Estágios

Limites mantidos (1e4, 1e6, 1e9, 1e12, 1e15, 1e18). Lógica: cada estágio abre pouco antes do desbloqueio de um equipamento mais caro (garage: wifi_mesh/gpu_rig; startup: ssd_vault/ai_accelerator; data center: subsea_backbone/fusion_cell; corporate: holo_archive/orbital_plant) e o tempo entre estágios cresce cerca de 2x, 1,7x no fim.

## Simulação

`node tools/simular-equipamentos.mjs` (1 clique/s de 1 Byte, compra gananciosa por menor custo/produção, sem melhorias nem agentes). Itens novos em negrito. Os tempos do M1 mudaram um pouco porque a compra gananciosa agora também considera os itens novos.

| Item | Tempo | Item | Tempo |
|---|---|---|---|
| home_router | 15 s | cryo_chamber | 13,9 min |
| home_server | 77 s | **ai_accelerator** | 14,8 min |
| wifi_mesh | 2,5 min | ups_bank | 15,0 min |
| external_drive | 3,1 min | **data_lake** | 16,4 min |
| gpu_rig | 4,2 min | **immersion_tank** | 19,1 min |
| nas_array | 6,8 min | micro_generator | 19,6 min |
| fiber_node | 7,1 min | power_strip | 19,7 min |
| blade_cluster | 8,5 min | **subsea_backbone** | 23,7 min |
| desk_fan | 9,1 min | **fusion_cell** | 25,1 min |
| ssd_vault | 11,0 min | **supercomputer** | 30,9 min |
| liquid_loop | 11,6 min | **orbital_radiator** | 36,0 min |
| **edge_cdn** | 11,8 min | **holo_archive** | 39,7 min |
| | | **orbital_plant** | 43,1 min |

| Estágio | Bytes na run | Tempo |
|---|---|---|
| Solo Hacker | 0 | 0 |
| Garage Company | 1e4 | 4,5 min |
| Startup Lab | 1e6 | 9,4 min |
| Data Center | 1e9 | 19,8 min |
| Corporate Network | 1e12 | 37,1 min |
| Quantum Facility | 1e15 | 64,6 min |
| Mega Corporation | 1e18 | 85,5 h |

## Saltos de dificuldade

- Itens: nenhum intervalo supera 2x além da abertura (router para server, 5x, já aceito no M1). O maior depois dela é fusion_cell para supercomputer e subsea para fusion_cell, abaixo de 1,3x a 1,25x.
- Estágios: razões de 2,1x, 2,1x, 1,9x e 1,7x até Quantum Facility.
- **Salto real: Quantum Facility para Mega Corporation (64,6 min para 85,5 h).** Não há equipamentos acima de 5 tri de custo, então a produção estagna. Corrigir com equipamentos de Quantum Facility e Mega Corporation (fora deste briefing) ou com agentes e melhorias (T-023, T-024), e rever o limite de 1e18.
- O ritmo total (43 min para comprar tudo) ainda ignora agentes, melhorias, fórmula global e decisão do jogador; o M8 ajusta.

## Sugestão para P-02 (AG00)

Registrar: 25 equipamentos (5 por categoria) cobrindo até Corporate Network; fatores 1,15 a 1,25; desbloqueio igual a metade do custo; limites de estágio mantidos e documentados; pendente: itens de Quantum Facility e Mega Corporation e o limite de 1e18.
