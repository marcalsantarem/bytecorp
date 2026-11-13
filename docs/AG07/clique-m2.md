# Peso do clique na curva do M2 (T-063, BRF-045, A-09)

Medido contra o motor real com o comprador guloso de `tests/helpers/curva.ts`, agora parametrizado por `clicksPerSecond` (padrão 1, sem mudar o teste de curva). Reproduzir: `CLIQUE_REPORT=1 [CLIQUE_PROPOSTAS=1] npx vitest run tests/clique-m2.test.ts --reporter=verbose` (cerca de 6 min com propostas; fora do `npm test`).

## Tempos por ritmo de cliques (catálogo atual)

| cliques/s | Startup Lab | Data Center | Corp. Network | Quantum Facility | Mega Corporation | desvio vs 1/s |
|---|---|---|---|---|---|---|
| 0 (*) | 8,0 min | 15,4 | 27,6 | 49,7 | 109,8 min | +48,5% |
| 0,5 | 8,0 | 15,4 | 27,6 | 47,8 | 87,6 min | +18,4% |
| 1 | 7,4 | 14,8 | 27,0 | 44,6 | 74,0 min | 0% |
| 2 | 6,7 | 13,6 | 25,6 | 40,4 | 61,2 min | -17,3% |
| 3 | 6,3 | 12,8 | 24,7 | 37,9 | 54,8 min | -25,9% |
| 5 | 5,9 | 11,8 | 23,4 | 35,5 | 48,9 min | -33,9% |
| 10 | 5,3 | 10,7 | 21,7 | 32,5 | 42,2 min | -43,0% |

(*) Com 0 cliques o jogo nunca sai do zero (começa com 0 Bytes), então a linha 0 usa 30 s iniciais a 1 clique/s e depois só produção passiva.

## Fatia da renda vinda dos cliques (acumulada, ao abrir cada estágio)

| cliques/s | Garage | Startup | Data Center | Corp. Network | Quantum | Mega |
|---|---|---|---|---|---|---|
| 0,5 | 1,5% | 0,0% | 0,0% | 0,0% | 16,2% | 45,2% |
| 1 | 4,2% | 0,1% | 0,0% | 0,1% | 31,6% | 65,6% |
| 2 | 8,3% | 0,2% | 24,6% | 0,2% | 46,8% | 81,6% |
| 5 | 16,5% | 0,4% | 51,6% | 0,6% | 67,1% | 92,4% |
| 10 | 26,0% | 4,4% | 67,7% | 1,2% | 78,8% | 96,4% |

A fatia é cumulativa e cai quando a produção salta (Corp. Network), sobe quando uma luva de clique é comprada (Data Center a 2/s ou mais, onde `haptic_gloves` já foi comprada antes de abrir o estágio).

## Compras de clique por ritmo (minuto da compra)

| cliques/s | macro_script | ergonomic_keys / echo_ai / haptic_gloves | neural_macro | quantum_gloves | neural_overdrive |
|---|---|---|---|---|---|
| 0,5 | 10,3 | 29,5 | 33,3 | 38,9 | 58,2 |
| 1 | 1,7 | 16,1 | 20,5 | 36,6 | 54,6 |
| 2 | 0,5 | 11,7 | 12,6 | 34,8 | 49,8 |
| 3 | 0,35 | 11,0 | 11,1 | 33,8 | 46,8 |
| 5 | 0,23 | 10,5 | 10,6 | 32,5 | 43,6 |
| 10 | 0,12 | 4,2 (ergonomic_keys e neural_macro); 9,8 (echo_ai, haptic) | 4,2 | 30,8 | 39,5 |

Com 0 cliques nenhuma delas é comprada e `echo_ai` (agente de clique) nunca é contratado. Em todos os ritmos acima de 0 o `echo_ai` chega ao nível 29 ou 30.

## Leitura

