# BRF-024 · AG04 · Painel de agentes

- **Task:** T-026 (marco M2)
- **Dono:** AG04
- **Depende de:** T-019 e T-023 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/index.css`

## Objetivo

Painel de agentes funcional: listar, contratar e evoluir, no mesmo acabamento neon da loja.

## Contexto

Bíblia 7.2 a 7.7. API do núcleo (confira nomes e tipos em `src/core/engine.ts` e `src/core/economy/agents.ts`): `engine.agentList()` (já ordenada pelo próximo custo de contratação) e `agentInfo(id)` com `status` (`hidden`, `revealed`, `unlocked`), `count`, `level`, `hireCost`, `levelCost`, `bonus` (lista de efeitos já calculada) e `levelProgress` (0 a 1, saldo dividido pelo custo de evolução; nulo sem agente); ações `engine.hireAgent(id)` e `engine.levelUpAgent(id)` (devolvem boolean). Catálogo: `engine.catalog.agents` (`nameKey`, `descriptionKey`, `specialtyKey`, `icon`). Hoje o painel é um texto provisório em `src/ui/layout/Panels.tsx` (coluna esquerda no desktop; aba Agentes no mobile). Estilo e componentes: `NeonPanel`, `EquipmentIcon`/`iconMap.ts` (já cobre os ícones dos agentes), cartões da loja em `src/ui/shop/` como modelo. Os bônus dos agentes ainda não entram na produção (T-021): mostre o bônus do agente, sem prometer efeito no B/s.

## Escopo

- Cartão do agente: ícone, nome, descrição, especialidade, próximo custo de contratação, quantidade contratada, nível atual, barra de progresso do nível (`levelProgress`, só quando há agente), bônus atual por efeito (texto por tipo de efeito em i18n, com valores formatados) e dois controles: **Contratar** (um por vez, sem x10 nem MAX) e **Evoluir** (uma unidade por vez, mostra o custo; só ativo com agente).
- Regras de exibição: `hidden` não aparece; `revealed` mostra nome, ícone e requisito de desbloqueio, sem controles; `unlocked` mostra o cartão completo. Lista única, sem categorias, na ordem de `agentList()`. Sem saldo: botão desabilitado e custo visível, sem indicar o que falta. Sem confirmação nem animação obrigatória.
- Alvos de toque de 44 px no mobile (como na T-049); sem texto cortado em 375 px.
- Textos só por i18n em `src/i18n/ui/` (os de conteúdo já existem). Números com `formatBytes` e `formatCount`.
- Não faz: regras de jogo em componentes, alterar o núcleo ou o catálogo, melhorias comuns (T-027).

## Critério de pronto

- [ ] No navegador (1280 px e 375 px; a pane pode estar oculta, então prefira `getBoundingClientRect`, `read_page` e estado salvo): com Bytes suficientes, contratar sobe a quantidade e debita o custo; evoluir sobe o nível e debita o custo; sem agente, Evoluir fica desabilitado; `revealed` não tem controles; os cinco ícones dos agentes renderizam (nenhum cai no ícone padrão). Para criar o estado de teste, edite o save no IndexedDB e recarregue. Ao terminar, apague o banco de teste, restaure o tamanho da janela e encerre o servidor.
- [ ] Trocar o idioma atualiza os textos novos.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
