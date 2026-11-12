# BRF-028 · AG01 · Fórmula global de produção

- **Task:** T-021 (marco M2)
- **Dono:** AG01
- **Depende de:** T-019 e T-020 (feitas), decisão D-10
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Ligar os bônus de agentes e melhorias à produção passiva, ao clique e aos descontos, na fórmula de três camadas da D-10.

## Contexto

`docs/decisoes.md` (D-10): produção = `P0 × (1 + Σ melhorias e agentes) × (1 + Σ quântico) × Π temporários`; P0 = soma dos equipamentos; dentro da camada os bônus somam, entre camadas multiplicam; o mesmo multiplicador global vale para produção passiva e clique; clique = `(base + fixos) × (1 + % de clique) × multiplicador global`, crítico por cima; bônus do agente já calculado por `agentBonus(def, count, level)` (`src/core/economy/agents.ts`, devolve `Effect[]`); efeitos das melhorias por `activeUpgradeEffects(state, catalog)` (`economy/upgrades.ts`). Hoje `production.ts` tem `globalMultiplier` devolvendo 1, `clickFlatBonus`, `clickPercentBonus` e `costDiscountPercent` devolvendo 0. Bíblia 4.2, 4.6, 5.4, 5.5. Efeitos do tipo `Effect` (`catalog/types.ts`): `globalProductionPercent`, `clickFlat`, `clickPercent`, `costDiscountPercent`, `criticalChancePercent`, `criticalMultiplier`, `offlineCapHours`.

## Escopo

- Camada 1: soma de `globalProductionPercent` das melhorias compradas e dos agentes, em pontos percentuais. Camada 2 (quântico) e camada 3 (temporários): ainda sem fonte; deixe funções com o ponto de extensão (devolvem 0 e 1) para a T-037 e o M4/M5.
- Função pura que combina as camadas (por exemplo `combineProduction(base, { layer1, quantum, temporaryFactors })`) com teste do exemplo da proposta: P0 = 1.000, melhorias +50%, agentes +30%, quântico +40%, temporário x2 resulta em 5.040.
- Clique: `clickFlat` e `clickPercent` das melhorias e dos agentes; multiplicador global igual ao da produção passiva; crítico: a chance efetiva é a base de `EngineConfig` mais a soma de `criticalChancePercent` (em pontos percentuais, limitada a 0 a 1, por ser probabilidade) e o multiplicador crítico é a base mais a soma de `criticalMultiplier` (assuma adição; registre a suposição). Sem teto de bônus além disso (A-06 está em aberto).
- Desconto: `costDiscountPercent` passa a somar os efeitos `costDiscountPercent` de agentes e melhorias, e vale para equipamentos e agentes (compra e evolução), nunca para o custo de melhorias.
- Rastreio de origem para estatísticas: `ProductionBreakdown` passa a expor quanto de cada camada vem de agentes, melhorias, quântico e temporários, e as fontes da base (equipamentos).
- `offlineCapHours` não é produção: não trate aqui (M4).
- Consistência: toda ação que muda bônus (contratar, evoluir, comprar melhoria) já chama `invalidate()`; confirme que o cache de produção, o valor do clique e os custos refletem o novo estado na hora. O resultado continua independente da taxa de quadros.
- Testes com catálogo próprio: bônus de agente por quantidade e nível, bônus de melhoria, soma dentro da camada, clique com fixos e percentuais e multiplicador global, crítico com chance e multiplicador somados, desconto aplicado em equipamento e agente e **não** em melhoria, invalidação após cada tipo de compra, rastreio por origem, e mesmo resultado com o tempo fatiado de formas diferentes.
- Não faz: catálogo de melhorias (T-024), interface, formato do save, efeitos quânticos (T-037), bônus temporários e aceleradores (M4/M5).

## Critério de pronto

- [ ] Testes acima passam e o exemplo de 5.040 está coberto.
- [ ] Os testes existentes de `tests/` e `src/` seguem passando; o formato do save não muda; nada em `src/core` importa interface.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
