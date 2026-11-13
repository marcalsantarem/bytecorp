# BRF-035 · AG04 · Categorias de equipamento em abas no mobile

- **Task:** T-057 (marco M2, pedido do usuário)
- **Dono:** AG04
- **Depende de:** nenhuma
- **Pode escrever em:** `src/ui/shop/`, `src/ui/components/`, `src/i18n/ui/`. **Não toque** em `index.html`, `src/main.tsx`, `src/app/`, `public/` nem `vite.config.ts` (outra task, T-056, roda ao mesmo tempo).

## Objetivo

Trocar o seletor suspenso (combobox) de categorias do mobile por abas, para trocar de categoria com um toque e ver de relance quais categorias já têm algo para comprar.

## Contexto

Hoje o `ShopPanel` (`src/ui/shop/ShopPanel.tsx`) mostra abas por categoria no desktop e um `select` no mobile. O jogador quer navegar entre categorias com facilidade e enxergar em qual delas já existe equipamento possível de comprar. Bíblia 6.4: abas por categoria no desktop e navegação compacta no mobile; ordem fixa, sem busca nem filtro. Núcleo: `engine.equipmentList()` traz, por equipamento, `status`, `owned` e `modes` (quantidade e custo por modo); um equipamento "possível de comprar" é o desbloqueado com `modes.x1.quantity > 0`. As cinco categorias: Rede, Processamento, Armazenamento, Refrigeração e Infraestrutura. Largura de referência: 375 px. A visão Melhorias (segmento Equipamentos/Melhorias) continua como está.

## Escopo

- Faz: no mobile, as categorias viram abas visíveis (as cinco ao mesmo tempo, ou uma barra rolável horizontalmente com a aba ativa sempre trazida para a vista, e a rolagem alcançando todas), com ícone por categoria (Lucide: por exemplo `router`, `cpu`, `hard-drive`, `snowflake`, `plug-zap`; confira que existem e inclua no mapa de ícones de `src/ui/components/`) e rótulo legível sem cortar; alvos de toque de 44 px; aba ativa destacada; aba com semântica correta (`role="tablist"`, `role="tab"`, `aria-selected`, teclado com setas no desktop). **Indicador de disponibilidade** em cada aba (no mobile e no desktop, é o mesmo componente): um ponto ou emblema visível quando houver ao menos um equipamento possível de comprar na categoria, e **não apenas pela cor** (forma de ponto, mais nome acessível "tem equipamento disponível" por i18n); atualiza sozinho conforme os Bytes mudam e some quando nada é comprável. Aba lembrada enquanto o painel estiver montado (como hoje). Textos só por i18n em `src/i18n/ui/` (pt-BR e en completos).
- Não faz: mudar regras de compra, o desktop além do indicador, a visão de melhorias, ordem dos cartões, busca ou filtros (a Bíblia proíbe).

## Critério de pronto

- [ ] No navegador (375 px, 360 px, 1024 px e 1280 px; edite o save no IndexedDB e recarregue; a tela só redesenha com a pane visível ou após uma captura de tela): sem o `select` de categoria no mobile; as cinco categorias alcançáveis com um toque ou um deslize; trocar de aba muda a lista; alvos de 44 px; sem texto cortado nem rolagem horizontal da página; o indicador aparece nas categorias com algo comprável e some nas demais; com saldo zero não aparece em nenhuma; ao ganhar Bytes (ou editar o save e recarregar) ele aparece sem trocar de aba. Meça por `getBoundingClientRect`.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- [ ] Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor que iniciou.

## Entrega

Responder ao AG00 com: **entregue, validação (medidas), suposições, não testado, próximo passo**. Não commitar.
