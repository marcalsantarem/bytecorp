# BRF-031 · AG04 · Indicador do estágio atual

- **Task:** T-028 (marco M2)
- **Dono:** AG04
- **Depende de:** T-018 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/index.css`

## Objetivo

Mostrar na tela o estágio corporativo atual e o requisito do próximo, e limpar uma chave de texto sem uso.

## Contexto

Bíblia 1.2 (sete estágios) e 18.7 (a transição cinematográfica é do M6, não faça aqui). Núcleo: `engine.stageInfo` devolve `{ current: StageDef | undefined, next: StageDef | null }` (`StageDef` tem `nameKey` e `requirement`); evento `stageChanged` (`from`, `to`); `useEngineRevision` já re-renderiza a partir dos eventos. Nomes dos estágios: chaves `stage.*` em `src/i18n/content/` (já existem, do AG07). O texto de requisito já tem um hook reutilizável em `src/ui/components/useRequirementText.ts`. A coluna central (núcleo e botão de clique) aparece na aba Núcleo no mobile.

## Escopo

- Faz: indicador discreto na coluna central, acima da cena do núcleo, em painel neon pequeno: rótulo "Estágio", nome do estágio atual e, abaixo, o próximo estágio com o requisito de desbloqueio em texto (sem barra de progresso); no último estágio, mostrar só o atual; atualiza sozinho quando o estágio muda; textos por i18n em `src/i18n/ui/` (pt-BR e en, mantendo os dois dicionários completos); remover a chave sem uso `core.infraPlaceholder` dos dois dicionários de interface; sem texto cortado nem rolagem horizontal em 375 px.
- Não faz: animação de transição, mudança no núcleo ou no catálogo, barra de progresso.

## Critério de pronto

- [ ] No navegador (1280 px e 375 px; a pane pode estar oculta e só redesenha após uma captura de tela, então use estado salvo e DOM): em jogo novo mostra "Solo Hacker" e o próximo estágio com o requisito; ao cruzar o limite do próximo estágio (edite o save no IndexedDB com `bytesEarned` perto do limite e clique até cruzar), o indicador passa a mostrar o novo estágio e o seguinte; no estágio final mostra só o atual; sem rolagem horizontal. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
