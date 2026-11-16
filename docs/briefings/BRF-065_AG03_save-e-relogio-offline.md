# BRF-065 · AG03 · Save, relógio e produção offline ao carregar

- **Task:** T-069 (marco M4)
- **Dono:** AG03
- **Depende de:** T-068 (feita: `engine.applyOffline(awayMs, segments?)`, evento `offlineApplied` com `OfflineResult`, `engine.offlineCapMs`)
- **Pode escrever em:** `src/core/save/`, `src/app/`, `src/platform/`.

## Objetivo

Ligar a produção offline ao ciclo de vida do app (Bíblia 14.1, 14.4, 21): medir o tempo de ausência com segurança e creditá-lo ao carregar o save e ao voltar à aba.

## Contexto

O envelope do save já tem `savedAt` (ms). Aceleradores e bônus temporários ainda não existem (T-065 a T-067), então nesta task a lista de segmentos é vazia; os campos deles no save ficam para quando as regras existirem. O briefing e a `applyOffline` estão em `docs/briefings/BRF-064_AG02_producao-offline.md`.

## Escopo

- Ao carregar o save (bootstrap): ausência = `Date.now() − savedAt`; se for maior que um mínimo configurável (padrão 60 s, para não creditar recargas rápidas), chamar `engine.applyOffline(ausência)` **uma só vez** e deixar o resultado disponível para a interface (evento `offlineApplied` já existe; garantir que a UI montada depois do bootstrap ainda consegue ler o resultado, por exemplo guardando o último resultado pendente em um objeto da sessão com `consume()`).
- Ao voltar à aba (`visibilitychange` visible) depois de oculta por mais que o mínimo: o relógio por `setInterval` pode ter sido suspenso; medir o tempo oculto pelo relógio de parede, creditar o que o motor não avançou (sem contar duas vezes o que o `clock` já avançou), uma só vez.
- Proteção contra relógio: ausência negativa (relógio retrocedido) = 0 e o `savedAt` é regravado; ausência absurda (acima de 1 ano) é tratada como o limite, sem erro.
- Salvar imediatamente após creditar o offline, com novo `savedAt`, para não creditar duas vezes.
- Sem perda de compatibilidade: nenhum campo novo obrigatório no save; se precisar, bump de `SAVE_VERSION` com migração.
- Testes (fake-indexeddb e relógio injetável): carregar com ausência de 1 h credita uma vez; recarregar logo depois não credita de novo; ausência menor que o mínimo; relógio retrocedido; limite de 8 h; volta à aba oculta.
- Não faz: interface do resumo (T-073), aceleradores e bônus.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo como a UI obtém o resultado pendente. Não commitar.
