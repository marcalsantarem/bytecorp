# BRF-020 · AG01 · Agentes: contratação e níveis

- **Task:** T-019 (marco M2)
- **Dono:** AG01
- **Depende de:** T-018 (feita)
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Regras do Agent System: contratar agentes, evoluir o nível coletivo de cada tipo e consultar o estado para a interface. A aplicação dos bônus na produção é a T-021 (não faça aqui).

## Contexto

Bíblia 4.5, 4.6, 7.2 a 7.7. Contrato: `AgentDef` em `src/core/catalog/types.ts` (`baseCost`, `costGrowth`, `levelBaseCost`, `levelCostGrowth`, `primary`, `secondary`, `bonusGrowthPerLevel`, `unlock`, `reveal`); estado: `run.agents[id] = { count, level }`. Decisão D-10 (`docs/decisoes.md`): bônus do agente = `quantidade × bônus base × (1 + bonusGrowthPerLevel × (nível − 1))`, somado na camada de melhorias e agentes. Reaproveite `unitCost`/`isRequirementMet`/`equipmentStatus` de `src/core/economy/` onde servir. O catálogo de agentes está vazio hoje (o AG07 o preenche na T-023): teste com catálogo próprio no arquivo de teste.

## Escopo

- Regras:
  - contratação individual (sem x10 nem MAX), custo `C_base × k^N` com `costDiscountPercent` aplicado, inteiro, mínimo 1 Byte; sem saldo ou sem desbloqueio, não contrata;
  - nível coletivo por tipo, começa em 1 na primeira contratação; evolui uma unidade por vez, custo em Bytes (`levelBaseCost × levelCostGrowth^(nível−1)`, mesmas regras de arredondamento e desconto), só com pelo menos um agente do tipo; sem limite de nível;
  - estados `hidden`, `revealed` e `unlocked` como nos equipamentos;
  - função pura `agentBonus(def, count, level)` por efeito (primário e secundários) conforme D-10, sem ligar na fórmula global.
- `GameEngine`: `hireAgent(id)`, `levelUpAgent(id)`, consultas `agentInfo(id)` e `agentList()` (lista única ordenada pelo próximo custo de contratação, do menor ao maior, com estado, quantidade, nível, próximo custo de contratação, custo de evolução, bônus atual e progresso do nível quando aplicável); chamam `invalidate()`; eventos novos em `events.ts`: `agentHired` e `agentLeveled` (id, novo valor, custo).
- Não faz: ligar os bônus à produção (T-021), dados do catálogo (AG07), interface, salvar após contratar (T-022, AG03), mudar o formato do save.
- Suposição a registrar na entrega: o desconto de custo também vale para a evolução de nível (Bíblia 4.6 cita "agentes").

## Critério de pronto

- [ ] Testes: custo cresce com a quantidade, inteiro e >= 1 mesmo com desconto de 150%; contratar debita e sobe a quantidade; sem saldo ou bloqueado não contrata; nível começa em 1, evolui uma por vez, não evolui sem agente; `agentBonus` bate com a fórmula da D-10; ordem da lista muda quando o próximo custo muda; estados hidden, revealed, unlocked.
- [ ] O formato do save não muda; nada em `src/core` importa interface.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Resultado (registrado pelo AG00)

Convenção para o AG07 na T-023: `bonusGrowthPerLevel` é fração direta (0,5 = +50% por nível). O estado do agente é `{count: 0, level: 0}` antes da primeira contratação.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
