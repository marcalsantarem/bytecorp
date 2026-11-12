# BRF-037 · AG04 · Indicador de aba só para equipamento novo

- **Task:** T-058 (marco M2, pedido do usuário)
- **Dono:** AG04
- **Depende de:** T-057 (feita; `src/ui/shop/ShopPanel.tsx` calcula as categorias com ponto e `CategoryTabs.tsx` o desenha)
- **Pode escrever em:** `src/ui/shop/`, `src/i18n/ui/`

## Objetivo

O ponto na aba de categoria deve sinalizar um **equipamento novo** a comprar, e não qualquer equipamento comprável.

## Contexto

Hoje a aba mostra o ponto quando há algum equipamento desbloqueado e comprável em x1 (`status === 'unlocked'` e `modes.x1.quantity > 0`). O usuário percebeu que isso marca categorias cujos equipamentos já são obsoletos diante de outros que rendem mais, e quer que o ponto signifique "há um equipamento que você ainda não tem".

## Escopo

- Faz: a aba recebe o ponto somente quando a categoria tem ao menos um equipamento desbloqueado, comprável em x1 **e com nenhuma unidade comprada** (`owned === 0`). Basta comprar uma unidade para o ponto daquele equipamento sumir; a aba só mantém o ponto se outro equipamento da categoria também for novo e comprável. Atualiza sozinho. Mesmo comportamento no mobile e no desktop. Ajustar o nome acessível do indicador (por i18n, pt-BR e en) para refletir o novo sentido, por exemplo "novo equipamento disponível".
- Não faz: mudar regras de compra, o visual do ponto, a estrutura das abas, melhorias.

## Critério de pronto

- [ ] Teste automatizado (ambiente node, sem DOM) para a função que decide as categorias marcadas, extraída para um arquivo próprio em `src/ui/shop/` se preciso: sem saldo nenhum ponto; item novo comprável marca; item já comprado (`owned > 0`) não marca mesmo com saldo; item desbloqueado e novo mas sem saldo não marca; item `revealed` não marca; categoria com um item antigo e outro novo comprável marca; categoria só com itens comprados não marca.
- [ ] No navegador (375 px e 1280 px; edite o save no IndexedDB e recarregue; a tela só redesenha com a pane visível ou após uma captura de tela): com saldo alto e nenhum equipamento comprado, os pontos aparecem nas categorias com itens desbloqueados; ao comprar uma unidade de todos os itens desbloqueados de uma categoria, o ponto dela some sem trocar de aba. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
