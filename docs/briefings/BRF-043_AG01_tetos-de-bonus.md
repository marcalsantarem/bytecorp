# BRF-043 · AG01 · Tetos de desconto de custo e de chance de crítico

- **Task:** T-061 (marco M2)
- **Dono:** AG01
- **Depende de:** decisão D-13 (`docs/decisoes.md`)
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Impor no núcleo um teto ao desconto de custo acumulado e à chance de crítico acumulada, com valores configuráveis.

## Contexto

D-13: o desconto de custo (`costDiscountPercent`, soma de agentes, melhorias e, no futuro, árvore Quantum) tem teto de **50 pontos percentuais**; a chance de crítico efetiva (base de `EngineConfig.criticalChance` mais a soma de `criticalChancePercent`) tem teto de **25%** (0,25). O multiplicador crítico segue sem teto. Hoje (`src/core/production.ts`) o desconto soma sem limite (a QA da T-031 simulou 95,6%) e a chance só é limitada de 0 a 1. O custo mínimo continua 1 Byte (Bíblia 4.6). A QA está em `docs/AG07/qa-m2.md` e `tests/m2.integration.test.ts`.

## Escopo

- Faz: constantes em `EngineConfig` (por exemplo `maxCostDiscountPercent` = 50 e `maxCriticalChance` = 0,25), com os valores padrão acima e possibilidade de sobrescrever nos testes; aplicar o teto de desconto onde o desconto efetivo é calculado, de modo que **todo** custo que usa desconto (compra de equipamento em x1, x10 e MAX, contratação e evolução de agente) use o valor limitado, sem mudar o custo das melhorias; aplicar o teto de chance de crítico na chance efetiva do clique; expor, para a interface e as estatísticas, o valor bruto somado e o efetivo depois do teto (por exemplo em `production.layers` ou numa consulta própria), para que se possa mostrar "desconto 50% (teto)"; testes: bônus brutos acima do teto resultam no teto; abaixo do teto ficam inalterados; o MAX com desconto limitado nunca gasta mais que o saldo e uma unidade a mais não caberia; custo continua inteiro e >= 1; desconto não afeta melhorias; chance de crítico limitada a 25% mesmo com muitos agentes SPECTRE_X; sobrescrever os tetos pela configuração funciona; o resultado continua independente da taxa de quadros. Ajustar os testes existentes (inclusive `tests/m2.integration.test.ts`, com autorização para editar somente as asserções que dependem de desconto ou de chance sem teto) e registrar qualquer mudança de comportamento na entrega.
- Não faz: catálogo (AG07), interface, formato do save, teto para outros bônus.

## Critério de pronto

- [ ] Testes acima passam; os testes existentes seguem passando, com os ajustes citados.
- [ ] O formato do save não muda; nada em `src/core` importa interface.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
