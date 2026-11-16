# Árvore Quantum (T-039, BRF-055)

Valores provisórios: 13 nós em 3 caminhos, em `src/core/catalog/quantum.ts`; textos em `src/i18n/content/`. Custo do nível = `floor(base x fator^nível)`, mínimo 1. Grade: x para a direita, y para baixo; raízes perto de (0,0).

| Nó | Caminho | Pré-req. | Efeito por nível | Máx. | Base x fator | Custo total | Posição |
|---|---|---|---|---|---|---|---|
| alpha_core | alfa | - | +10 pp produção global | sem limite | 1 x 1,8 | 20 (5 níveis) | 0,-1 |
| alpha_overclock | alfa | alpha_core | +15 pp produção | 5 | 2 x 1,75 | 39 | 0,-2 |
| alpha_parallel | alfa | alpha_overclock | +25 pp produção | 5 | 4 x 1,75 | 81 | 0,-3 |
| alpha_singularity | alfa | alpha_parallel | +60 pp produção | 2 | 12 x 2 | 36 | 0,-4 |
| beta_input | beta | - | +25 pp clique | 6 | 1 x 1,8 | 38 | -1,1 |
| beta_neural | beta | beta_input | +100 pp clique | 3 | 6 x 2 | 42 | -2,0 |
| beta_crit | beta | beta_input | +2 pp chance de crítico | 5 | 2 x 1,75 | 39 | -2,2 |
| beta_crit_power | beta | beta_crit | +0,5 no multiplicador crítico | 4 | 4 x 1,75 | 44 | -3,3 |
| gamma_supply | gama | - | +1 pp desconto | 5 | 1 x 1,9 | 24 | 1,1 |
| gamma_contracts | gama | gamma_supply | +1 pp desconto | 5 | 4 x 1,75 | 81 | 2,2 |
| gamma_offline | gama | gamma_supply | +2 h limite offline | 4 | 2 x 1,75 | 21 | 2,0 |
| gamma_chrono | gama | gamma_offline | +8 h limite offline | 2 | 10 x 2 | 30 | 3,-1 |

## Ganho acumulado por caminho (tudo comprado)

- Alfa: +(10 x níveis do núcleo) +75 +125 +120 pp de produção global; com o núcleo em 5 níveis, +370 pp (a base de melhorias é +510 pp). Custo 176 cores.
- Beta: +150 pp e +300 pp de ganho por clique (+450); +10 pp de chance de crítico (5% base + 10 = 15%, teto D-13 de 25%); +2 no multiplicador crítico (base 5, vira 7). Custo 163.
- Gama: +10 pp de desconto; +8 h e +16 h = +24 h de limite offline (base 8 h, vira 32 h). Custo 156.

Total finito (núcleo em 5 níveis): 495 cores. Primeiro Reboot (cerca de 3 cores, D-15): uma raiz mais um ou dois níveis (alpha_core 1+1+3, beta_input 1+1, gamma_supply 1+1). Completar exige ordem de 8 a 10 Reboots completos (3, 10, 22, 38 e 59 cores por run na D-15; recompensas maiores nas runs mais longas).

## Notas

- Teto de desconto (D-13, 50 pp): melhorias dão 8 pp e o ATLAS_CORE passa de 40 pp em jogo avançado (ver `melhorias-m3.md`), então a árvore (+10 pp) só ajuda até o teto. Sugestão: se o AG00 quiser que o caminho gama valha mais, trocar pontos de desconto por offline ou reduzir o ATLAS_CORE.
- Todas as unidades de efeito seguem o tipo `Effect`; clique em percentual (não `clickFlat`), pois o flat do catálogo é de escala astronômica.
- Custos de crescimento 1,75 a 2 (faixa discutida na Bíblia 10.4, ainda não aprovada).
