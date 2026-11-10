# BRF-009 · AG07 · Catálogo de equipamentos do M1

- **Task:** T-014 (marco M1)
- **Dono:** AG07
- **Depende de:** T-006 (feita)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `docs/AG07/`

## Objetivo

Catálogo de 15 equipamentos (3 por categoria) com textos em pt-BR e en e valores provisórios.

## Contexto

Bíblia 6.1 a 6.3 e 4.3. Categorias: networking, processing, storage, cooling, infrastructure, progressão independente (nenhum requisito pode depender de equipamento de outra categoria; use `bytesEarnedInRun`). Fator de custo: 1,15 para hardware comum, até 1,25 para tecnologia avançada. Hoje há 5 equipamentos em `src/core/catalog/equipment.ts` (ids `home_router`, `home_server`, `external_drive`, `desk_fan`, `power_strip`). **Mantenha esses cinco exatamente como estão** (ids, custos, produção): testes do núcleo dependem deles. Acrescente 10, 2 por categoria, com custo base maior que o já existente na mesma categoria, na ordem crescente de custo dentro da categoria (a validação exige). Tema cyberpunk, tom curto. Ícones: nomes de ícones do `lucide-react` que existam de fato (confira nas exportações do pacote).

## Escopo

- Faz: os 10 equipamentos novos em `equipment.ts` com `unlock` e `reveal` por `bytesEarnedInRun` (revelar um degrau antes de desbloquear); chaves `equipment.<id>.name` e `.desc` nos dois idiomas em `src/i18n/content/`; tabela com custo, produção, fator, desbloqueio e revelação em `docs/AG07/equipamentos-m1.md`; estimativa simples do tempo até a primeira unidade de cada item (script em `tools/`, 1 clique por segundo e compra gananciosa) registrada no mesmo documento, sinalizando saltos de dificuldade. Valores provisórios: servem ao M1 e entram em P-02 de `docs/decisoes.md` (apenas sugira ao AG00; não edite esse arquivo).
- Não faz: alterar os cinco itens existentes, `types.ts`, lógica de custo ou compra, estágios (M2), interface.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio e teste de contagem (3 por categoria, 15 no total) em `catalog.test.ts`.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
