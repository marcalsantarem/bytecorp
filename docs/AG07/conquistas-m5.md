# Conquistas do M5 (T-078, BRF-083, D-20)

Catálogo em `src/core/catalog/achievements.ts` (`ACHIEVEMENTS`, ligado em `CATALOG.achievements` e no `validateCatalog`); textos em `src/i18n/achievements/` (`achievement.<id>.name|desc`, `hint` nas secretas). `BASE_CATALOG` (em `catalog/index.ts`) é o mesmo catálogo sem conquistas, para testes de saldo exato e curvas de referência. Testes e medição: `tests/conquistas-m5.test.ts` (relatório com `CONQUISTAS_REPORT=1`).

42 conquistas: 7 categorias, 13 bronze, 13 silver, 11 gold, 5 diamond; 6 secretas com pista.

## Regras de recompensa

- **Bytes** só em requisitos ligados ao progresso da execução (produção, equipamentos, agentes, estágios), com cerca de 5 a 15 s da produção do momento em que a conquista costuma sair.
- **Cliques não dão Bytes fixos** (só a primeira de cada série, valor simbólico): com Bytes medidos a 1 clique/s, quem clica 10/s recebia o prêmio cedo demais e Mega caía de 51,5 para 36,7 min. Dão bônus temporário, que é proporcional à produção.
- **Bônus temporários** de 1,05x ou 1,1x por 15 a 30 min; 1,25x nenhum (testado: 1,25x/15 no 5º Reboot tirava 3 min de uma run de 18). Teto do teste: 1,25x.
- **Quantum Cores** em toda a categoria Quantum, em Mega Corporation e em todas as Diamond (até 25).

## Tabela

Saída medida: simulação de 1 clique/s (curva-m2 e prestigio-m3), em minutos de jogo; "run 2+" = depois do 1º Reboot; "-" = não sai na árvore completa (4,1 h).

| id | Categoria | Raridade | Requisito | Recompensa | Sai em |
|---|---|---|---|---|---|
| prod_bytes_1k | production | bronze | 1 kB gerados no total | 50 B | 2,1 |
| prod_bytes_1m | production | bronze | 1 MB no total | 50 kB | 7,0 |
| prod_bps_1g | production | silver | 1 GB/s (sem temporários) | 5 GB | 19,7 |
| prod_bps_1t | production | silver | 1 TB/s | 5 TB | 30,1 |
| prod_bps_1p | production | gold | 1 PB/s | 1,1x / 15 min | 91 (run 2) |
| prod_all_10e | production | diamond | 10 EB no total | 10 Cores | 243 (fim da árvore) |
| clicks_100 | clicks | bronze | 100 cliques | 50 B | 1,6 |
| clicks_1000 | clicks | silver | 1.000 cliques | 1,05x / 15 min | 16,6 |
| clicks_5000 | clicks | gold | 5.000 cliques | 1,05x / 15 min | 83 (run 2) |
| clicks_15000 | clicks | diamond | 15.000 cliques | 10 Cores | - (pouco menos de 15 mil cliques no fim da árvore) |
| crit_10 | clicks | bronze | 10 críticos | 100 B | 3,2 |
| crit_500 | clicks | silver | 500 críticos | 1,05x / 15 min | 92 (run 2) |
| crit_2000 | clicks | gold, secreta | 2.000 críticos | 1,1x / 15 min | 243 |
| eq_10 | equipment | bronze | 10 equipamentos na execução | 50 B | 2,0 |
| eq_100 | equipment | bronze | 100 | 5 MB | 10,8 |
| eq_500 | equipment | silver | 500 | 5 TB | 30,2 |
| eq_1000 | equipment | gold | 1.000 | 300 TB | 61,3 |
| eq_router_50 | equipment | silver, secreta | 50 roteadores domésticos | 1,1x / 15 min | 60,0 |
| agent_first | agents | bronze | 1 agente | 500 kB | 9,7 |
| agents_distinct_3 | agents | silver | 3 agentes diferentes | 1,1x / 15 min | 24,6 |
| agents_distinct_5 | agents | gold | os 5 agentes | 80 TB | 46,9 |
| agent_level_25 | agents | gold | um agente no nível 25 | 40 TB | 42,2 |
| spectre_10 | agents | silver, secreta | SPECTRE_X nível 10 | 1,1x / 15 min | - (o guloso para em ~5; jogador que fica em Mega chega) |
| cores_run_10 | reboots | bronze | 10 Cores disponíveis numa execução | 50 MB | 14,9 |
| reboot_1 | reboots | bronze | 1 Reboot | 1,1x / 15 min | 69 (fim da run 1) |
| cores_run_50 | reboots | silver | 50 Cores numa execução | 100 TB | 50,4 |
| reboot_5 | reboots | gold | 5 Reboots | 1,1x / 30 min | 168 |
| reboot_10 | reboots | diamond | 10 Reboots | 10 Cores | 243 (último Reboot) |
| q_first | quantum | bronze | 1 nível na árvore | 1 Core | 69 |
| q_levels_25 | quantum | silver | 25 níveis | 3 Cores | 98 |
| q_cores_500 | quantum | gold | 500 Cores acumulados (em mãos + gastos) | 5 Cores | 230 |
| q_singularity | quantum | gold, secreta | nó alpha_singularity | 5 Cores | 149 |
| q_reset | quantum | silver, secreta | reiniciar a árvore | 2 Cores | - (a simulação não reinicia) |
| q_levels_50 | quantum | diamond | 50 níveis | 5 Cores | 216 |
| stage_garage | milestones | bronze | Garage Company | 500 B | 3,7 |
| stage_startup | milestones | bronze | Startup Lab | 50 kB | 7,0 |
| stage_datacenter | milestones | silver | Data Center | 20 MB | 13,3 |
| stage_corporate | milestones | silver | Corporate Network | 100 GB | 22,5 |
| stage_quantum | milestones | gold | Quantum Facility | 30 TB | 35,2 |
| stage_mega | milestones | gold | Mega Corporation | 3 Cores | 69,3 |
| play_1h | milestones | bronze, secreta | 1 h de jogo aberto | 1,1x / 15 min | 60,0 |
| play_24h | milestones | diamond | 24 h de jogo aberto | 25 Cores | - (Bíblia 11.5; 7, 30 e 365 dias ficam para o M8) |

