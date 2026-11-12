# BRF-025 · AG03 · Reiniciar o save por completo

- **Task:** T-053 (marco M2)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `src/app/`, `src/core/save/`

## Objetivo

Expor na sessão do jogo uma ação `reset()` que reinicia completamente o jogo e o save, para o botão Reset da interface (T-054, AG04) e para testar a evolução quantas vezes for preciso.

## Contexto

`src/app/bootstrap.ts` liga engine, relógio e salvamento (`GameSession` com `engine` e `stop`); `src/app/purchaseSave.ts` grava após compras; `GameEngine.replaceState(state)` troca o estado e emite `stateReplaced`; `createInitialState(now)` em `src/core/state.ts`; `SaveManager` tem `clear()` e `save(engine)`. Reiniciar "por completo" zera tudo: execução, Quantum Cores, árvore, conquistas e estatísticas. As configurações (chave `settings`) não fazem parte do save do jogo e não são apagadas.

## Escopo

- Faz: função testável (por exemplo `src/app/resetGame.ts`) que troca o estado do engine por um inicial novo e grava o save imediatamente; `GameSession.reset(): Promise<void>` em `bootstrap.ts` usando essa função; garantir que uma gravação pendente da persistência por compra não restaure o estado antigo; testes com engine real e `MemoryStorage`: após comprar e clicar, `reset()` leva o engine ao estado inicial (Bytes 0, equipamentos e agentes vazios, estágio inicial, estatísticas zeradas), o save carregado é o inicial, o engine continua funcionando (clicar e comprar depois do reset grava normalmente) e as configurações ficam intactas.
- Não faz: interface, confirmação (é da interface), mudar o formato do save, apagar configurações.

## Critério de pronto

- [ ] Testes acima passam.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
