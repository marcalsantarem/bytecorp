# Curva do M2 reequilibrada (T-062, BRF-044)

Alvo: a primeira run completa (começo até Mega Corporation, com agentes e melhorias) em cerca de 75 min, tolerância de 15% (64 a 86 min). Resultado contra o **motor real** (`GameEngine` + `CATALOG`): **74,0 min**.

## Como se mede

- `tests/helpers/curva.ts`: comprador guloso sobre o `GameEngine` real, em tempo virtual (`advance`). 1 clique por segundo com o crítico real (semente fixa), compra equipamentos, contrata e evolui agentes e compra melhorias. Escolhe o item de menor `espera + custo / ganho de renda efetiva` (o desconto conta como renda) e junta o saldo. Para ao chegar em Mega Corporation (ou em 4 h).
- `tests/curva-m2.test.ts`: o teste de curva. Falha se Mega Corporation sair de 64 a 86 min, se alguma razão entre estágios passar de 2,5x, se algum intervalo sem compra passar de 200 s, se algum agente não for contratado, se o desconto final ficar abaixo de 60% do teto ou o desconto ao abrir Quantum Facility passar de 80% dele, ou se mais de 3 melhorias nunca forem compradas. Custa cerca de 8 s em um worker próprio (o `npm test` inteiro leva cerca de 16 s).
- Relatório completo e sensibilidade: `CURVA_REPORT=1 npx vitest run tests/curva-m2.test.ts --reporter=verbose` (o vitest esconde o console de testes que passam; a sensibilidade são 16 simulações, cerca de 4 min).
- `node tools/simular-curva.mjs` continua como aproximação rápida e analítica (agora com os tetos da D-13); dá 79,7 min, 8% acima do motor real.

Nota: o comprador foi melhorado (antes, só menor retorno; agora também pesa a espera). Por isso o "antes" abaixo foi rodado de novo com o comprador novo sobre o catálogo antigo.

## Antes e depois

| Estágio | Antigo (tool, doc de QA) | Antigo (motor real, comprador novo, tetos D-13) | Novo (motor real) | Razão (novo) | Desconto ao abrir (novo) |
|---|---|---|---|---|---|
| Garage Company | 4,3 min | 3,8 min | 3,8 min | | 0,0% |
| Startup Lab | 9,0 | 7,4 | 7,4 | 1,93 | 1,0% |
| Data Center | 15,4 | 12,4 | 14,8 | 2,00 | 2,5% |
| Corporate Network | 17,9 | 14,6 | 27,0 | 1,82 | 10,0% |
| Quantum Facility | 18,6 | 15,4 | 44,6 | 1,65 | 21,9% |
| Mega Corporation | 18,7 | 15,8 | **74,0** | 1,66 | 45,0% |

Sem agentes e melhorias, a curva nova passa de 4 h (o limite da simulação): ela depende dos bônus como a antiga dependia, mas agora eles não zeram o jogo. Só melhorias: 2,4 h. Só agentes: 2,8 h.

### Agentes (primeira contratação, motor real)

| Agente | Antes | Depois | Quantidade e nível no fim |
|---|---|---|---|
| ECHO_AI | 18,6 min (3 un.) | 16,1 min | 46 un., nível 29 |
| KAI_VER_3 | 10,5 min | 10,3 min | 65 un., nível 29 |
| ATLAS_CORE | 16,6 min | 17,9 min | 53 un., nível 23 |
| NEO_GEN_5 | 18,3 min | 29,9 min | 34 un., nível 15 |
| SPECTRE_X | nunca | 54,6 min | 20 un., nível 7 |

Desconto efetivo ao fim: 45,0% (teto 50). Chance de crítico: 21,0% (teto 25%).

### Melhorias (quando entram, motor real)

18 das 20 são compradas: macro_script 1,7 min, overclock_basic 3,6, bulk_discount 6,2, task_scheduler 7,3, supplier_contract 13,2, distributed_cache 13,9, ergonomic_keys 16,1, haptic_gloves 16,1, neural_macro 20,5, corporate_volume 23,9, load_balancer 25,6, quantum_scheduler 37,0, quantum_gloves 36,6, photonic_bus 38,8, facility_contract 55,0, entangled_cache 55,3, neural_overdrive 54,6, orbital_orchestrator 59,5. As duas que ficam de fora, `megacorp_charter` (5e17) e `singularity_core` (3e18), são itens de Mega Corporation: o jogo passa a ter o que comprar depois de chegar lá. Antes eram 9 sem compra (as 5 de clique mais 4 caras).

