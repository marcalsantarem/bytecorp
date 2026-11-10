# BRF-013 · AG07 · QA do M1

- **Task:** T-015 (marco M1)
- **Dono:** AG07
- **Depende de:** T-009, T-011, T-012, T-014 (feitas)
- **Pode escrever em:** `tests/`, `tools/`, `docs/AG07/`; autorização extra: `vite.config.ts` (só `test.include`, acrescentar `tests/**/*.test.ts`) e `tsconfig.json` (só `include`, acrescentar `tests`)

## Objetivo

Provar, com o `CATALOG` real, que o loop do M1 funciona de ponta a ponta, e deixar um roteiro manual para desktop e mobile.

## Contexto

Núcleo: `GameEngine` (`src/core/engine.ts`: `click`, `buyEquipment`, `equipmentList`, `advance`), economia (`src/core/economy/`), save (`src/core/save/`, `SaveManager`, `MemoryStorage`), persistência após compra (`src/app/purchaseSave.ts`). Regras: Bíblia 4.1, 4.3, 4.6, 5.4, 6.3, 6.6, 21.

## Escopo

- Testes de integração em `tests/` (ambiente node, sem navegador), com o catálogo real:
  - custo de cada equipamento é inteiro e >= 1 para N de 0 a 200, com e sem desconto simulado;
  - MAX nunca gasta mais que o saldo e uma unidade a mais não caberia, em vários saldos, para todos os 15 itens;
  - equipamento oculto, revelado ou bloqueado não compra; passa a comprar ao atingir o requisito;
  - crítico com aleatoriedade fixa: ganho, estatísticas e evento;
  - o mesmo tempo fatiado de formas diferentes (inclusive com compras no meio) dá o mesmo resultado;
  - jogo, compra, gravação, carregamento: o estado volta igual e a produção também;
  - save corrompido e de versão futura são rejeitados e não derrubam o carregamento.
- Roteiro manual em `docs/AG07/roteiro-qa-m1.md`: passos curtos e verificáveis para 1280 px e 375 px (clique, compra x1/x10/MAX, abas e seletor de categoria, requisito de item revelado, troca de idioma, recarregar mantém progresso, save corrompido), com o resultado esperado de cada passo.
- Defeitos encontrados: não corrigir código de outros donos; listar na entrega com passos para reproduzir.
- Não faz: alterar código de produção, catálogo ou balanceamento.

## Critério de pronto

- [ ] `npm test` inclui os testes de `tests/` e todos passam; `npm run typecheck` cobre `tests/`.
- [ ] Roteiro manual escrito.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a lista de defeitos (ou "nenhum"). Não commitar.
