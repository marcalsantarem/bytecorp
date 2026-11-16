# BRF-069 · AG01 · Aplicar aceleradores e bônus temporários

- **Task:** T-067 (marco M4)
- **Dono:** AG01
- **Depende de:** T-065 e T-066 (feitas: `engine.temporaryMultiplier`, `engine.offlineSegments(awayMs)`), D-17
- **Pode escrever em:** `src/core/production.ts`, `src/core/engine.ts`, `src/core/economy/` e testes; `src/core/progression/` só o mínimo para o item 3 (relatar).

## Objetivo

Aplicar o multiplicador de temporários da D-10 (`Π temporários`, que inclui o acelerador, D-17) na produção passiva e no clique.

## Escopo

1. `production` e `clickValue` (e o crítico sobre o resultado) passam a multiplicar por `temporaryMultiplier`. O `advance` já corta o passo nos vencimentos; conferir que o resultado depende só do total de ms, com passos finos ou grandes.
2. Manter `invalidate()` quando acelerador ou bônus mudam (ativação, expiração, concessão, armazenamento) para o cache de `production` não ficar velho.
3. **Offline sem dobrar:** `offlineSegments` entrega multiplicadores absolutos de temporários; `applyOffline` usa `production` sem temporários (produção base, camadas de melhorias, agentes e árvore) vezes os segmentos. Garantir isso (expor a produção base sem temporários, `productionBase`, se preciso) e testar: um acelerador 5x de 30 min com 1 h de ausência credita 30 min × 5 + 30 min × 1, e `production.total` depois do crédito não inclui o acelerador expirado.
4. Interface do engine para a UI: `engine.production` continua sendo o valor efetivo (com temporários) para o indicador de B/s; expor também `engine.productionBase` se não existir.
5. Testes: acelerador 2x e 5x dobram/quintuplicam produção e clique, sem acumular entre aceleradores, acelerador × bônus multiplicam, expiração no meio de um `advance`, offline, a curva sem temporários não muda (`tests/curva-m2.test.ts` e `tests/prestigio-m3.test.ts` continuam passando).
- Não faz: catálogo, interface, bootstrap (src/app).

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
