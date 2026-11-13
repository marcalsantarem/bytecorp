# BRF-033 · AG04 · Painel de melhorias comuns

- **Task:** T-027 (marco M2)
- **Dono:** AG04
- **Depende de:** T-020, T-021 e T-024 (feitas)
- **Pode escrever em:** `src/ui/shop/`, `src/ui/components/`, `src/i18n/ui/`. **Não toque** em `src/ui/core/`, `src/ui/layout/GameLayout.tsx`, `src/ui/App.tsx` nem `src/index.css` (outra task, T-055, roda ao mesmo tempo nessas áreas).

## Objetivo

Painel de melhorias comuns na loja: listar, ver requisito e comprar, no mesmo acabamento neon.

## Contexto

Bíblia 8.1 a 8.6. API do núcleo (confira nomes e tipos em `src/core/engine.ts` e `src/core/economy/upgrades.ts`): `engine.upgradeList()` (lista única já ordenada por custo crescente) e `upgradeInfo(id)` com estado (`locked`, `available`, `purchased`), `cost`, `effect` e requisito (`unlockBytesEarnedInRun`); `engine.buyUpgrade(id)` (boolean). Catálogo: `engine.catalog.upgrades` (`nameKey`, `descriptionKey`, `icon`). Já existem textos de efeito dos agentes (`agents.effect.*`, em `src/ui/agents/`) que podem ser reaproveitados para descrever o benefício (extraia um helper compartilhado em `src/ui/components/` se for o caso, sem mudar o painel de agentes). Estilo: `NeonPanel`, cartões da loja em `src/ui/shop/`, `useRequirementText`.

## Escopo

- Onde: dentro do painel da loja (`ShopPanel`), um seletor de duas visões no topo, Equipamentos e Melhorias (segmentado, 44 px de altura no mobile); a visão de equipamentos continua como está.
- Cartão da melhoria: ícone, nome, descrição, custo, benefício (texto por tipo de efeito, com valores formatados), requisito de desbloqueio em texto (gere N Bytes na execução, sem barra de progresso) e estado atual. Compra imediata, sem confirmação. Estados: `locked` mostra o requisito e botão desabilitado; `available` com botão ativo se houver saldo, desabilitado caso contrário, custo sempre visível; `purchased` continua na lista com botão desabilitado e sem selo ou emblema especial. Lista única na ordem de `upgradeList()`. Sem notificação de desbloqueio.
- Ícones: acrescentar ao mapa em `src/ui/components/iconMap.ts` os que faltam (lista em `docs/AG07/melhorias-m2.md`: `terminal`, `gauge`, `keyboard`, `ticket-percent`, `hand-coins`, `piggy-bank`, `trending-up`, `sparkles`, `rocket`; confira os `icon` de `CATALOG.upgrades`) e estender `iconMap.test.ts` para cobrir `CATALOG.upgrades`.
- Textos só por i18n em `src/i18n/ui/` (pt-BR e en completos). Números com `formatBytes` e `formatCount`. Alvos de toque de 44 px no mobile; sem texto cortado em 1024, 1280 e 375 px.
- Não faz: regras de jogo em componentes, alterar o núcleo ou o catálogo, mover a visão de equipamentos.

## Critério de pronto

- [ ] No navegador (1280 px, 1024 px e 375 px; edite o save no IndexedDB e recarregue; a tela só redesenha com a pane visível ou após uma captura de tela): o seletor alterna entre equipamentos e melhorias; melhoria bloqueada mostra o requisito e não compra; ao atingir o total gerado passa a disponível; comprar debita o custo fixo, marca como comprada e não permite repetir; produção ou valor do clique mudam conforme o efeito (por exemplo `macro_script` soma +1 ao clique); nenhum ícone cai no padrão; custos não ficam cortados. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
