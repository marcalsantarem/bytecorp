# BRF-070 · AG07 · Catálogo de aceleradores e concessões

- **Task:** T-070 (marco M4)
- **Dono:** AG07
- **Depende de:** T-065 (feita), D-16
- **Pode escrever em:** `src/core/catalog/` (arquivo novo e registro em `index.ts`), `src/i18n/content/`, `docs/AG07/`. Só o mínimo em `src/core/progression/accelerators.ts` para trocar `ACCELERATOR_GRANTS` provisório pela tabela do catálogo (AG02; relatar).

## Objetivo

Definir as concessões de aceleradores por marcos (D-16: um na primeira entrada em cada estágio e um em cada Reboot) e os textos.

## Contexto

`ACCELERATOR_GRANTS` provisório em `src/core/progression/accelerators.ts` (tabela `stage` por estágio e `reboot`, itens com multiplicador 2x ou 5x e duração 15, 30 ou 60 min, `EngineConfig.acceleratorGrants`). Estágios: 7 (Solo Hacker a Mega Corporation); um Reboot rende de 3 a 56 cores. A run 1 leva cerca de 74 min até Mega; a árvore completa em cerca de 10 Reboots (`docs/AG07/resultado-qa-m3.md`). Aceleradores não acumulam; só um ativo; os guardados não expiram (Bíblia 13). Nenhum essencial exclusivo de pagamento.

## Escopo

- Catálogo em `src/core/catalog/`: tipos para os itens (`id`, multiplicador, duração) e a tabela de concessão por marco, validada em `validateCatalog` (multiplicadores 2 ou 5, durações 15/30/60 min, sem concessão duplicada por marco).
- Valores: propor e justificar em `docs/AG07/aceleradores-m4.md` (por exemplo 2x/15 min nos primeiros estágios, 2x/30 min e 5x/15 min nos intermediários, 5x/30 min a 5x/60 min em Mega e nos Reboots), com a conta de quanto adianta a run 1 e a árvore completa se usados com bom senso (usar o motor real só se o AG01 já tiver aplicado a T-067; senão, estimativa por conta e dizer que não foi simulado). Evitar que os aceleradores quebrem a curva: o ganho total de uma run completa deve ficar em uma faixa que o documento justifique.
- Textos pt-BR e en (nomes e descrições, por exemplo "Acelerador 2x", "15 min") em `src/i18n/content/`.
- Ícones: Lucide existentes no `iconMap`.
- Testes de catálogo.
- Não faz: regras, aplicação na produção, interface.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; tabela documentada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
