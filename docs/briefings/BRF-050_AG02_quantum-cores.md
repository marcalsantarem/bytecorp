# BRF-050 · AG02 · Fórmula de Quantum Cores

- **Task:** T-035 (marco M3)
- **Dono:** AG02
- **Depende de:** T-034 (feita), D-15
- **Pode escrever em:** `src/core/progression/` e, só no mínimo, `src/core/engine.ts` (AG01) para ligar o padrão de `rebootReward`.

## Objetivo

Implementar a fórmula da D-15 e a condição do botão de Reboot.

## Escopo

- Faz: função pura `quantumCoresReward(state, catalog/config)` em `progression/`:
  `floor(((max(0, L − 4)) / 2)²) + índice do estágio + floor(melhorias comuns compradas / 4)`, com L = log10 de `run.bytesEarned` (0 se for 0), índice do estágio de 0 a 6. Pesos (divisor 2, offset 4, peso do estágio 1, 4 melhorias por core) em constantes configuráveis.
- Torna essa função o padrão de `EngineConfig.rebootReward` (substitui o `DEFAULT_REBOOT_REWARD` que retorna 0); `engine.rebootRewardNow` passa a valer para estimativa e botão (habilita com ≥ 1).
- Testes: valores de borda (L abaixo de 4, L = 6 dá 1 core, tabela da D-15: ~3, 10, 22, 38 e 59 cores nos estágios Startup Lab a Mega Corporation na curva de referência, com tolerância), nunca usa saldo nem estatísticas globais, arredondamento para baixo.
- Não faz: interface, árvore, formato de save.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
