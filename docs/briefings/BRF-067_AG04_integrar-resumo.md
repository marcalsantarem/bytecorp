# BRF-067 · AG04 · Integrar o resumo de retorno ao jogo

- **Task:** T-073 (fecho da integração)
- **Dono:** AG04
- **Depende de:** T-069 (entregue, ainda não commitada) e o resumo de retorno da T-073
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`; em `src/app/` só o mínimo de tipos se for indispensável (dono AG03; relatar).

## Objetivo

Fazer a janela de resumo aparecer no jogo real quando houver crédito offline.

## Contexto

AG03 entregou `src/app/offlineSession.ts`: `session.offline` (classe `PendingOffline` com `set/peek/consume/clear`, créditos seguidos antes da leitura somam) e o evento `offlineApplied`. O resultado é `OfflineResult` sem `stageBefore`. O AG04 já tem `OfflineSource`/`PendingOffline` (tipo da UI com `result` e `stageBefore?`) em `src/ui/offline/useOfflineSummary.ts`. `App.tsx` passa hoje só `engine` ao `GameScreen`.

## Escopo

- Adaptar `session.offline` a `OfflineSource` (adaptador na UI): `consume()` ao montar, ao receber `offlineApplied` e ao voltar à aba. `stageBefore`: o estágio do `engine.state.run.stage` anterior ao crédito não está disponível depois do fato; usar `engine.stageInfo`/estado apenas para o que for derivável, e se `stageBefore` não puder ser obtido de forma confiável sem tocar em `src/app`, omitir a seção "novo estágio" e relatar a sugestão (guardar `stageBefore` no pendente, pelo AG03).
- Passar `session.offline` do `App.tsx` ao `GameScreen` e renderizar `<OfflineSummary />`.
- Teste de integração (jsdom): sessão com crédito pendente abre o resumo, fechar não reabre, sem pendente não abre.
- Verificar no navegador: semear o save com `savedAt` de 3 h atrás (IndexedDB `byte-corp-idle` / `kv` / `save`), recarregar e ver o resumo com os Bytes creditados; recarregar de novo e confirmar que não aparece nem credita de novo. Restaurar a janela e limpar o banco de teste.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação no navegador relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
