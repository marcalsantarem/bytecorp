# BRF-022 · AG07 · Catálogo de agentes

- **Task:** T-023 (marco M2)
- **Dono:** AG07
- **Depende de:** T-019 (feita)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/`

## Objetivo

Catálogo inicial de 4 a 5 agentes especializados, com textos nos dois idiomas e valores provisórios.

## Contexto

Bíblia 7.1 a 7.7 e 4.5. Exemplos de referência (nomes e valores podem ser ajustados): KAI_VER_3 produção global, NEO_GEN_5 operações com GPUs, ECHO_AI ganhos por clique, ATLAS_CORE redução de custos. Contrato: `AgentDef` em `src/core/catalog/types.ts`. Efeitos disponíveis: `globalProductionPercent`, `clickFlat`, `clickPercent`, `costDiscountPercent`, `criticalChancePercent`, `criticalMultiplier`, `offlineCapHours`; o efeito `value` é em pontos percentuais, exceto onde o tipo disser outra coisa. Fórmula (D-10 em `docs/decisoes.md`): bônus do agente = `quantidade × value × (1 + bonusGrowthPerLevel × (nível − 1))`, somado na camada de melhorias e agentes. **`bonusGrowthPerLevel` é fração direta** (0,5 = +50% por nível). Um agente de produção beneficia todos os equipamentos igualmente, sem restrição de categoria (7.5): como o tipo de efeito não tem categoria, NEO_GEN_5 deve ser tratado como produção global com texto e identidade próprios, ou trocado por outra especialidade. Não crie agente que afete outros agentes (D-10).

## Escopo

- Faz: 4 a 5 agentes em um novo `src/core/catalog/agents.ts`, ligado ao `CATALOG`; cada um com identidade e especialidade distintas (produção global, cliques, redução de custo, e opcionalmente crítico); `baseCost` e `costGrowth` (referência 1,25 para avançados), `levelBaseCost` e `levelCostGrowth` próprios; `unlock` e `reveal` por `bytesEarnedInRun` ou `stageReached`, distribuídos entre os estágios; valores de efeito conservadores (o desconto é aditivo e sem teto: sinalize qualquer combinação que passe de 100% em quantidades realistas); chaves de texto nos dois idiomas em `src/i18n/content/` (nome, descrição, especialidade; ícones lucide que existam de fato); teste de contagem e de coerência em `catalog.test.ts`; `docs/AG07/agentes-m2.md` com a tabela (custos, efeitos, desbloqueio, crescimento por nível) e as suposições. Valores provisórios; sugira ao AG00 o que entra em `docs/decisoes.md` (não edite esse arquivo).
- Não faz: alterar `types.ts`, regras do engine, ligar bônus à produção (T-021), interface.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio, com o catálogo de agentes preenchido.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante).
- [ ] Teste confirma que o engine real lista os agentes (`agentList()` com o `CATALOG`) e que contratar e evoluir funcionam com um deles.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