- A faixa de 64 a 86 min vale para cerca de 0,5 a 2 cliques/s com folga mínima (87,6 a 0,5/s já passa). Quem clica 5/s termina em 48,9 min (limite de 50 quase tocado) e quem clica 10/s em 42,2 min: **limite de 50 min ultrapassado** a 10/s.
- Sem clicar: 109,8 min, dentro do limite de 130 min. O jogo idle funciona, mas só com a partida inicial; a +48% sobre o ritmo de referência.
- A causa é o peso dos `clickFlat` grandes: a 1/s os cliques já são 65,6% da renda total ao abrir Mega (e 31,6% ao abrir Quantum); a 10/s são 96%. O clique deixa de ser complemento e vira a fonte principal, contra a Bíblia 1.3 e 4.1 (produção passiva central).
- Faixa total 0 a 10 cliques/s: 109,8 a 42,2 min (razão 2,6x). Alvo desejável: razão perto de 1,6x ou menos.

## Propostas (cópias do catálogo; desvio vs catálogo atual a 1/s = 74,0 min)

Todas medidas nos mesmos ritmos (histórico T-063; o resultado final aplicado está no fim do documento). "clickFlat grandes" são `haptic_gloves`, `quantum_gloves`, `neural_overdrive`.

| cliques/s | atual | P1: clickFlat x0,5 | P2: clickFlat x0,25 | P3: clickFlat x0,1 | P4: clickFlat x0,5 + produção global das melhorias x1,15 | P5: clickFlat x0,25 + produção global x1,3 |
|---|---|---|---|---|---|---|
| 0 | 109,8 | 109,8 | 109,8 | 109,8 | 104,7 | 100,0 |
| 0,5 | 87,6 | 98,8 | 104,9 | 108,5 | 94,2 | 95,6 |
| 1 | 74,0 | 86,6 | 97,8 | 105,4 | 82,8 | 89,4 |
| 2 | 61,2 | 73,0 | 85,6 | 99,6 | 70,1 | 78,1 |
| 3 | 54,8 | 65,5 | 78,1 | 93,5 | 62,9 | 71,4 |
| 5 | 48,9 | 57,0 | 68,0 | 84,9 | 54,7 | 62,8 |
| 10 | 42,2 | 48,0 | 56,4 | 71,5 | 46,3 | 52,0 |

Leitura das propostas:

- Só reduzir os `clickFlat` (P1 a P3) tira o 10/s da zona de risco (P1 já 48,0 min, P2 56,4 min), mas empurra a referência de 1/s para fora da faixa de 64 a 86 min (P1: 86,6, no limite; P2: 97,8). Seria preciso recompensar a perda com produção.
- **P5** (clickFlat x0,25 mais produção global x1,3) é a que melhor comprime a faixa: 100,0 a 52,0 min (razão 1,9x), 10/s acima de 50 min, 0 cliques em 100 min. Mas 1/s fica em 89,4 (fora de 64 a 86): o ganho de produção precisa subir um pouco (algo como x1,45 nas melhorias de produção) ou o custo de equipamentos tardios cair.
- **P4** (x0,5 e produção x1,15) deixa 1/s em 82,8 (dentro da faixa), 10/s em 46,3 (ainda abaixo de 50) e 0 cliques em 104,7. É o ajuste mais barato, porém só resolve metade do problema do 10/s.
- Não medido: trocar parte dos `clickFlat` por `clickPercent` (o percentual cresce com a produção e tende a não resolver o excesso de renda do clique rápido).

## Recomendação

O limite de 50 min a 10/s foi ultrapassado (42,2 min); a 5/s está no limite (48,9). A curva **não** resiste a quem clica muito rápido, mas resiste a quem não clica (109,8 min) e a quem clica de 0,5 a 2/s. Recomendação: partir de **P5** e subir o bônus de produção global das melhorias (retunar de x1,3 para cerca de x1,45) para recolocar 1/s perto de 75 min, medindo de novo; o resultado esperado é 0 cliques perto de 95 min e 10/s perto de 50 min. Se preferir mexer menos: P4, aceitando 10/s em 46 min. A decisão é do usuário; nada foi alterado no catálogo.

