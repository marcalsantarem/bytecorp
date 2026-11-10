# BRF-010 · AG03 · Salvar após compras

- **Task:** T-009 (marco M1)
- **Dono:** AG03
- **Depende de:** T-008 (feita; evento `purchase` em `src/core/events.ts`)
- **Pode escrever em:** `src/app/`, `src/core/save/`, `src/platform/`

## Objetivo

Gravar o save logo após cada compra, além do autosave, para não perder progresso ao recarregar.

## Contexto

Bíblia 21.2 (autosave e salvamentos em momentos importantes). Hoje `src/app/bootstrap.ts` salva a cada 10 s, ao ocultar a aba e em `pagehide`; a gravação em IndexedDB é assíncrona e a perda foi observada ao recarregar logo após uma ação. `engine.events.on('purchase', ...)` avisa cada compra.

## Escopo

- Faz: salvar após `purchase`, juntando várias compras seguidas em uma gravação (por exemplo, no fim do mesmo ciclo de eventos ou com atraso curto de poucas centenas de ms); garantir que gravações não se atropelem (a última vence); remover a inscrição ao encerrar a sessão; testes com o engine real e `MemoryStorage` (compra, espera, o save contém a compra; várias compras geram uma gravação).
- Não faz: mudar o formato do save, interface, salvar a cada clique.

## Critério de pronto

- [ ] Teste prova que, após `buyEquipment`, o save carregado traz a quantidade comprada sem esperar o autosave.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
