# BRF-064 · AG02 · Produção offline (regras)

- **Task:** T-068 (marco M4)
- **Dono:** AG02
- **Depende de:** `engine.offlineCapMs` (T-037, feita). Os aceleradores e bônus temporários (T-065 a T-067) ainda não existem: esta task entrega o cálculo por intervalos com um ponto de extensão para eles.
- **Pode escrever em:** `src/core/progression/` e, só no mínimo, `src/core/engine.ts`, `events.ts` (AG01).

## Objetivo

Produção offline completa (Bíblia 14): ao voltar, creditar o que foi produzido na ausência, limitado a `offlineCapMs`, por intervalos e não segundo a segundo.

## Escopo

- Função pura `computeOffline(...)` em `progression/`: entrada = produção Bytes/s atual (do engine), tempo ausente em ms, limite em ms e uma lista opcional de **segmentos** `{ durationMs, multiplier }` (ponto de extensão para aceleradores e bônus que expiram durante a ausência; vazia por enquanto = multiplicador 1 o tempo todo). Saída = `{ awayMs, creditedMs, cappedMs (quanto passou do limite), bytes (Decimal), segments }`. Tempo negativo ou NaN = 0. Bytes = soma por segmento de produção × multiplicador × duração; o que passar do limite não é creditado.
- `GameEngine.applyOffline(awayMs, segments?)`: credita os Bytes em `run.bytes` e `run.bytesEarned` (e em estatísticas se existir campo de total), chama `syncStage()` e `invalidate()`, emite o evento `offlineApplied` com o resultado, devolve o resultado. Não simula compras, cliques, decisões nem eventos; não altera outra coisa.
- Produção constante entre eventos: usar a produção do estado no momento do retorno (sem compras, ela não muda).
- Testes: sem segmentos (tempo × produção), acima do limite (8 h e limite maior da árvore), segmentos com multiplicadores diferentes, tempo zero/negativo, Decimal grande, estágio muda e a UI é avisada por evento, o resultado é idêntico a avançar o mesmo tempo no motor com produção constante.
- Não faz: leitura de relógio e save (T-069), interface (T-073), aceleradores e bônus (T-065 a T-067).

## Critério de pronto

- [ ] lint, typecheck, test e build passam; relatório descreve o tipo do resultado (a T-069 e a T-073 usam).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
