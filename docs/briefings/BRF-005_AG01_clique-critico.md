# BRF-005 · AG01 · Clique com crítico

- **Task:** T-007 (marco M1)
- **Dono:** AG01
- **Depende de:** nenhuma
- **Pode escrever em:** arquivos na raiz de `src/core/` e seus testes

## Objetivo

Clique com chance de crítico, conforme Bíblia 5.3 a 5.5.

## Contexto

Bíblia 5.5: (1) acréscimos fixos sobre o valor base, (2) multiplicadores percentuais, (3) multiplicador crítico sobre o ganho final, incluindo bônus. Sem limite de cliques nem combo. Ainda não há fontes de bônus (chegam no M2; fórmula global A-01 pendente); deixe os passos 1 e 2 prontos para receber os efeitos `clickFlat` e `clickPercent` de `catalog/types.ts`, hoje somando zero. Valores de chance e multiplicador são provisórios (A-04): use 5% e x5 em `EngineConfig`.

## Escopo

- Faz: chance e multiplicador em `EngineConfig`; fonte de aleatoriedade injetável (padrão `Math.random`); `click()` aplica o crítico, incrementa `stats.criticalClicks` e emite `click` com `critical` correto; `clickValue` continua sendo o valor sem crítico (a interface exibe ele).
- Não faz: equipamentos ou compra (T-008); mudar o formato do save; interface.

## Critério de pronto

- [ ] Testes com aleatoriedade fixa cobrem clique normal, crítico (ganho = valor × multiplicador), estatísticas e o evento.
- [ ] Nada em `src/core` passa a depender de interface (o lint garante).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
