# BRF-006 · AG05 · Cena provisória do núcleo

- **Task:** T-013 (marco M1)
- **Dono:** AG05
- **Depende de:** nenhuma
- **Pode escrever em:** `src/render/`

## Objetivo

Núcleo visual central em Canvas 2D, provisório até a cena Three.js do M6.

## Contexto

Bíblia 5.2 (circular, anéis concêntricos, brilho neon, efeitos de impacto, partículas, ondas de energia; não interativo e sem exibir B/s), 1.4 (identidade visual) e 19 (economia independente da renderização). Cores do tema em `src/index.css` (`#00ffcc`, `#ff007f`). Eventos do núcleo em `src/core/events.ts`: `click` traz `critical: boolean`. O AG04 vai montar a cena num `<canvas>` na T-012.

## Escopo

- Faz: `src/render/coreScene.ts` exportando `mountCoreScene(canvas: HTMLCanvasElement, events: EventBus<GameEvents>): () => void`. Loop por `requestAnimationFrame`, nitidez em telas de alta densidade, ajuste ao tamanho do canvas, anéis girando com brilho, pulso a cada clique e efeito mais forte (onda, partículas, magenta) no crítico. Respeitar `prefers-reduced-motion`. A função devolvida para o loop, os observadores e remove os listeners.
- Não faz: React, áudio, Three.js, ler ou alterar o estado do jogo.

## Critério de pronto

- [ ] Teste (ambiente node, com canvas, contexto 2D e `requestAnimationFrame` falsos) prova que montar inscreve em `click` e desmontar cancela o loop e remove a inscrição.
- [ ] Nada em `src/render` importa React.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
