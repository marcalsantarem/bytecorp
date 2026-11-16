# BRF-051 · AG02 · Árvore Quantum (regras)

- **Task:** T-036 (marco M3)
- **Dono:** AG02
- **Depende de:** T-034 (feita); fazer depois da T-035 (BRF-050), mesma execução
- **Pode escrever em:** `src/core/progression/`, tipos do catálogo da árvore em `src/core/catalog/` (só o esquema e a validação, sem os dados, que são da T-039 do AG07) e, no mínimo necessário, `src/core/state.ts`, `events.ts` e `engine.ts` (AG01).

## Objetivo

Regras da árvore Quantum (Bíblia 10): nós, níveis comprados um por vez, custo exponencial em Quantum Cores, pré-requisitos, reset com custo crescente.

## Escopo

- Faz:
  - Esquema do nó no catálogo (id, caminho, posição x/y para a UI, pré-requisitos, níveis máximos, custo base e fator, efeito por nível com tipo e valor, chaves de i18n) com validação em `validateCatalog`; um catálogo mínimo de teste (os dados reais vêm da T-039).
  - Estado em `meta`: níveis por nó e número de resets da árvore (campo novo; informar que o AG03 faz bump de `SAVE_VERSION`/migração na T-038, não mexer em `save/`).
  - Engine: `buyQuantumNode(id)` (um nível por vez, desconta cores, valida pré-requisito e nível máximo, evento `quantumNodePurchased`) e `resetQuantumTree()` (devolve todos os cores gastos, custo em cores crescente a cada reset, recusa se não houver saldo; evento `quantumTreeReset`).
  - Leitura dos efeitos: `quantumEffects()` agregando por tipo (produção, desconto, clique, limite offline etc.), para o AG01 aplicar na T-037; não aplicar na produção aqui.
- Testes com catálogo de teste: compra, pré-requisito, nível máximo, saldo insuficiente, reset e custo crescente.
- Não faz: dados reais do catálogo, interface, aplicação dos efeitos na produção (T-037), mudanças em `save/`.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; relatório lista os campos novos de `meta` e arquivos de AG01 tocados.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
