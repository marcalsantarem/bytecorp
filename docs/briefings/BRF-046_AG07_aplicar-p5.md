# BRF-046 · AG07 · Aplicar o ajuste P5 do peso do clique

- **Task:** T-064 (marco M2)
- **Dono:** AG07
- **Depende de:** T-063 (feita) e decisão A-09 (usuário escolheu a P5 recalibrada)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tests/`, `tools/`, `docs/AG07/`. **Autorização extra:** `src/ui/shop/ShopPanel.test.tsx`, `src/ui/agents/AgentsPanel.test.tsx` e `src/ui/components/iconMap.ts`, somente se uma asserção ou um ícone depender dos valores alterados (prefira não precisar).

## Objetivo

Reduzir o peso do clique na curva e compensar com mais produção passiva das melhorias, de modo que a run de 1 clique por segundo volte a cerca de 75 min e a run de 10 cliques por segundo não caia abaixo de 50 min.

## Contexto

`docs/AG07/clique-m2.md`: tabelas e propostas P1 a P5. A P5 deu, com ganhos fixos de clique ×0,25 e produção global das melhorias ×1,3: 100,0 min a 0 cliques por segundo, 89,4 a 1, 62,8 a 5 e 52,0 a 10; a recomendação foi subir a produção global das melhorias para cerca de ×1,45 para voltar a 1 por segundo perto de 75 min (estimativa, não medida). Alvo D-13: 75 min (64 a 86) a 1 clique por segundo, protegido por `tests/curva-m2.test.ts`.

## Escopo

- Faz:
  - Multiplicar por 0,25 os ganhos fixos grandes de clique (`haptic_gloves`, `quantum_gloves`, `neural_overdrive`) e subir os valores de `globalProductionPercent` das melhorias por um fator a calibrar (comece em cerca de 1,45), medindo contra o motor real, até a run de 1 clique por segundo ficar entre 70 e 80 min. Se só o fator de produção das melhorias não bastar, ajuste com o menor número de alavancas (custos das melhorias de produção, ou um fator diferente por melhoria), e explique.
  - Metas medidas no motor real (`CLIQUE_REPORT=1`): 1 clique por segundo entre 70 e 80 min; 0 cliques por segundo (30 s iniciais) até cerca de 110 min; 5 cliques por segundo no mínimo 55 min; 10 cliques por segundo no mínimo 50 min. As metas anteriores continuam: razões de 1,7 a 2,1 (no máximo 2,5) entre estágios consecutivos, nenhuma espera maior que cerca de 200 s, todos os agentes contratados, no máximo 3 melhorias sem compra, desconto abaixo do teto de 50 pp.
  - Atualizar os textos de descrição das melhorias que trazem os valores (`src/i18n/content/`), os testes (`tests/m2.integration.test.ts`, `catalog.test.ts`, o teste de curva e o de clique) e `tools/simular-curva.mjs` se ainda for usado.
  - Atualizar `docs/AG07/clique-m2.md` (resultado final com as tabelas medidas por ritmo), `curva-m2.md` e `melhorias-m2.md` e `melhorias-m3.md`, e sugerir o texto de P-06 para o AG00 (não edite `docs/decisoes.md`).
  - Se o teste de curva (`tests/curva-m2.test.ts`) tiver limites que dependam do ritmo de 1 clique por segundo, manter a faixa de 64 a 86 min e, se fizer sentido, acrescentar uma verificação barata de que 10 cliques por segundo não cai abaixo de 50 min (deve rodar em segundos ou ficar atrás de variável de ambiente, para não deixar a suíte lenta).
- **Mantenha como estão** os ids, os 5 equipamentos originais, os requisitos de `wifi_mesh`, `echo_ai` e `kai_ver_3`, e `macro_script` e `overclock_basic`.
- Não faz: alterar `types.ts`, regras do engine, interface, equipamentos além do estritamente necessário, nem os tetos de D-13.

## Critério de pronto

- [ ] Tabela medida no motor real com os ritmos 0, 1, 5 e 10 cliques por segundo (e os demais, se rápido), mostrando as metas atendidas; fatia de renda dos cliques ao abrir Quantum Facility e Mega Corporation.
- [ ] `validateCatalog(CATALOG)` vazio; textos em dois idiomas coerentes com os valores novos; `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a tabela principal e a lista de valores alterados. Não commitar.
