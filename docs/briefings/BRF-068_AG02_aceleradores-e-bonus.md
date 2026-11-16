# BRF-068 · AG02 · Aceleradores e bônus temporários (regras)

- **Tasks:** T-065 e T-066 (marco M4), na ordem, relatório único
- **Dono:** AG02
- **Depende de:** D-16 e D-17 em `docs/decisoes.md`; T-068 (feita: `computeOffline` aceita segmentos `{durationMs, multiplier}`)
- **Pode escrever em:** `src/core/progression/` e, no mínimo, `src/core/state.ts`, `engine.ts`, `events.ts` (AG01) e `src/core/save/codec.ts` (AG03: só os campos novos, com `SAVE_VERSION` + migração e testes do codec).

## Objetivo

Regras de aceleradores (Bíblia 13) e de bônus temporários, sem aplicar na produção (T-067) e sem interface.

## Escopo

**T-065 Aceleradores**
- Estado: acelerador ativo `{ id, multiplier (2 ou 5), remainingMs }` ou nenhum, e inventário de itens `{ multiplier, durationMs ou remainingMs }` que não expiram. Em `meta` ou em `run`? O acelerador sobrevive ao Reboot (13.3: o temporizador corre) e ao offline; decidir e documentar: `meta`. Concessões já recebidas (primeiro estágio X, Reboot) também em `meta`, para não repetir.
- Durações: 15, 30 e 60 min; multiplicadores 2x e 5x; sem ativação automática.
- Engine: `activateAccelerator(itemId, { replace?: 'discard' | 'store' })`: se nenhum ativo, ativa; se houver ativo e a opção faltar, retorna `{ needsDecision: true, current, incoming }` sem alterar nada (a UI mostra a comparação e pergunta); com `discard` perde o tempo restante do anterior, com `store` devolve o anterior ao inventário com o tempo restante. O multiplicador mais alto prevalece (não acumulam). Retorna resultado, não lança.
- O temporizador avança com `advance(ms)` (tempo decorrido, nunca por frames) e expira com evento `acceleratorExpired`; eventos `acceleratorActivated`, `acceleratorStored`, `acceleratorGranted`; um aviso `acceleratorEnding` quando faltar um limiar configurável (padrão 30 s).
- Offline: função que, dado o acelerador ativo e `awayMs`, devolve os segmentos `{durationMs, multiplier}` para `computeOffline` (multiplicador enquanto durar, depois 1) e reduz `remainingMs` (13.3: o tempo corre offline). Não ligar ao bootstrap (T-069 está fechada); expor `engine.offlineSegments(awayMs)` e anotar no relatório a pequena ligação que falta em `src/app/offlineSession.ts` (AG03).
- Concessão (D-16): ouvir `stageChanged` (primeira vez em cada estágio, exceto o inicial) e `reboot`; concede itens definidos por uma tabela injetável `ACCELERATOR_GRANTS` (catálogo provisório de teste em `progression/`; os valores reais vêm da T-070); registra a concessão para não repetir.

**T-066 Bônus temporários**
- Modelo genérico `{ id, multiplier, remainingMs }` em lista no estado (D-10: camada `Π temporários`), com expiração por tempo decorrido, evento `temporaryBonusExpired`, concessão por `grantTemporaryBonus(...)` e sobrevivência ao Reboot (bônus de conquistas, 9.3). Sem fontes reais no M4; só as regras e testes.
- `engine.temporaryMultiplier`: produto dos multiplicadores dos bônus ativos × multiplicador do acelerador ativo (D-17). Não aplicar ainda na produção (T-067).

- Testes: todos os caminhos acima com o catálogo real, tempo por `advance`, equivalência entre passos finos e um passo grande, expiração dentro de um único `advance`, offline, concessão sem repetição, Reboot preserva ativo e inventário.
- Não faz: aplicar na produção e no clique (T-067), catálogo real (T-070), interface, ligação ao bootstrap.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; relatório lista campos novos do estado, versão do save e assinaturas para a UI e a T-067.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
