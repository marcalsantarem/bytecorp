# Aceleradores do M4 (T-070, ajustado pela D-18)

Catálogo em `src/core/catalog/accelerators.ts`; textos em `src/i18n/content/`. Regras (um ativo, sem acúmulo, guardados não expiram, offline corre) em D-16 e na Bíblia 13.

## Tabela de concessões (D-18)

A D-18 substituiu a tabela original (5x a partir da Corporate Network, 2x/15 em cada Reboot), que adiantava a árvore em 57% a 65%. Tabela atual:

| Marco | Item | Economia máx. (min) |
|---|---|---|
| Garage Company | 2x / 15 min | 7,5 |
| Startup Lab | 2x / 15 min | 7,5 |
| Data Center | 2x / 30 min | 15 |
| Corporate Network | 2x / 15 min | 7,5 |
| Quantum Facility | 2x / 15 min | 7,5 |
| Mega Corporation | 2x / 30 min | 15 |
| Reboot | nenhuma (tabela vazia; o mecanismo `reboot` continua para eventos futuros) | 0 |

Os seis itens existem (2x e 5x, 15/30/60 min); os 5x e os de 60 min não são concedidos por marco e ficam livres para eventos, conquistas e anúncio recompensado (M5, M6, M9). Justificativa: com as runs tardias de 3 a 4 min, um 5x/15 cobria 3 a 4 runs; o 2x limita o ganho e a medição (resultado-qa-m4.md, seção 4) mostrou que a concessão de Reboot não pesava, então sai.

## Conta

Um acelerador m x por d min rende (m-1)·d min de produção extra, o que adianta a run em **d·(m-1)/m min** de relógio (economia máxima, se a janela cabe na run). 2x/15 = 7,5; 2x/30 = 15; 5x/15 = 12; 5x/30 = 24. Runs medidas (M3): run 1 de 74 min até Mega; Mega por run 74, 36, 29, 26, 19 min nas cinco primeiras; árvore completa em 10 Reboots, cerca de 4,3 h.

**Run 1 (74 min):** os cinco itens pré-Mega somam 54 min de economia máxima. Janelas encadeadas (15+15+30+15+15 = 90 min de relógio) cobrem a run toda, então o teto prático é a run cair de 74 min para cerca de 40 a 45 min (-40% a -45%) se o jogador encadear tudo sem pausa. Com uso típico (um item por estágio, os caros guardados para a run seguinte), estimo -15% a -25%.

**Árvore completa:** Reboots 2 a 10 usam 9 itens de 7,5 min = 67,5 min, mais 7,5+7,5+15+12+12+24 dos estágios (parte já contada na run 1): teto teórico de uns -45% dos 4,3 h se tudo for usado no melhor momento; típico, -25% a -30%. Como as runs 5 a 10 duram 13 a 19 min, um 2x/15 cobre quase a run inteira e economiza até 6 a 7 min (cerca de 40% dela).

## Justificativa

- Nunca menos que 2x/15 (mínimo permitido), por isso o Reboot é 2x/15: já é o item mais fraco, e 5x em Reboot economizaria até 80% de cada run tardia (as runs duram 13 a 36 min), quebrando a curva do M3. Divergência da sugestão do briefing (5x/30 a 5x/60 em Reboots): não recomendado.
- 5x só de Corporate Network em diante, quando o jogador já domina o ciclo e a run restante dura mais que a janela; Mega rende 5x/30 (consumido na run 2, que dura 36 min, vira uma run de uns 10 min: uma vez só).
- Aceleradores guardados não expiram, então o jogador escolhe o momento; nada exclusivo de pagamento.

## Não simulado

T-067 (aplicação na produção) ainda estava em andamento no AG01 quando isto foi escrito; tudo acima é conta, **não simulação** com o motor real. Sugestão: após a T-067, simular run 1 e a árvore com uso "ao receber" e "encadeado" e comparar com estas faixas. Alavanca se ficar forte: conceder no Reboot só a cada 2 Reboots (muda a regra da D-16) ou baixar o 2x/30 do Data Center para 2x/15.
