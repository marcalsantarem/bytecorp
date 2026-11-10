# BRF-011 · AG04 · Loja de equipamentos

- **Task:** T-011 (marco M1)
- **Dono:** AG04
- **Depende de:** T-008 e T-010 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/index.css`

## Objetivo

Loja de equipamentos funcional, já com o acabamento neon da referência visual.

## Contexto

Bíblia 6.3 a 6.6 e 15.7. API do núcleo: `engine.equipmentList()` e `equipmentInfo(id)` (status `hidden`/`revealed`/`unlocked`, `owned`, `nextCost`, `modes.x1/x10/max` com `{quantity, cost}`, `unitProduction`) e `engine.buyEquipment(id, 'x1'|'x10'|'max')` (confira os nomes exatos em `src/core/engine.ts` e `src/core/economy/`). Catálogo: `engine.catalog.equipment` (ícone é nome do lucide-react; textos por `nameKey` e `descriptionKey`). Referência de estilo: `docs/referencias/ui-referencia-1.jpg` e `README.md` (só inspiração; onde diverge da Bíblia, vale a Bíblia). Painel atual: `ShopPanel` em `src/ui/layout/Panels.tsx`.

## Escopo

- Regras da loja: abas por categoria no desktop (networking, processing, storage, cooling, infrastructure) e navegação compacta no mobile com lista compacta; ordem fixa do catálogo (custo crescente), sem reordenar, sem busca ou filtro. `hidden` não aparece; `revealed` mostra nome, ícone e requisito de desbloqueio (texto por i18n, valores formatados) e não compra; `unlocked` mostra cartão completo sem destaque ao desbloquear.
- Cartão: ícone, nome, descrição curta, custo, produção unitária em B/s, quantidade e controle de compra com seletor x1/x10/MAX próprio (começa em x1, vale só na sessão, sem seletor global). Compra imediata, sem confirmação. Sem saldo: botão desabilitado, custo continua visível, sem indicação do que falta.
- Acabamento (referência): componente reutilizável de painel neon com cantos chanfrados e brilho ciano ou magenta em `src/ui/components/`, aplicado à loja e aos painéis do layout; nos cartões, barra colorida em gradiente ciano para magenta que enche até o próximo múltiplo de 25 unidades. A barra é só visual e não altera a economia. Mapa de nomes de ícone do catálogo para componentes do lucide-react em um módulo único (ícone desconhecido cai num padrão).
- Textos só por i18n (`src/i18n/ui/`). Números com `formatBytes`, `formatBytesPerSecond` e `formatCount`.
- Não faz: botão de clique e cena (T-012), regra de compra na interface, agentes e melhorias, texto novo de conteúdo (`src/i18n/content/` é do AG07).

## Critério de pronto

- [ ] No navegador (1280 px e 375 px, via `resize_window`, `javascript_tool` e `read_page`): aba troca de categoria, MAX e x10 compram a quantidade mostrada e debitam o custo, botão desabilita sem saldo, item `revealed` não compra, quantidade e B/s sobem após a compra. Para testar sem esperar, use o console do navegador sobre o engine ou clique. Restaurar o tamanho da janela e encerrar o servidor.
- [ ] Trocar o idioma atualiza os textos novos.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