---

# Resultado final (T-064, BRF-046): P5 recalibrada aplicada

Aplicado no catálogo real. Valores: `clickFlat` grandes **×0,1** (não ×0,25, ver abaixo): `haptic_gloves` 300.000 para 30.000, `quantum_gloves` 3e10 para 3e9, `neural_overdrive` 6e12 para 6e11. Produção global das melhorias (pp): `overclock_basic` 5 para 10, `task_scheduler` 10 para 21, `distributed_cache` 15 para 32, `load_balancer` 30 para 85, `quantum_scheduler` 25 para 60, `photonic_bus` 30 para 70, `entangled_cache` 35 para 74, `orbital_orchestrator` 45 para 95, `singularity_core` 30 para 63 (soma +510 pp, antes +245; fator médio ×2,1). Custos, desbloqueios, ids, `macro_script`, `overclock_basic` (custo) e requisitos de equipamentos e agentes inalterados.

## Por que não ×0,25 com ×1,45 (como na P5 estimada)

Com `clickFlat` ×0,25 a estimativa de ×1,45 não se confirmou: mediu-se 85,6 min a 1/s (60,3 a 5/s, 50,0 a 10/s). Para 1/s em 70 a 80 min com ×0,25 é preciso ×1,8 a 2,2, e aí 10/s cai para 46,1 a 42,5 min (abaixo de 50). Com ×0,25 o 1/s e o 10/s não cabem juntos só pela produção das melhorias; reduzir o peso do clique mais (×0,1) é a segunda alavanca.

Varredura (min até Mega; fator de produção x `clickFlat`):

| clickFlat | produção | 0/s | 1/s | 5/s | 10/s |
|---|---|---|---|---|---|
| ×0,25 | ×1,45 | 95,8 | 85,6 | 60,3 | 50,0 |
| ×0,25 | ×1,8 | 87,3 | 78,2 | 55,4 | 46,1 |
| ×0,25 | ×2,2 | 79,4 | 71,2 | 50,8 | 42,5 |
| ×0,1 | ×1,8 | 87,3 | 83,8 | 68,0 | 57,9 |
| ×0,1 | ×2,0 | 83,1 | 79,8 | 64,8 | 55,1 |
| ×0,05 | ×1,8 | 87,3 | 85,6 | 76,7 | 67,5 |
| ×0,15 | ×2,0 | 83,1 | 78,0 | 59,7 | 50,0 |

Ajuste fino: o fator ×2,1 aplicado de forma uniforme dava 77,9 min a 1/s, mas deixava uma espera de 216 s antes de `absolute_zero_chamber` (limite 200 s). Deslocar peso para `load_balancer` (85) e `quantum_scheduler`/`photonic_bus` (60 e 70) baixou a espera para 3,3 min e o total para 74,3 min.

## Tempos por ritmo de cliques (catálogo final, motor real)

| cliques/s | Startup Lab | Data Center | Corp. Network | Quantum Facility | Mega Corporation | desvio vs 1/s | meta |
|---|---|---|---|---|---|---|---|
| 0 (*) | 7,8 min | 14,2 | 23,8 | 38,3 | 77,3 min | +4,1% | até cerca de 110: ok |
| 0,5 | 7,8 | 14,2 | 23,8 | 38,3 | 76,5 min | +3,0% | |
| 1 | 7,2 | 13,6 | 23,2 | 37,7 | **74,2 min** | 0% | 70 a 80: ok |
| 2 | 6,5 | 12,9 | 22,6 | 37,0 | 70,2 min | -5,4% | |
| 3 | 6,1 | 12,6 | 22,2 | 36,1 | 66,3 min | -10,6% | |
| 5 | 5,7 | 12,1 | 21,7 | 34,7 | 60,4 min | -18,6% | mínimo 55: ok |
| 10 | 5,0 | 11,3 | 20,9 | 32,4 | 51,5 min | -30,6% | mínimo 50: ok |

