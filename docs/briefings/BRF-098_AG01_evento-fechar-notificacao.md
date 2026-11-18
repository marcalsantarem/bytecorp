# BRF-098 · AG01 · Evento ao fechar notificação de conquista

- **Task:** T-090c (complemento), marco M5
- **Dono:** AG01
- **Pode escrever em:** `src/core/engine.ts`, `src/core/events.ts` e testes do núcleo; em `src/app/purchaseSave.ts` e no teste dele só a linha do gatilho e um teste (autorizado pelo AG00, a T-090c do AG03 já terminou).

## Escopo

- `dismissAchievementNotification()` (`src/core/engine.ts`) emite `achievementNotificationDismissed: { id }` quando havia um id na fila.
- Acrescentar o evento a `SAVE_TRIGGER_EVENTS` em `src/app/purchaseSave.ts` e um teste (fechar grava sem esperar o autosave).
- Testes do núcleo: emite com id; fila vazia não emite.

## Critério de pronto

- [ ] lint, typecheck, test e build passam (se falhar só em `src/ui/tutorial/`, é trabalho do AG04 em andamento; relatar).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
