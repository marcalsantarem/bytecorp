# Equipamentos de Quantum Facility e Mega Corporation (M2, provisório)

**T-062 (BRF-044):** valores abaixo já reequilibrados. Os cinco itens de Quantum Facility custam 1/4 do original (3e14 a 8e14, desbloqueio 1,5e14 a 4e14), com fator 1,3 e produção de 1/30 a 1/20 do original; os de Mega Corporation mantêm custo e desbloqueio, com produção cerca de 1/8. A simulação e as razões desta página (sem agentes nem melhorias, produção original) deixaram de valer: a curva atual está em `curva-m2.md`.

BRF-039, T-052. Os 25 equipamentos de `equipamentos-m2.md` ficam como estão. Total: 35, sete por categoria.

## Novos equipamentos

Todos com fator de custo 1,25 (Quantum Facility) ou 1,28 (Mega Corporation), desbloqueio igual à metade do custo (`bytesEarnedInRun`) e revelação por `stageReached` do próprio estágio. Produção/custo entre 0,0115 e 0,012.

| Id | Categoria | Estágio | Custo base | Produção/s | Desbloqueio | Ícone |
|---|---|---|---|---|---|---|
| absolute_zero_chamber | cooling | Quantum | 3e14 | 6e11 | 1,5e14 | wind |
| quantum_relay | networking | Quantum | 4e14 | 8,2e11 | 2e14 | satellite-dish |
| antimatter_reactor | infrastructure | Quantum | 5e14 | 1e12 | 2,5e14 | radiation |
| crystal_vault | storage | Quantum | 6e14 | 1,2e12 | 3e14 | gem |
| qubit_array | processing | Quantum | 8e14 | 1,6e12 | 4e14 | microchip |
| stellar_sink | cooling | Mega | 1,5e18 | 2,2e15 | 7,5e17 | sun-snow |
| planetary_mesh | networking | Mega | 2e18 | 2,9e15 | 1e18 | satellite |
| dyson_swarm | infrastructure | Mega | 2,5e18 | 3,6e15 | 1,25e18 | sun-medium |
| eternal_archive | storage | Mega | 3e18 | 4,2e15 | 1,5e18 | infinity |
| hive_mind | processing | Mega | 4e18 | 5,8e15 | 2e18 | brain |

## Estágios

Limites revistos e mantidos (1e4, 1e6, 1e9, 1e12, 1e15, 1e18): com itens próprios nos dois últimos estágios, o 1e18 deixa de ser inalcançável e a razão fica coerente. Lógica documentada em `stages.ts`.

## Simulação

`node tools/simular-equipamentos.mjs` (1 clique/s, compra gananciosa, sem melhorias nem agentes).

| Estágio | Bytes na run | Tempo | Razão |
|---|---|---|---|
| Garage Company | 1e4 | 4,5 min | |
| Startup Lab | 1e6 | 9,4 min | 2,1x |
| Data Center | 1e9 | 19,8 min | 2,1x |
| Corporate Network | 1e12 | 37,1 min | 1,9x |
| Quantum Facility | 1e15 | 65,3 min | 1,8x |
| Mega Corporation | 1e18 | 108,1 min | 1,7x |

Primeiras unidades novas: orbital_plant 43,1 min; antimatter_reactor 89,4; quantum_relay 90,4; qubit_array 91,6; absolute_zero_chamber 91,9; crystal_vault 92,3; planetary_mesh, stellar_sink, dyson_swarm, hive_mind 2,1 h; eternal_archive 2,2 h.

## Saltos

- Maior razão entre primeiras unidades: orbital_plant para antimatter_reactor, 2,07x (abaixo de 2,5x). Depois, no máximo 1,4x.
- Os cinco itens de Quantum Facility chegam 24 min depois de o estágio abrir (65 para 89 min), pois a produção vem só de itens até 5 tri; é o ponto a vigiar no M8.
- Sem salto de horas como antes (64,6 min para 85,5 h).

## Melhorias

As 12 melhorias vão só até Quantum Facility; faltam melhorias de Mega Corporation (desbloqueios e efeitos de produção e clique para o último estágio). Não criadas nesta task.

## Sugestão para P-02 (AG00)

Registrar: 35 equipamentos (7 por categoria) cobrindo até Mega Corporation; fatores 1,15 a 1,28; desbloqueio igual a metade do custo; limites de estágio de 1e4 a 1e18 mantidos, com razões de 1,7x a 2,1x na simulação (sem agentes nem melhorias); pendente: melhorias de Mega Corporation e revisão no M8.