Retorno de cada compra (custo / ganho): de 42 s a 3,8 min, exceto `neural_macro` (2,4 min) e `orbital_orchestrator` (5,7 min). Agentes: KAI 69 s, ATLAS 107 s, NEO 2,2 min.

### Metas do briefing

| Meta | Resultado |
|---|---|
| 64 a 86 min | 74,0 min |
| Razões de 1,7x a 2,1x (até cerca de 2,5x) | 1,93, 2,00, 1,82, 1,65, 1,66. As duas últimas ficam 3% abaixo de 1,7: o preço de manter ATLAS e as melhorias de produção úteis até o fim; sem passar de 2,0 |
| Nenhum trecho parado acima de cerca de 3 min | maior espera 3,0 min (até `absolute_zero_chamber`, aos 42 min); depois 2,5 min (`neural_overdrive`, 55 min) |
| ECHO_AI e SPECTRE_X contratados e úteis | sim, aos 16 e 55 min; ECHO soma 46 unidades; SPECTRE leva a chance de 5% para 21% |
| Poucas melhorias sem compra | 2 de 20, ambas de Mega Corporation |
| Desconto perto do teto só no fim | 22% ao abrir Quantum Facility, 45% no fim |
| Todo item se paga em tempo razoável | pior caso 5,7 min (melhoria) e 2,2 min (agente) |

## O que foi alterado

Mantidos: todos os ids; os 5 equipamentos originais, `wifi_mesh`, `echo_ai`/`kai_ver_3` (revelação 3.000 B), `macro_script` e `overclock_basic`; os limites de estágio e os requisitos de estágio dos agentes.

### Equipamentos (produção em B/s, custo e fator)

| Id | Custo | Fator | Produção | Retorno (custo/produção) |
|---|---|---|---|---|
| subsea_backbone | 3e9 | 1,25 | 3,6e7 para 2,9e7 | 83 s para 103 s |
| fusion_cell | 4e9 | 1,25 | 4,8e7 para 3,8e7 | 83 s para 105 s |
| supercomputer | 6e10 | 1,25 | 7,2e8 para 5,8e8 | 83 s para 103 s |
| orbital_radiator | 4e11 | 1,25 | 5e9 para 4e9 | 80 s para 100 s |
| holo_archive | 1,5e12 | 1,25 | 1,8e10 para 5,9e9 | 83 s para 254 s |
| orbital_plant | 5e12 | 1,25 | 5,5e10 para 1,8e10 | 91 s para 278 s |
| absolute_zero_chamber | 1,2e15 para 3e14 | 1,25 para 1,3 | 1,4e13 para 6e11 | 86 s para 500 s |
| quantum_relay | 1,6e15 para 4e14 | 1,25 para 1,3 | 1,9e13 para 8,2e11 | 84 s para 488 s |
| antimatter_reactor | 2e15 para 5e14 | 1,25 para 1,3 | 2,4e13 para 1e12 | 83 s para 500 s |
| crystal_vault | 2,4e15 para 6e14 | 1,25 para 1,3 | 2,8e13 para 1,2e12 | 86 s para 500 s |
| qubit_array | 3,2e15 para 8e14 | 1,25 para 1,3 | 3,8e13 para 1,6e12 | 84 s para 500 s |
| stellar_sink | 1,5e18 | 1,28 | 1,8e16 para 2,2e15 | 83 s para 682 s |
| planetary_mesh | 2e18 | 1,28 | 2,4e16 para 2,9e15 | 83 s para 690 s |
| dyson_swarm | 2,5e18 | 1,28 | 3e16 para 3,6e15 | 83 s para 694 s |
| eternal_archive | 3e18 | 1,28 | 3,5e16 para 4,2e15 | 86 s para 714 s |
| hive_mind | 4e18 | 1,28 | 4,8e16 para 5,8e15 | 83 s para 690 s |

Os cinco itens de Quantum Facility custam 1/4 (e o desbloqueio também, de 1,5e14 a 4e14 Bytes na run): sem isso havia um buraco de 5 min entre `orbital_plant` e o primeiro item do estágio. O retorno "nominal" parece alto (500 s), mas com o multiplicador global de 3 a 4x e o desconto de 20 a 45% o retorno efetivo fica em cerca de 1,5 a 2 min. Os itens de Mega Corporation não entram na run (custam mais do que os 1e18 gerados que a abrem); a produção deles foi reduzida na mesma proporção para o pós-Mega não ficar mais barato que o fim do Quantum.

### Agentes

