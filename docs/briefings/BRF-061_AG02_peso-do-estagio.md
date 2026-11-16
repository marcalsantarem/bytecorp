# BRF-061 · AG02 · Peso do estágio da fórmula de Quantum Cores

- **Task:** T-047c (corrige D2 de `docs/AG07/resultado-qa-m3.md`)
- **Dono:** AG02
- **Pode escrever em:** `src/core/progression/` e os testes que dependem dos valores (`tests/prestigio-m3.test.ts`, `tests/helpers/`).

## Objetivo

O botão de Reboot habilita aos 3,8 min (Garage Company) porque o índice do estágio já soma 1 core; a D-15 queria o botão em cerca de L = 6, uns 7 min (Startup Lab). Baixar `stageWeight` de 1 para 0,5 em `DEFAULT_CORES_WEIGHTS` (`coresReward.ts`), mantendo o arredondamento para baixo e a margem de 1e-9.

## Escopo

- Ajustar o peso e os testes de `coresReward.test.ts` (valores de borda, tabela da D-15 com tolerância) e do `tests/prestigio-m3.test.ts` (faixas de cores e de tempo que mudarem; rodar com `PRESTIGIO_REPORT=1` para ver os novos números e atualizar as faixas protegidas, sem afrouxar além do necessário).
- Relatar na entrega: tempo em que o botão habilita, cores por estágio na run 1 (antes: 3, 10, 22, 38, 59) e número de Reboots para completar a árvore (antes: 10) com os novos pesos.
- Atualizar a tabela de `docs/AG07/resultado-qa-m3.md` só com uma nota curta de "Ajuste do D2" (não reescrever o relatório).
- Não faz: interface, árvore, catálogo.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
