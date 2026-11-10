# BRF-012 · AG04 · Botão de clique e núcleo

- **Task:** T-012 (marco M1)
- **Dono:** AG04
- **Depende de:** T-007, T-013 e T-010 (feitas) e T-011 (mesmos arquivos de interface; só começa depois dela)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/index.css`

## Objetivo

Área central definitiva: núcleo visual animado e botão de clique abaixo dele, no estilo da referência.

## Contexto

Bíblia 5.1 a 5.4. O botão fica abaixo do núcleo e é independente dele; o núcleo é só visual, não interativo e não mostra B/s; clique contínuo sem limite nem combo; animação curta de compressão; o valor por clique aparece junto ao botão. `mountCoreScene(canvas, engine.events)` em `src/render/coreScene.ts` devolve a função de limpeza (o canvas precisa de tamanho por CSS; veja `docs/AG05/` se existir e o próprio arquivo). `engine.click()` e `engine.clickValue` (valor sem crítico). Referência de estilo: `docs/referencias/` (botão grande com moldura neon). Use o componente de painel neon criado na T-011.

## Escopo

- Faz: componente do núcleo com `<canvas>` montado num `useEffect` com limpeza; botão abaixo dele com texto `click.button`, compressão ao pressionar, moldura neon, valor por clique formatado; substituir o círculo provisório e o placeholder de infraestrutura no centro (`App.tsx` e `layout/`); funcionar com mouse, toque e teclado (Enter e Espaço), sem atraso de clique no mobile; manter o `aria-label` e o foco visíveis.
- Não faz: alterar `src/render/` ou o núcleo (peça ajustes ao AG00); som; texto flutuante de ganho (fica para depois); cena Three.js (M6).

## Critério de pronto

- [ ] No navegador (1280 px e 375 px): o núcleo aparece, gira e pulsa a cada clique; o botão fica abaixo; Bytes sobem; trocar de aba no mobile e voltar não duplica a cena (a limpeza roda). A pane pode estar oculta e o `requestAnimationFrame` não dispara: confirme por estado do engine e, se possível, mantenha a pane visível para a checagem do canvas. Restaurar o tamanho da janela e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