| Agente | Valor por agente | Crescimento/nível | Fator de custo | Fator do nível | Custo base |
|---|---|---|---|---|---|
| ECHO_AI | +5 para +3 (clickPercent) | 0,5 para 0,25 | 1,25 para 2 | 1,8 para 3 | 1.500 |
| KAI_VER_3 | +2 para +0,2 (D-13) | 0,5 para 0,25 | 1,25 para 1,5 | 1,8 para 2,5 | 60.000 |
| ATLAS_CORE | +0,4 para +0,35 | 0,1 para 0,05 | 1,25 para 1,5 | 1,8 para 2,5 | 40.000.000 |
| NEO_GEN_5 | +5 para +0,5 (D-13) | 0,5 para 0,25 | 1,25 para 1,5 | 1,8 para 2,5 | 30.000.000.000 |
| SPECTRE_X | +0,3 para +0,5 | 0,1 | 1,25 para 1,5 | 1,8 para 2,5 | 5e13 para 2e13 |

### Melhorias

| Melhoria | Antes | Depois |
|---|---|---|
| neural_macro | clickFlat +10 | clickFlat +30 |
| haptic_gloves | clickPercent +100, custo 1,5e5 (desbloqueio 7,5e4) | clickFlat +300.000, custo 5e7 (desbloqueio 2,5e7) |
| load_balancer | +25 produção | +20 |
| quantum_scheduler | +40 | +25 |
| photonic_bus | +50 | +30 |
| quantum_gloves | clickPercent +200, custo 2e14 (1e14) | clickFlat +3e10, custo 3,5e13 (1,75e13) |
| entangled_cache | +60 | +35 |
| neural_overdrive | clickFlat +100.000, custo 2e16 (1e16) | clickFlat +6e12, custo 1e16 (5e15) |
| orbital_orchestrator | +80, custo 1e17 (5e16) | +45, custo 4e16 (2e16) |
| singularity_core | +120 | +60 |

Produção global das melhorias: +405 para +245 pp. Desconto das melhorias: 8 pp (inalterado). Textos de descrição em pt-BR e en acompanham os valores. A lista voltou à ordem de custo (`haptic_gloves` depois de `supplier_contract`; `quantum_gloves`, 3,5e13, antes de `photonic_bus`, 4e13).

Por que os efeitos de clique foram trocados: com os valores antigos de `clickFlat`, o clique some diante da produção a partir de uns 10 min; sem clique relevante, ECHO_AI e SPECTRE_X nunca valem a compra (diagnóstico do QA). Os novos valores de `clickFlat` sobem com a renda (+30 aos 20 min, +300.000 aos 16, +3e10 aos 37, +6e12 aos 55) para o clique continuar contando; só `ergonomic_keys` fica em percentual. A fatia exata do clique na renda não foi medida. Consequência a avaliar: quem clica mais de uma vez por segundo leva vantagem proporcional.

## Sensibilidade (cada alavanca mudada em 20%, uma por vez; base 74,0 min)

| Alavanca | +20% | -20% |
|---|---|---|
| Produção dos equipamentos caros (custo a partir de 1,3e5) | 65,9 min (-10,9%) | 85,6 min (+15,7%) |
| Custo dos equipamentos caros | 81,2 min (+9,7%) | 66,1 min (-10,6%) |
| Bônus de clique (flat e %, melhorias e ECHO_AI) | 67,7 min (-8,4%) | 82,0 min (+10,8%) |
| Bônus de produção das melhorias | 69,9 min (-5,5%) | 78,7 min (+6,4%) |
| Bônus de produção dos agentes (KAI e NEO) | 71,0 min (-3,9%) | 77,5 min (+4,8%) |
| Desconto (ATLAS e melhorias) | 72,2 min (-2,4%) | 75,4 min (+2,0%) |
| Custo das melhorias | 75,9 min (+2,6%) | 71,9 min (-2,8%) |
| Custo dos agentes | 75,1 min (+1,5%) | 72,8 min (-1,6%) |

Leitura: a curva depende sobretudo da economia dos equipamentos caros e dos cliques; agentes e custos de agentes e de melhorias mexem pouco (até 5%), o que deixa espaço de ajuste fino sem quebrar o alvo (uma mudança de 20% em qualquer alavanca isolada mantém a run entre 65 e 86 min). Cuidado: o bônus de clique mexe 8 a 11%, mais do que o de produção dos agentes, então o ganho por clique é uma decisão de design que pesa no tempo.

## Limitações