Run 1: 25 conquistas (todas as bronze não secretas de execução, nenhuma diamond). Árvore completa: 38 de 42.

## Impacto medido na curva (motor real)

| Cenário | Sem conquistas | Com conquistas | Adianta |
|---|---|---|---|
| Run 1 até Mega, 1 clique/s | 74,3 min | 69,4 min | 6,6% |
| Run 1 até Mega, 10 cliques/s | 51,5 min | 46,9 min | 8,9% |
| Árvore completa (10 Reboots, Reboot ao abrir Mega) | 4,4 h | 4,1 h | 7,9% |

Runs da árvore com conquistas: 69,3, 29,0, 26,5, 23,8, 19,0, 16,1, 16,3, 16,4, 14,0, 13,0 min (sem: 74,3, 36,1, 29,0, 26,0, 19,2, 17,7, 17,7, 16,4, 14,0, 13,8). Continua em 10 Reboots. Cores de conquistas na árvore: 42 (contra cerca de 560 dos Reboots); 20 deles (prod_all_10e e reboot_10) saem com a árvore já completa.

Histórico do ajuste: a primeira versão (Bytes de 30 a 60 s de produção, bônus 1,25x) adiantava a run 1 em 14,4% e a árvore em 12,5%; os Bytes do começo da run pesam mais do que a conta linear sugere (reinvestidos, compõem).

## Pontos para o AG00

- **A-09 / D-14 (piso de 50 min a 10 cliques/s):** com conquistas, 46,9 min. Qualquer catálogo com bônus temporário fura o piso (só os Bytes já dão 51,0; sem nenhum bônus, a folga era de 1,5 min). Feito: o piso continua valendo para a curva sem conquistas (`curva-m2` passou a usar `BASE_CATALOG`) e o `conquistas-m5` exige, a 10 cliques/s, adiantamento de até 10% e Mega em 45 min ou mais. Alternativa: tirar os bônus da run 1 (só Bytes), o que deixa 10 cliques/s em cerca de 51 min e a run 1 de 1 clique/s em cerca de -3%, com conquistas de pouco peso.
- **Isolamento dos testes:** testes que medem saldo, cores ou bônus exatos e as curvas de referência (curva-m2, clique-m2, prestigio-m3, tempo-m4, m1 e m2 integration) usam `BASE_CATALOG`; a troca foi só no import (`BASE_CATALOG as CATALOG`), sem mudar valores esperados. O impacto das conquistas é medido só no `conquistas-m5`.
- Bytes de recompensa entram no saldo mas não em "gerados" (regra da T-077), então não encadeiam requisitos de produção.
