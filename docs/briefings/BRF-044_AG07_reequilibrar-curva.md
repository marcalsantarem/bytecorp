# BRF-044 · AG07 · Reequilibrar a curva do M2 (alvo de cerca de 75 min)

- **Task:** T-062 (marco M2)
- **Dono:** AG07
- **Depende de:** D-13 e T-061 (feitas)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/`. **Autorização extra:** `src/ui/shop/ShopPanel.test.tsx`, `src/ui/agents/AgentsPanel.test.tsx` e `src/ui/components/iconMap.ts`, somente para ajustar asserções ou acrescentar ícones que a reequilibragem tornar necessários (prefira não precisar).

## Objetivo

Levar a primeira run completa (do começo a Mega Corporation) a cerca de **75 minutos** (tolerância de uns 15%, ou seja, 64 a 86 min) com agentes e melhorias, sem a curva colapsar, e provar isso contra o **motor real**.

## Contexto

D-13 em `docs/decisoes.md`: KAI_VER_3 cerca de 0,2 pp e NEO_GEN_5 cerca de 0,5 pp por agente, crescimento por nível cerca de 0,25; teto de 50 pp para o desconto e de 25% para a chance de crítico (já implementados na T-061: `EngineConfig.maxCostDiscountPercent` e `maxCriticalChance`; consultas `engine.costDiscount` e `engine.criticalChanceInfo`); custos e limites de estágio podem subir. `docs/AG07/qa-m2.md` e `tools/simular-curva.mjs`: com os valores antigos, Mega Corporation em 18,7 min contra 108 min sem bônus; ECHO_AI contratado só aos 18,6 min e de pouco valor; SPECTRE_X nunca contratado; 9 das 20 melhorias nunca compradas; Quantum Facility e Mega Corporation abrindo com 0,1 min de diferença. Catálogo: 35 equipamentos, 5 agentes, 20 melhorias, 7 estágios. Fórmula D-10.

## Escopo

- Faz:
  - **Simulação contra o motor real:** um comprador guloso que usa o `GameEngine` com o `CATALOG` real (clique de 1 por segundo com o crítico real, equipamentos, agentes, evoluções e melhorias, escolhendo pelo menor retorno), em tempo virtual (`advance`), do início até Mega Corporation. Pode ficar em `tests/` como teste de curva (rápido, em segundos) ou em `tools/`; se ficar como teste, ele deve falhar quando o tempo até Mega Corporation sair de 64 a 86 min, para proteger a curva. Registre o tempo até cada estágio e até cada agente e melhoria comprados.
  - **Reequilibrar o catálogo** para o alvo, mexendo só no necessário: valores de bônus dos agentes (conforme D-13), custos e crescimento de agentes e de evolução, valores e custos das melhorias, custos e produção dos equipamentos mais caros e limites de estágio. Metas: razões de 1,7x a 2,1x (no máximo cerca de 2,5x) entre estágios consecutivos; nenhum trecho parado de mais de cerca de 3 min; ECHO_AI e SPECTRE_X realmente contratados e úteis dentro da run; poucas melhorias nunca compradas (as de clique e as de desconto devem ter papel visível); o desconto efetivo chega perto do teto só no fim; todo item se paga em tempo razoável.
  - **Mantenha como estão** os ids de tudo e, por dependerem deles testes do núcleo e da interface, os valores e requisitos dos 5 equipamentos originais (`home_router`, `home_server`, `external_drive`, `desk_fan`, `power_strip`: ids, custo, produção e requisitos), os requisitos de `wifi_mesh` (revelado em 50 B, desbloqueado em 300 B), de `echo_ai` e `kai_ver_3` (3.000 B), e as melhorias `macro_script` e `overclock_basic` (custo, efeito e desbloqueio). Se alguma outra mudança quebrar uma asserção de `ShopPanel.test.tsx` ou `AgentsPanel.test.tsx`, ajuste só a asserção, conforme a autorização.
  - Atualizar `catalog.test.ts` e `tests/` (contagens, ordens, desconto máximo das melhorias coerente com o teto), `tools/simular-curva.mjs` (se mantiver) para refletir os tetos, e `docs/AG07/qa-m2.md` e as tabelas de equipamentos, agentes e melhorias com os valores novos; escrever `docs/AG07/curva-m2.md` com antes e depois, a sensibilidade (o que acontece se cada alavanca mudar 20%), e as sugestões de texto para P-02, P-03 e P-05 (não edite `docs/decisoes.md`).
- Não faz: alterar `types.ts`, regras do engine, interface, ids.

## Critério de pronto

- [ ] A simulação contra o motor real dá entre 64 e 86 min até Mega Corporation, com a tabela de estágios, agentes e melhorias; as metas de razões, trechos parados e uso dos itens atendidas ou justificadas.
- [ ] `validateCatalog(CATALOG)` vazio; dois idiomas completos; `iconMap.test.ts` passa.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam; o teste de curva não deixa `npm test` mais lento de forma relevante.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a tabela da curva antes e depois e a lista de valores alterados.. Não commitar.
