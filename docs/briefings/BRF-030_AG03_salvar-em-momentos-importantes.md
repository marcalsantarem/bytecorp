# BRF-030 · AG03 · Salvar após contratar, evoluir e comprar melhorias

- **Task:** T-022 (marco M2)
- **Dono:** AG03
- **Depende de:** T-019 e T-020 (feitas)
- **Pode escrever em:** `src/app/`, `src/core/save/`, `src/platform/`

## Objetivo

Gravar o save logo após as novas ações importantes do M2 e conferir que o formato do save cobre os novos estados.

## Contexto

Bíblia 21.2 (autosave e salvamentos em momentos importantes) e 21.3 (versão e migrações). `src/app/purchaseSave.ts` hoje agenda uma gravação (janela de 300 ms, agrupando compras seguidas) ao ouvir o evento `purchase` (equipamentos). Eventos novos no núcleo (`src/core/events.ts`): `agentHired`, `agentLeveled`, `upgradePurchased`, `stageChanged`. O estado `run.agents` (quantidade e nível) e `run.upgrades` já existem em `src/core/state.ts` e no codec (`src/core/save/codec.ts`, `SAVE_VERSION` 1, `MIGRATIONS`). O reinício completo (`resetGame`) grava sozinho.

## Escopo

- Faz: a persistência passa a agendar a gravação também nos quatro eventos novos, com o mesmo agrupamento (uma gravação para várias ações seguidas, de tipos misturados) e sem se atropelar; remove todas as inscrições ao encerrar a sessão; testes com engine real e `MemoryStorage` e catálogo próprio: contratar, evoluir, comprar melhoria e mudar de estágio gravam sem esperar o autosave; ações de tipos diferentes na mesma janela geram uma gravação só; depois do `dispose` nenhuma gravação ocorre; ida e volta do codec com agentes, nível, melhorias e estágio avançado preserva o estado e a produção; um save com um id de agente, melhoria ou equipamento que não existe mais no catálogo carrega sem erro e o engine continua funcionando (o id desconhecido é ignorado nos cálculos). Se alguma dessas verificações mostrar que o formato precisa mudar, suba `SAVE_VERSION`, escreva a migração e teste-a; se não precisar, não mude o formato e diga isso na entrega.
- Não faz: interface, regras do núcleo, apagar saves.

## Critério de pronto

- [ ] Testes acima passam.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
