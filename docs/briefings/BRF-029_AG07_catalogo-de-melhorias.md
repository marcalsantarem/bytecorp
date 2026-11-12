# BRF-029 · AG07 · Catálogo de melhorias comuns

- **Task:** T-024 (marco M2)
- **Dono:** AG07
- **Depende de:** T-020 e T-021 (feitas)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/`

## Objetivo

Catálogo inicial de cerca de 12 melhorias comuns, com textos nos dois idiomas e valores provisórios.

## Contexto

Bíblia 8.1 a 8.6 e 4.6. Contrato: `UpgradeDef` em `src/core/catalog/types.ts` (`id`, `nameKey`, `descriptionKey`, `icon`, `cost`, `effect` único, `unlockBytesEarnedInRun`). Regras já implementadas: desbloqueio pelo total gerado na execução, compra única por execução, custo fixo e inteiro, não afetado por descontos; lista única ordenada por custo crescente. Fórmula D-10 (`docs/decisoes.md`): `globalProductionPercent`, `clickFlat` e `clickPercent` somam na camada de melhorias e agentes, `costDiscountPercent` soma no desconto (equipamentos e agentes); valores em pontos percentuais exceto `clickFlat` (Bytes). Três tipos apenas: produção global, ganho por clique, redução de custo; **nenhuma melhoria específica de um equipamento ou agente** (8.2). Já existem 25 equipamentos, 5 agentes (`docs/AG07/agentes-m2.md`) e 7 estágios com limites de Bytes (`docs/AG07/equipamentos-m2.md`).

## Escopo

- Faz: cerca de 12 melhorias em um novo `src/core/catalog/upgrades.ts` ligado ao `CATALOG`, distribuídas de forma progressiva do começo ao meio do jogo (Bíblia 8.6), com custos crescentes e `unlockBytesEarnedInRun` coerente com a curva de equipamentos e estágios; equilíbrio entre os três tipos; valores conservadores, em especial a redução de custo, que soma com a dos agentes (A-06 está em aberto: sinalize o acumulado máximo possível de desconto vindo das melhorias); chaves `upgrade.<id>.name` e `.desc` nos dois idiomas em `src/i18n/content/` (ícones lucide que existam de fato; liste os nomes dos ícones no documento para o AG04 incluí-los no mapa na T-027); testes em `catalog.test.ts` (contagem, coerência, ordenação por custo) e um teste com o engine real: `upgradeList()` lista as melhorias do `CATALOG`, uma delas libera ao atingir o total gerado e, ao comprar, a produção ou o valor do clique sobe conforme a fórmula; `docs/AG07/melhorias-m2.md` com a tabela (tipo, custo, efeito, desbloqueio), uma estimativa do tempo de retorno de cada uma na simulação existente (`tools/`) e os pontos de atenção. Valores provisórios; sugira ao AG00 o que entra em `docs/decisoes.md` (não edite esse arquivo).
- Não faz: alterar `types.ts`, regras do engine, interface.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio com o catálogo de melhorias preenchido.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante).
- [ ] Teste com o engine real passa.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
