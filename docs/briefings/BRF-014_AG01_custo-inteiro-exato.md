# BRF-014 · AG01 · Custo unitário inteiro exato

- **Task:** T-047 (marco M1)
- **Dono:** AG01
- **Depende de:** T-015 (feita; defeito D-1)
- **Pode escrever em:** `src/core/economy/`, `src/core/decimal.ts` e testes; autorização extra: `tests/m1.integration.test.ts` (só trocar a tolerância relativa de 1e-12 por igualdade exata nos testes de custo inteiro)

## Objetivo

Garantir que o custo unitário seja um inteiro exato, como exigem a Bíblia 4.3 e 4.6.

## Contexto

Defeito D-1: `unitCost(15, 1.15, 102).toNumber()` devolve 23295442.999999996 e com n=103 devolve 26789759.000000004. O `floor()` do `Decimal` (break_infinity) não garante inteiro exato na mantissa. Há casos parecidos com desconto de 10%, 50% e 99%. Risco: diferença de 1 Byte entre custo exibido e debitado, e comparação com `eq` falhando. Os testes de `tests/m1.integration.test.ts` hoje usam tolerância e citam D-1 em comentário.

## Escopo

- Faz: corrigir `unitCost` (e o que depender dele em `bulkCost` e `maxAffordable`) para devolver sempre inteiro exato quando o valor cabe em precisão segura, com arredondamento para baixo e mínimo de 1; decidir e documentar em comentário o comportamento acima da precisão de inteiro seguro (custos gigantes, onde "inteiro" perde sentido); teste de regressão com os casos do defeito (n=102 e 103 sem desconto e os de 10%, 50% e 99%) por igualdade exata.
- Não faz: mudar fórmula de custo, fatores de crescimento, catálogo ou a API pública de `economy/`.

## Critério de pronto

- [ ] `unitCost` devolve inteiro exato (`Number.isInteger(x.toNumber())` e igualdade exata) para N de 0 a 200 nos 15 itens do catálogo, com desconto 0, 10, 50, 99 e 100%.
- [ ] Os testes de custo em `tests/` usam igualdade exata.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
