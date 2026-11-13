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

Todas medidas nos mesmos ritmos. "clickFlat grandes" são `haptic_gloves`, `quantum_gloves`, `neural_overdrive`.

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
