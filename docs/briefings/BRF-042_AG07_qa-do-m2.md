# BRF-042 · AG07 · QA do M2: integração e simulação da curva

- **Task:** T-031 (marco M2)
- **Dono:** AG07
- **Depende de:** T-021, T-022, T-025, T-030 e T-059 (feitas)
- **Pode escrever em:** `tests/`, `tools/`, `docs/AG07/`

## Objetivo

Provar, com o `CATALOG` real, que o loop do M2 funciona de ponta a ponta (estágios, agentes, melhorias, fórmula global, descontos, save), simular a curva econômica completa com agentes e melhorias e deixar escrito o roteiro manual do M2.

## Contexto

Regras: D-10 em `docs/decisoes.md` (`P0 × (1 + Σ melhorias e agentes) × (1 + Σ quântico) × Π temporários`; clique `(base + fixos) × (1 + % clique) × global`, crítico por cima; descontos somam e não valem para melhorias; custo inteiro e de no mínimo 1 Byte), Bíblia 4, 6, 7, 8, 21. Núcleo: `GameEngine` (`click`, `buyEquipment`, `hireAgent`, `levelUpAgent`, `buyUpgrade`, `equipmentList`, `agentList`, `upgradeList`, `stageInfo`, `production`, `clickValue`, `advance`), `src/app/purchaseSave.ts` e `resetGame.ts`, `src/core/save/`. Catálogo atual: 35 equipamentos, 5 agentes, 20 melhorias, 7 estágios (`docs/AG07/*.md`). O QA do M1 está em `tests/m1.integration.test.ts` e `docs/AG07/resultado-qa-m1.md`. Os testes de componentes da interface existem (`src/ui/**/*.test.tsx`, AG04); aqui o foco é a lógica integrada.

## Escopo

- Testes de integração em `tests/m2.integration.test.ts` (ambiente node, catálogo real, sem depender de ids novos que não existam):
  - fórmula: com agentes e melhorias reais comprados, `production.total` e `clickValue` batem com o cálculo manual da D-10, incluindo soma dentro da camada, mesmo multiplicador global para passivo e clique e rastreio por origem em `production.layers`;
  - descontos: valem para custo de equipamento, contratação e evolução de agente, nunca para o custo de melhorias; custo sempre inteiro e >= 1, inclusive com muitos agentes de desconto; MAX com desconto nunca gasta mais que o saldo e uma unidade a mais não caberia, para equipamentos reais;
  - estágios: avançam na ordem pelos limites reais (inclusive saltando vários de uma vez), nunca regridem, `stageInfo` coerente, desbloqueios por `stageReached` mudam junto;
  - estados de agentes e melhorias (oculto, revelado, desbloqueado; bloqueada, disponível, comprada) ao longo do total gerado; compra única de melhoria; Evoluir só com agente; ordem de `agentList()` e `upgradeList()`;
  - crítico: chance efetiva com os agentes, limitada de 0 a 1, e multiplicador somado;
  - save: ida e volta com agentes, níveis, melhorias e estágio preserva estado e produção; `createPersistence` grava após contratar, evoluir, comprar melhoria e mudar de estágio, agrupando ações mistas; `resetGame` volta ao estado inicial e ao save inicial;
  - independência de frames com bônus ativos e compras no meio: o mesmo tempo fatiado de formas diferentes dá o mesmo resultado;
  - números grandes: custos de equipamentos e melhorias até 3e18 permanecem inteiros e ordenados; registre o comportamento acima de 2^53 (aproximado, documentado).
- Simulação da curva completa em `tools/` (estender `simular-equipamentos.mjs` e `simular-melhorias.mjs` ou criar um simulador integrado): comprador guloso que usa clique de 1 por segundo, equipamentos, agentes e melhorias, do início até Mega Corporation; tabela com o tempo até cada estágio e até cada agente e melhoria, comparada com a linha de base sem agentes nem melhorias (108,1 min até Mega Corporation); indique saltos, trechos parados, itens que nunca se pagam e o efeito do desconto acumulado; **proponha** ajustes (não altere valores do catálogo).
- `docs/AG07/roteiro-qa-m2.md`: roteiro manual curto e verificável para 1280 px e 375 px cobrindo agentes (contratar, evoluir, bônus), melhorias (bloqueada, disponível, comprada), indicador de estágio, abas de categoria e o ponto de equipamento novo, o botão Reset com confirmação, a cena do núcleo em tela baixa e o PWA (manifesto e ícones); com o resultado esperado de cada passo. **Não execute o roteiro**: a execução é outra task.
- Defeitos: não corrigir código de outros donos; listar na entrega e em `docs/AG07/qa-m2.md` com passos para reproduzir.
- Não faz: alterar código de produção, valores de catálogo, textos ou interface.

## Critério de pronto

- [ ] `tests/m2.integration.test.ts` com os casos acima, passando; o tempo de `npm test` não passa de cerca do dobro do atual.
- [ ] Simulação executada, com a tabela e as propostas de ajuste em `docs/AG07/qa-m2.md`.
- [ ] Roteiro manual escrito.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a lista de defeitos (ou "nenhum") e o resumo da simulação. Não commitar.
