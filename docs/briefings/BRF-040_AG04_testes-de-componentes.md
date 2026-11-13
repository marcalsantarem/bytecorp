# BRF-040 · AG04 · Testes de componentes: loja, agentes e melhorias

- **Task:** T-030 (marco M2)
- **Dono:** AG04
- **Depende de:** T-027 e T-029 (feitas)
- **Pode escrever em:** `src/ui/` (arquivos `*.test.tsx` ao lado dos componentes e, se precisar, um auxiliar de teste em `src/ui/`), `src/i18n/ui/`. **Não toque** em `src/test/` (preparação do ambiente, do AG03), em `src/ui/components/iconMap.ts` nem em `src/core/catalog/` e `src/i18n/content/` (o AG07 trabalha neles ao mesmo tempo, na T-059).

## Objetivo

Cobrir com testes automáticos os componentes da loja de equipamentos, do painel de agentes e do painel de melhorias, para que mudanças futuras não quebrem o que foi conferido no navegador.

## Contexto

O Vitest tem agora um projeto de DOM: arquivos `*.test.tsx` rodam em jsdom com `@testing-library/react` e o preparo de `src/test/setup.ts` (jest-dom, limpeza entre testes, polyfills de `matchMedia` e `ResizeObserver`); `user-event` não está instalado, use `fireEvent`. Exemplo: `src/test/smoke.test.tsx` (renderiza `NeonPanel` no `I18nProvider`). Componentes: `src/ui/shop/` (`ShopPanel`, `EquipmentCard`, `UpgradeCard`, `CategoryTabs`, `newEquipment.ts`), `src/ui/agents/` (`AgentsPanel`, `AgentCard`), ganchos em `src/ui/components/` (`useRequirementText`, `useEffectText`). O re-render vem de `useEngineRevision` (eventos do `GameEngine`); crie o engine com estado de teste (como em `tests/` e `src/core/*.test.ts`) e use o `CATALOG` real **sem depender de contagens ou de ids que a T-059 pode acrescentar** (ids antigos como `home_router`, `echo_ai`, `macro_script`, `overclock_basic` são estáveis).

## Escopo

- Faz: testes `*.test.tsx` cobrindo, no mínimo:
  - loja de equipamentos: item oculto não aparece; revelado mostra o requisito e não tem botão de compra; desbloqueado mostra custo e produção; sem saldo o botão fica desabilitado e o custo continua visível; clicar em comprar debita, sobe a quantidade e a produção; seletor x1/x10/MAX por cartão compra a quantidade certa; trocar de categoria troca a lista; abas com `role=tab`, `aria-selected`, teclado (setas) e ponto de "novo equipamento disponível" conforme a regra (só equipamento novo e comprável);
  - agentes: oculto, revelado (requisito, sem botões), desbloqueado; contratar e evoluir debitam e atualizam quantidade e nível; Evoluir desabilitado sem agente; bônus exibido por tipo de efeito;
  - melhorias: bloqueada mostra requisito e botão desabilitado; disponível compra e vira "Comprada" com botão desabilitado e sem selo; não compra de novo; benefício por tipo de efeito; ordem por custo crescente;
  - a troca entre as visões Equipamentos e Melhorias na loja.
- Os testes usam consultas por papel e texto (`getByRole`, `getByText`) e `fireEvent`, e esperam as atualizações com `waitFor`/`act` quando o engine emite eventos; só acrescente `data-testid` se não houver como consultar de outro jeito.
- Se um teste revelar um defeito real num componente, corrija dentro de `src/ui/` quando for pequeno e diga na entrega; se for grande ou for do núcleo, relate sem corrigir.
- Não faz: mudar o visual ou o comportamento dos componentes além de correções de defeitos, mexer em `src/test/`, `iconMap.ts`, catálogo ou textos de conteúdo.

## Critério de pronto

- [ ] Todos os casos acima cobertos e passando; os polyfills de `matchMedia` e `ResizeObserver` exercitados se algum componente os usar (se nenhum usar, diga).
- [ ] Os testes não dependem do número de itens do catálogo nem de nomes de texto que o AG07 possa mudar: valide rodando de novo depois de a T-059 terminar, se ela terminar antes.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam; o tempo de `npm test` não passa de cerca do dobro do atual.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a lista de defeitos achados pelos testes, se houver. Não commitar.
