# BRF-019 · AG01 · Estágios corporativos

- **Task:** T-018 (marco M2)
- **Dono:** AG01
- **Depende de:** nenhuma
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Fazer `run.stage` avançar pelos sete estágios conforme os requisitos do catálogo, avisando por evento.

## Contexto

Bíblia 1.2 (sete estágios, do Solo Hacker à Mega Corporation), 6.3 e 9.2 (o Reboot devolve ao Solo Hacker; o Reboot em si é do M3). Catálogo: `catalog.stages` (`order` sequencial, `requirement` do tipo `Requirement`). Avaliação de requisitos já existe em `src/core/economy/requirements.ts` (`isRequirementMet`, que já entende `stageReached`). `run.stage` já existe no estado e no save.

## Escopo

- Faz: após cada ganho de Bytes (`advance` e `click`) e após compras, verificar se o próximo estágio foi atingido e avançar; pode pular vários estágios de uma vez, um evento por estágio, em ordem; o estágio nunca regride dentro da execução; evento novo `stageChanged` (`from`, `to`) em `events.ts`; chamar `invalidate()` ao mudar (desbloqueios dependem do estágio); ao carregar um estado (construtor e `replaceState`), corrigir em silêncio um estágio salvo abaixo do que os requisitos já garantem; consulta simples do estágio atual e do próximo com o seu requisito, para a interface (T-028). Testes com catálogo próprio no arquivo de teste.
- Custo: a verificação roda a cada passo do `advance`; deve olhar só o próximo estágio, sem varrer o catálogo.
- Não faz: valores dos estágios (AG07), interface, animação de transição (M6), Reboot, mudar o formato do save.

## Critério de pronto

- [ ] Testes: avança ao atingir o requisito; pula estágios com um evento por estágio na ordem certa; não regride quando o saldo cai; estado carregado com estágio defasado é corrigido sem evento; o mesmo tempo fatiado de formas diferentes termina no mesmo estágio; item com `unlock` por `stageReached` passa a `unlocked` quando o estágio muda.
- [ ] O formato do save não muda; nada em `src/core` importa interface.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
