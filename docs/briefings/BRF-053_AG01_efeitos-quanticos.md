# BRF-053 · AG01 · Efeitos quânticos na produção

- **Task:** T-037 (marco M3)
- **Dono:** AG01
- **Depende de:** T-036 (feita: `engine.quantumEffects`), T-021
- **Pode escrever em:** `src/core/production.ts`, `src/core/engine.ts`, `src/core/economy/` e, só para o ajuste do item 3, `src/core/progression/quantum.ts` (AG02).

## Objetivo

Aplicar os efeitos agregados da árvore Quantum na economia (D-10: camada `(1 + Σ quântico)`).

## Escopo

1. Ler `engine.quantumEffects` (ver `QuantumNodeDef` em `catalog/types.ts` e `quantum.ts`) e aplicar por tipo: produção global na camada quântica da D-10 (multiplicativa com as outras camadas), clique, desconto de custo (respeitando o teto da D-13), chance e multiplicador de crítico (teto da D-13), e limite offline (apenas expor `offlineCapMs`/equivalente no engine para o M4; sem implementar offline).
2. Tipos de efeito ainda sem uso no catálogo: ignorar sem erro. Testes com catálogo de teste e níveis comprados: cada tipo muda o resultado esperado; `invalidate()` após compra/reset; Reboot preserva os efeitos.
3. Ajuste de regra em `resetQuantumTree` (decisão do AG00): cobrar o custo do reset **depois** de devolver os cores gastos (o jogador que gastou tudo pode resetar se o saldo devolvido cobrir o custo); recusa se saldo + devolução < custo. Atualizar os testes de `quantum.test.ts`.
- Não faz: dados reais do catálogo (T-039), interface, save.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; `tests/curva-m2.test.ts` continua passando (sem árvore comprada, nada muda).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
