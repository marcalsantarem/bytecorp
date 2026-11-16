# BRF-072 · AG03 · Ligar os segmentos de acelerador ao offline

- **Task:** T-069b (complemento da T-069, marco M4)
- **Dono:** AG03
- **Depende de:** T-067 (feita)
- **Pode escrever em:** `src/app/`. Não editar `src/core` nem `src/ui`.

## Objetivo

Hoje `creditAway` em `src/app/offlineSession.ts` chama `engine.applyOffline(away)` sem segmentos, então o acelerador ativo e os bônus temporários não contam durante a ausência (Bíblia 13.3 e 14.4). Ligar `engine.offlineSegments`.

## Escopo

- Em `creditAway` (único ponto de crédito): `const segments = engine.offlineSegments(away)` e depois `engine.applyOffline(away, segments)`, nessa ordem e uma só vez por ausência. `offlineSegments` já desconta os temporizadores; `applyOffline` usa `productionBase × segmentos` (sem dobrar). Cobre carga do save, volta à aba e lacuna do relógio.
- Cuidado com os créditos repetidos do `guardedClock` com a aba oculta (vários créditos de ~60 s): cada um chama `offlineSegments` com o seu intervalo; o temporizador deve ir descontando entre eles.
- Salvar logo depois de creditar (já existe), pois o acelerador mudou.
- Testes (`offlineSession.test.ts`): ausência de 1 h com acelerador 5x de 30 min credita 30 min × 5 + 30 min × 1 e deixa o acelerador expirado; acelerador maior que a ausência continua ativo com o tempo restante; dois créditos seguidos; sem acelerador, igual a antes; recarregar logo depois não credita de novo.
- Não faz: interface, regras.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