(*) 30 s iniciais a 1 clique/s, depois só produção passiva. Antes: 109,8 a 42,2 min (razão 2,6x); agora 77,3 a 51,5 min (razão 1,5x). Mega a 1/s: 74,2 min no relatório de curva e 74,3 na tabela por ritmo (arredondamentos da mesma run).

## Fatia da renda dos cliques (acumulada, ao abrir cada estágio)

| cliques/s | Garage | Startup | Data Center | Corp. Network | Quantum | Mega |
|---|---|---|---|---|---|---|
| 0 | 0,3% | 0,0% | 0,0% | 0,0% | 0,0% | 0,0% |
| 0,5 | 1,5% | 0,0% | 0,0% | 0,0% | 0,0% | 4,2% |
| 1 | 4,2% | 0,1% | 0,0% | 0,0% | 0,0% | 10,5% |
| 2 | 8,3% | 0,2% | 0,0% | 0,0% | 0,0% | 21,9% |
| 3 | 11,3% | 0,3% | 0,0% | 0,0% | 8,8% | 31,5% |
| 5 | 16,7% | 0,4% | 0,0% | 0,0% | 17,6% | 45,9% |
| 10 | 26,4% | 4,5% | 13,6% | 0,1% | 31,5% | 65,6% |

Ao abrir Quantum Facility e Mega a 1/s: 0,0% e 10,5% (antes 31,6% e 65,6%). A 10/s: 31,5% e 65,6% (antes 78,8% e 96,4%): o clique volta a ser complemento para quem clica pouco e fica forte, sem dominar, para quem clica muito.

## Compras de clique (minuto)

| cliques/s | macro_script | ergonomic_keys / neural_macro | haptic_gloves (e echo_ai) | quantum_gloves | neural_overdrive |
|---|---|---|---|---|---|
| 0,5 | 9,8 | 32,0 | 46,6 | 55,4 | 55,7 |
| 1 | 104 s | 28,8 | 30,0 | 49,4 | 49,9 |
| 2 | 28 s | 23,9 | 27,0 | 45,3 | 46,1 |
| 5 | 14 s | 10,1 | 16,1 | 29,3 | 41,5 |
| 10 | 7 s | 4,0 | 9,7 | 27,6 | 38,9 |

`echo_ai` chega aos níveis 27 a 29 (todos os ritmos acima de 0). Com 0 cliques nenhuma compra de clique acontece.

## Como reproduzir

`CLIQUE_REPORT=1 npx vitest run tests/clique-m2.test.ts -t tempos --reporter=verbose` (cerca de 1,5 min). Calibrar: `CLIQUE_REPORT=1 CLIQUE_PROPOSTAS=PK CLIQUE_K=<fator de produção> CLIQUE_F=<fator de clickFlat> CLIQUE_RATES=0,1,5,10 npx vitest run tests/clique-m2.test.ts -t propostas --reporter=verbose` (cópia do catálogo; mede o catálogo atual como base, então os valores de CLIQUE_K/F são relativos ao catálogo final).

## Texto sugerido para P-06 (AG00 registra em `docs/decisoes.md`)

**P-06**
> Peso do clique (A-09, T-064): `clickFlat` grandes das melhorias reduzidos a 10% (`haptic_gloves` +30.000, `quantum_gloves` +3e9, `neural_overdrive` +6e11) e produção global das melhorias elevada (soma +510 pp, antes +245), sem alterar custos. Primeira run a 1 clique/s: 74 min (alvo D-13: 75 min, faixa 64 a 86). Faixa por ritmo: 0/s 77 min (30 s iniciais), 5/s 60 min, 10/s 51,5 min. Fatia da renda por cliques ao abrir Mega a 1/s: 10,5% (antes 65,6%). Valores provisórios; 10/s tem margem de apenas 1,5 min sobre o limite de 50 min.
