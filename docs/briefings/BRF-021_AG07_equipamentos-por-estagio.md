# BRF-021 · AG07 · Equipamentos extras por estágio

- **Task:** T-025 (marco M2)
- **Dono:** AG07
- **Depende de:** T-018 (feita)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `docs/AG07/`

## Objetivo

Estender o catálogo de equipamentos e os limites dos estágios para que cada um dos sete estágios corporativos tenha progressão própria.

## Contexto

Bíblia 1.2, 6.1 a 6.3 e 4.3. Hoje há 15 equipamentos (3 por categoria) que cobrem só o início; o mais caro custa 250 milhões e desbloqueia com 125 milhões gerados. Os estágios (`stages.ts`) exigem de 1e4 a 1e18 Bytes gerados na execução (provisório). Veja `docs/AG07/equipamentos-m1.md` e `tools/simular-equipamentos.mjs` (a simulação mostrou o M1 inteiro em cerca de 18 minutos; o ritmo real é ajustado no M8). O estágio já avança sozinho (T-018) e `Requirement` aceita `stageReached`. Os agentes e as melhorias (T-023 e T-024) ainda não existem, então este é um ajuste inicial, a ser revisto no M2 e no M8.

## Escopo

- Faz: acrescentar equipamentos (cerca de 2 por categoria, até 25 no total) para cobrir os estágios Garage Company a Corporate Network no mínimo, com custos e produção crescentes e fator entre 1,15 e 1,25; usar `bytesEarnedInRun` e `stageReached` nos requisitos, sem dependência entre categorias; revisar os limites de Bytes dos estágios para uma distribuição que faça sentido com a curva (documente a lógica); chaves `equipment.<id>.name` e `.desc` nos dois idiomas em `src/i18n/content/` (ícones lucide que existam de fato); atualizar `tools/simular-equipamentos.mjs` para mostrar também o tempo estimado até cada estágio; escrever `docs/AG07/equipamentos-m2.md` com a tabela e a simulação, sinalizando saltos de dificuldade; ajustar `catalog.test.ts` para a nova contagem.
- **Mantenha os 15 equipamentos atuais exatamente como estão** (ids, custos, produção e requisitos): testes do núcleo e da QA dependem deles. A ordem dentro de cada categoria é por custo crescente (a validação exige).
- Valores provisórios; sugira ao AG00 o que entra no P-02 de `docs/decisoes.md` (não edite esse arquivo).
- Não faz: alterar `types.ts`, regras de custo ou estágio, agentes, melhorias, interface.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio; teste de contagem atualizado.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante).
- [ ] Documento e simulação entregues; nenhum salto de progressão sem explicação.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
