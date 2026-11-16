# BRF-079 · AG03 · stageBefore e concessões no resultado offline

- **Task:** T-074d (D2 da QA do M4)
- **Dono:** AG03
- **Pode escrever em:** `src/app/`. Não editar `src/core` nem `src/ui`.

## Objetivo

O resumo de retorno não mostra o estágio alcançado nem as concessões recebidas na ausência porque o resultado pendente não guarda o estado anterior.

## Escopo

- Em `PendingOffline` (`src/app/offlineSession.ts`), guardar junto de cada resultado `stageBefore` (estágio antes do crédito) e, se simples, o número de aceleradores concedidos durante o crédito (ex.: inventário antes e depois, ou contagem dos eventos `acceleratorGranted` entre `peek`s). Créditos seguidos somam: `stageBefore` é o do primeiro crédito não consumido; concessões somam.
- Expor pela API que a UI já consome (`consume()` devolve o resultado; acrescentar campos ou um objeto `{ result, stageBefore, grants }`), sem quebrar os usos atuais; o AG04 adapta a UI depois (relatar o formato exato).
- Testes em `offlineSession.test.ts`: estágio muda na ausência, concessão durante a ausência, créditos seguidos, sem mudança.
- Não faz: interface.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
