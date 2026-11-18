# BRF-082 · AG03 · Save: conquistas, estatísticas e tutorial

- **Task:** T-079 (marco M5)
- **Dono:** AG03
- **Depende de:** T-077 (BRF-081, entrega do AG02 com os campos de estado)
- **Pode escrever em:** `src/core/save/`, `src/platform/`, `src/app/`. Campos novos em `state.ts` só os que a T-077 não criou (estatísticas e tutorial).

## Objetivo

Persistir conquistas, estatísticas novas e progresso do tutorial, com `SAVE_VERSION` incrementada e migração.

## Campos entregues pela T-077 (em `meta`, hoje opcionais)

`achievements: string[]` (já existia), `achievementUnlocks?: Record<string, {at, playTimeMs}>`, `achievementRewardsDelivered?: string[]`, `achievementQueue?: string[]` (fila de notificações). Ler e gravar os três opcionais (ausentes viram `{}`/`[]`/`[]`), torná-los obrigatórios em `MetaState` e em `createInitialState`, e ajustar os testes `m1` e `m2` de ida e volta. `stats.playTimeMs` já existe e só conta com o jogo aberto; não criar estatística nova de tempo. Falta criar apenas o progresso do tutorial.

## Escopo

- Serializar e validar campo a campo o estado de conquistas (da T-077), a estatística de tempo de jogo aberto (acumulada em `stats`, só com o jogo aberto, não o offline) e o progresso do tutorial (passos concluídos, tutorial dispensado, em `meta`).
- `SAVE_VERSION` 2 → 3 com migração que cria os campos com valores iniciais; `parseState` atualizado; ids de conquista desconhecidos ignorados.
- Salvar logo após desbloquear conquista (momento importante, GDD 21.2).
- Testes: ida e volta, migração 2→3, save corrompido, ids desconhecidos, Reboot preserva (conquistas, estatísticas), Novo jogo zera.
- Não faz: regras (T-077), interface.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
