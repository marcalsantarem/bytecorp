# BRF-026 · AG04 · Botão Reset no lugar do seletor de idioma

- **Task:** T-054 (marco M2)
- **Dono:** AG04
- **Depende de:** T-053 (feita; `GameSession.reset()`)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/main.tsx`, `src/index.css`

## Objetivo

Trocar, na interface, o seletor de idioma por um botão **Reset** que reinicia o jogo por completo, para testar a evolução rapidamente. O jogo fica só em pt-BR até a janela de configurações (D-11).

## Contexto

O seletor está em `src/ui/layout/ResourceBar.tsx` (desktop e mobile; no mobile é um botão de 44 px com ícone). A sessão do jogo (`GameSession`, `src/app/bootstrap.ts`) agora tem `reset(): Promise<void>`; chegue a ela pela mesma rota que o `engine` já percorre (`App.tsx`). O provedor de idioma e os dicionários em inglês continuam no código (a infraestrutura de i18n não sai), mas não há mais troca pela tela.

## Escopo

- Faz: remover o seletor de idioma da barra de recursos e pôr o botão Reset no mesmo lugar, com ícone (por exemplo `rotate-ccw`) e rótulo por i18n (pt-BR e en); clique pede confirmação em dois passos na própria tela (o botão vira "Confirmar reset", volta ao normal sozinho depois de cerca de 4 s sem clique, ou ao perder o foco), sem janelas do navegador; ao confirmar, chama `reset()`; estilo discreto de ferramenta de teste (não compete com os recursos); alvo de toque de 44 px no mobile; nome acessível; idioma fixo em pt-BR: em `main.tsx` e no provedor, ignorar o idioma do navegador e qualquer idioma salvo (a chave `settings` pode continuar existindo), mantendo `document.documentElement.lang` = `pt-BR`.
- Não faz: apagar a infraestrutura de i18n nem os textos em inglês, janela de configurações, mudar o núcleo ou o salvamento.

## Critério de pronto

- [ ] No navegador (1280 px e 375 px; a pane pode estar oculta, então prefira `getBoundingClientRect`, `read_page` e o estado salvo no IndexedDB): não há mais seletor de idioma; o botão Reset aparece; primeiro clique mostra "Confirmar"; o segundo zera Bytes, equipamentos, agentes e estatísticas e grava o save inicial; sem segundo clique o botão volta ao normal; o jogo continua funcionando depois (clicar e comprar). Um save com `settings` em inglês não muda o idioma da tela. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
