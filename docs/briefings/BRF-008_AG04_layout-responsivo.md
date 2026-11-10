# BRF-008 · AG04 · Layout responsivo

- **Task:** T-010 (marco M1)
- **Dono:** AG04
- **Depende de:** T-006 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/main.tsx`, `src/index.css`, `index.html`

## Objetivo

Casca responsiva do jogo, com lugares reservados para a loja (T-011) e para o botão de clique e a cena (T-012).

## Contexto

Bíblia 15.1 a 15.4 e 15.6. Desktop: topo com recursos; esquerda com estatísticas resumidas e agentes; centro com infraestrutura, núcleo e botão de clique; direita com loja (rolagem independente); rodapé com ações permanentes. Mobile: cabeçalho compacto de recursos, cena central, botão de clique, abas inferiores, painéis compactos. Sempre visíveis: Bytes, B/s e Quantum Cores. Rodapé: Reboot, Árvore Quantum e Conquistas, todos desabilitados por enquanto (sem tela ainda). Interface única, mesma base de componentes. Estado em `src/ui/App.tsx` (`GameScreen`, com `useEngineRevision`); o clique atual (`engine.click()`) e o círculo provisório continuam onde estão até a T-012. Textos só por i18n: chaves novas em `src/i18n/ui/pt-BR.ts` e `en.ts`.

## Escopo

- Faz: componentes de layout separados em `src/ui/` (por exemplo `layout/`); desktop em três colunas a partir de `lg`; mobile com abas inferiores (loja, agentes, núcleo) e painéis compactos; painéis reservados para loja e agentes com texto provisório; coluna esquerda com estatísticas simples do `engine.state.stats` (total gerado, cliques); rodapé com os três botões desabilitados.
- Corrige: em `App.tsx`, ao iniciar novo jogo pela tela de save corrompido, a nova sessão não é encerrada ao desmontar (só a primeira é). Guardar a sessão ativa e parar o relógio e o autosave na limpeza.
- Não faz: loja, botão de clique definitivo, cena, regras de jogo em componentes.

## Critério de pronto

- [ ] Verificado no navegador em 1280 px e 375 px de largura (`resize_window`): sem rolagem horizontal, os três recursos sempre visíveis, a loja rola sozinha no desktop, abas funcionam no mobile. A pane pode estar oculta: preferir `read_page` e `get_page_text` a capturas. Restaurar o tamanho (preset desktop) e encerrar o servidor ao terminar.
- [ ] Trocar de idioma atualiza todos os textos novos.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
