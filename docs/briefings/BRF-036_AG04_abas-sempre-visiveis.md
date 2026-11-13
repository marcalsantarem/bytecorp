# BRF-036 · AG04 · Abas de categoria sempre visíveis no mobile

- **Task:** T-057 (reaberta)
- **Dono:** AG04
- **Depende de:** entrega anterior da T-057 (`src/ui/shop/CategoryTabs.tsx`)
- **Pode escrever em:** `src/ui/shop/`, `src/ui/components/`, `src/i18n/ui/`

## Objetivo

As cinco abas de categoria precisam estar visíveis ao mesmo tempo em 360 e 375 px, para o jogador ver de relance em quais há equipamento comprável.

## Contexto

Na entrega anterior o mobile ganhou abas, mas a barra rola na horizontal: em 375 px só Rede, Processamento e metade de Armazenamento aparecem; Refrigeração e Infraestrutura (e os pontos de disponibilidade delas) ficam fora da vista. O pedido do usuário é exatamente poder ver de relance quais categorias têm algo comprável, e isso não se cumpre com abas escondidas. O AG00 conferiu no navegador: no mobile os alvos têm 44 px, o indicador funciona, mas 3 das 5 abas ficam fora da tela.

## Escopo

- Faz: no mobile (abaixo de `lg`), as cinco abas numa única linha, todas visíveis sem rolar. Sugestão: as abas inativas só com o ícone (alvo de pelo menos 44 x 44 px, nome acessível pelo rótulo da categoria) e o ponto de disponibilidade bem visível em cada uma, e a aba ativa com ícone e rótulo; ou outra solução que mostre as cinco e todos os pontos de uma vez, sem texto cortado. O rótulo da categoria ativa também pode aparecer como título acima da lista, se ajudar a entender os ícones. Manter a semântica de abas, a navegação por setas, o indicador não apenas por cor e o comportamento do desktop como está. Nada de rolagem horizontal da barra no mobile.
- Não faz: mudar regras de compra, desktop, melhorias, ordem dos cartões.

## Critério de pronto

- [ ] No navegador (375, 360 e 320 px de largura; edite o save no IndexedDB e recarregue; a tela só redesenha com a pane visível ou após uma captura de tela, que pode precisar de uma segunda tentativa): as cinco abas visíveis ao mesmo tempo, sem rolagem horizontal da página nem da barra; alvos de 44 px; os pontos aparecem em todas as categorias com algo comprável, inclusive Refrigeração e Infraestrutura; trocar de aba continua funcionando; desktop (1280 e 1024 px) sem regressão. Meça por `getBoundingClientRect` (largura total das abas <= largura disponível). Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação (medidas), suposições, não testado, próximo passo**. Não commitar.
