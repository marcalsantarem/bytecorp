# BRF-083 · AG07 · Catálogo de conquistas

- **Task:** T-078 (marco M5)
- **Dono:** AG07
- **Depende de:** T-077 e T-079 (feitas), D-20
- **Pode escrever em:** `src/core/catalog/` (dados de conquistas e ligação ao catálogo), `src/i18n/achievements/` (arquivos novos `pt-BR.ts` e `en.ts` com as chaves `achievement.<id>.name|desc|hint`, ligados aos dicionários com uma linha em `src/i18n/pt-BR.ts` e `en.ts`, como `content/` e `ui/`; outras tasks editam o i18n em paralelo), `docs/AG07/`, testes. Não mexer na lógica de `src/core/progression/achievements.ts` (pedir ao AG00 se faltar algo).

## Objetivo

Catálogo real de cerca de 40 conquistas (D-20, Bíblia 11) com textos pt-BR e en.

## Escopo

- Cobrir as 7 categorias e as 4 raridades, com 6 a 8 secretas (cada uma com pista), usando os tipos de requisito de `src/core/catalog/achievements.ts`.
- Alvos coerentes com a curva (run 1 até Mega em ~74 min a 1 clique/s; árvore completa ~4,4 h, 10 Reboots): conquistas comuns na primeira run, raras e épicas em Reboots e árvore, lendárias perto do fim do conteúdo atual.
- Recompensas (Bytes, bônus temporários de 15, 30 ou 60 min, Quantum Cores) sem distorcer a curva: medir no motor real (ver `tests/tempo-m4.test.ts`) quanto o catálogo adianta a run 1 e a árvore completa; propor limites se passar de ~10%.
- Ligar o catálogo em `catalog.achievements` e `validateAchievements` ao `validateCatalog`.
- Documento `docs/AG07/conquistas-m5.md` com a tabela e as medições.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, mais o impacto medido na curva. Não commitar.
