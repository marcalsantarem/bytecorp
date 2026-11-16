# BRF-055 · AG07 · Catálogo da árvore Quantum

- **Task:** T-039 (marco M3)
- **Dono:** AG07
- **Depende de:** T-036 (feita)
- **Pode escrever em:** `src/core/catalog/` (dados dos nós, só o arquivo novo e o registro em `index.ts`), `src/i18n/content/`, `docs/AG07/`.

## Objetivo

Dados e textos da árvore Quantum: 3 caminhos (`alpha`, `beta`, `gamma`; Bíblia 10), cerca de 12 nós.

## Contexto

Esquema `QuantumNodeDef` em `catalog/types.ts`; regras em `src/core/progression/quantum.ts` (custo do nível `floor(base × fator^nível)`, pré-requisito = nível ≥ 1 no nó exigido, nível máximo inteiro ou null). Efeitos disponíveis (ver o tipo): produção global, clique, desconto, crítico, limite offline. Estimativa de cores ganhos por Reboot na D-15: 3, 10, 22, 38 e 59 ao chegar em Startup Lab a Mega Corporation; um jogador deve poder comprar os primeiros nós no primeiro Reboot (≈1 a 3 cores) e levar vários Reboots para completar a árvore.

## Escopo

- Faz: ~12 nós com ids, caminho, posição x/y legível para a UI (grade simples, raiz de cada caminho perto do centro), pré-requisitos, nível máximo, custo base e fator, efeito por nível; textos pt-BR (e en) em `src/i18n/content/`; tabela em `docs/AG07/arvore-quantum.md` com a justificativa e o ganho acumulado por caminho. Temas sugeridos: alpha produção, beta clique/crítico, gamma economia e tempo (desconto, limite offline). Teto D-13 de desconto (50 pp) e crítico (25%) respeitados somando todos os níveis.
- `validateCatalog` e os testes passam; ids estáveis.
- Não faz: regras, interface, aplicação dos efeitos.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; tabela documentada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
