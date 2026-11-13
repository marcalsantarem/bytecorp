# BRF-039 · AG07 · Equipamentos de Quantum Facility e Mega Corporation

- **Task:** T-052 (marco M2)
- **Dono:** AG07
- **Depende de:** T-024 e T-025 (feitas)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/`. **Autorização extra:** `src/ui/components/iconMap.ts`, somente para acrescentar os ícones novos (import e entrada no mapa); o teste `iconMap.test.ts` falha se um ícone do catálogo faltar. Não toque em mais nada de `src/ui/`.

## Objetivo

Cobrir os dois últimos estágios (Quantum Facility e Mega Corporation) com equipamentos próprios e rever os limites de Bytes dos estágios, eliminando o salto de 64,6 min para 85,5 h encontrado na simulação.

## Contexto

`docs/AG07/equipamentos-m2.md`: 25 equipamentos (5 por categoria), o mais caro custa 5 trilhões; estágios exigem 1e4, 1e6, 1e9, 1e12, 1e15 e 1e18 Bytes gerados na execução (provisório, P-02 em `docs/decisoes.md`); a simulação mostrou Quantum Facility em 64,6 min e Mega Corporation em 85,5 h porque não há itens acima de 5 trilhões. Agentes (`docs/AG07/agentes-m2.md`) e 12 melhorias (`docs/AG07/melhorias-m2.md`, só até Quantum Facility) já existem. Bíblia 4.7: a formatação passa de Yotta (1e24); custos até cerca de 1e27 exercitam isso sem estourar a precisão. Fatores de custo de 1,15 a 1,25. Progressão das categorias independente (Bíblia 6.1).

## Escopo

- Faz: cerca de 10 equipamentos novos (2 por categoria, até 35 no total), os de Quantum Facility desbloqueando perto do limite do estágio e os de Mega Corporation perto do limite seguinte, com requisitos por `bytesEarnedInRun` e `stageReached` e custos e produção crescentes; revisar os limites de Bytes dos estágios (inclusive o de 1e18) para uma progressão contínua, com razões de tempo entre estágios parecidas com as dos primeiros (cerca de 1,7x a 2,1x), e documentar a lógica em comentário em `stages.ts`; chaves `equipment.<id>.name` e `.desc` nos dois idiomas em `src/i18n/content/` (ícones Lucide que existam de fato, acrescentados ao `iconMap.ts` conforme a autorização); atualizar `tools/simular-equipamentos.mjs` e os testes de contagem em `catalog.test.ts` e em `tests/`; `docs/AG07/equipamentos-m3.md` (ou atualizar o `equipamentos-m2.md`) com a tabela e a simulação até Mega Corporation, sinalizando saltos; sugerir ao AG00 o texto para P-02 (não edite `docs/decisoes.md`).
- **Mantenha os 25 equipamentos atuais exatamente como estão** (ids, custos, produção e requisitos). A ordem por custo crescente dentro de cada categoria continua obrigatória (a validação exige).
- Observação para o relatório: as melhorias vão só até Quantum Facility; diga se, com os itens novos, falta conteúdo de melhorias para Mega Corporation (não crie melhorias nesta task).
- Não faz: alterar `types.ts`, regras do engine, interface além do `iconMap.ts`, agentes, melhorias.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio; testes de contagem e de requisitos atualizados.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante); `iconMap.test.ts` passa.
- [ ] Simulação mostra todos os estágios com razões coerentes, sem salto maior que cerca de 2,5x entre estágios consecutivos nem entre primeiras unidades.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