- Comprador guloso com 1 clique/s, sem Quantum, boosts nem eventos; um jogador real ganha ou perde minutos conforme clica mais ou compra pior. O teste protege a curva, não prevê o tempo humano.
- Semente fixa do crítico: o teste é determinístico. Outro valor muda o resultado em segundos.
- O nível de ECHO_AI (46 unidades nível 29) e o de KAI (65, nível 29) vêm de custos muito baixos frente à renda no fim; se parecer exagerado na UI, subir o fator de custo.
- Os trechos parados de 2 a 3 min acontecem na transição entre tiers (supercomputer, primeiro item de Quantum, neural_overdrive). Seriam eliminados com um equipamento a mais entre 5e12 e 3e14; não foi criado porque o escopo era valores, não itens.

## Sugestões de texto para `docs/decisoes.md` (não editado)

**P-02**
> 35 equipamentos (7 por categoria) cobrindo até Mega Corporation, fatores de 1,15 a 1,3, desbloqueio igual à metade do custo base; limites de estágio de 1e4 a 1e18 mantidos. T-062: a produção dos 16 equipamentos com custo a partir de 3e9 foi reduzida (retorno nominal de 83 s para 100 a 700 s) e os 5 de Quantum Facility custam 1/4 com fator 1,3, para a primeira run completa (com agentes e melhorias) durar cerca de 74 min no motor real, com estágios em 3,8, 7,4, 14,8, 27, 44,6 e 74 min (razões de 1,65 a 2,0). Protegido por `tests/curva-m2.test.ts` (64 a 86 min). Detalhes em `docs/AG07/equipamentos-m2.md`, `equipamentos-m3.md` e `curva-m2.md`. Pendente: revisão no M8, trechos parados de até 3 min entre tiers.

**P-03**
> 5 agentes (ECHO_AI, KAI_VER_3, ATLAS_CORE, NEO_GEN_5, SPECTRE_X), custo de contratação com fator 1,5 (ECHO_AI 2) e de nível com 2,5 (ECHO_AI 3). Valores por agente: ECHO +3 pp de clique; KAI +0,2 e NEO +0,5 pp de produção (D-13); ATLAS +0,35 pp de desconto; SPECTRE_X +0,5 pp de chance de crítico; crescimento por nível 0,25 (ATLAS 0,05; SPECTRE 0,1). Tetos da D-13 (desconto 50 pp, crítico 25%). Na simulação do motor real todos são contratados (10, 16, 18, 30 e 55 min) e o desconto chega a 45% no fim. Detalhes em `docs/AG07/agentes-m2.md`.

**P-05**
> 20 melhorias comuns (9 de produção global, 6 de clique, 5 de desconto), custo igual a 2x o desbloqueio, de 50 a 3e18 Bytes. T-062: produção global soma +245 pp (antes +405; na T-064 passou a +510 pp e os `clickFlat` grandes caíram a 10%: +30.000, +3e9 e +6e11, ver `clique-m2.md`); desconto das melhorias 8 pp (inalterado); `clickFlat` das melhorias de clique escala com a renda (+30, +300.000, +3e10, +6e12) para o clique seguir relevante, o que beneficia quem clica mais de uma vez por segundo. 18 das 20 são compradas na simulação; `megacorp_charter` e `singularity_core` ficam para depois de Mega Corporation. Detalhes em `melhorias-m2.md`, `melhorias-m3.md` e `curva-m2.md`.

## T-064 (BRF-046, A-09): P5 recalibrada

Peso do clique reduzido e produção das melhorias elevada; detalhes e tabelas por ritmo em `clique-m2.md`. Resultado contra o motor real a 1 clique por segundo: **74,3 min** (faixa 64 a 86 min do teste).

| Estágio | T-062 (74,0 min) | T-064 | Razão (T-064) | Desconto ao abrir |
|---|---|---|---|---|
| Garage Company | 3,8 min | 3,8 min | | 0,0% |
| Startup Lab | 7,4 | 7,2 | 1,89 | 1,0% |
| Data Center | 14,8 | 13,6 | 1,89 | 2,5% |
| Corporate Network | 27,0 | 23,2 | 1,71 | 10,0% |
| Quantum Facility | 44,6 | 37,7 | 1,62 | 21,9% |
| Mega Corporation | 74,0 | **74,2** | 1,97 | 44,2% |

Maior espera sem compra: 3,3 min (até `absolute_zero_chamber`, ao abrir Quantum), dentro do limite de 200 s (o teste passa). Todos os agentes são contratados (10,0; 16,1; 25,5; 30,0 e 49,9 min); 2 melhorias sem compra (`megacorp_charter`, `singularity_core`). `tests/curva-m2.test.ts` ganhou a verificação de que 10 cliques/s não cai abaixo de 50 min (cerca de 12 s).
