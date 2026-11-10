# BRF-016 · AG04 · Ajustes de toque e acessibilidade no mobile

- **Task:** T-049 (marco M1)
- **Dono:** AG04
- **Depende de:** T-048 (feita; defeitos D2, D4 e D5 em `docs/AG07/resultado-qa-m1.md`)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/index.css`

## Objetivo

Corrigir os defeitos de toque, truncamento e acessibilidade encontrados na QA do M1.

## Contexto

Leia a seção de defeitos de `docs/AG07/resultado-qa-m1.md`.

- D2: em 375 px os alvos de toque têm menos de 44 px: seletor x1/x10/MAX (24 px), "Comprar" (26 px), "Iniciar novo jogo" (38 px), botões do rodapé (30 px).
- D4: truncamentos em 375 px: valor de Bytes no cabeçalho, seletor de idioma, rótulos do rodapé.
- D5: o seletor de idioma não tem nome acessível.

## Escopo

- Faz: alvos de toque de pelo menos 44 px de altura no mobile (o desktop pode seguir compacto); cabeçalho e rodapé sem truncar texto essencial em 375 px (reorganizar, quebrar linha ou usar ícone com rótulo curto, mantendo os três recursos sempre visíveis); `aria-label` no seletor de idioma, por i18n; nada de regra de jogo em componentes.
- Não faz: rótulos de categoria (D1, decisão pendente), botão desabilitado em item bloqueado (D3 é intencional), mudar o layout geral.

## Critério de pronto

- [ ] No navegador em 375 px: medir por `getBoundingClientRect` que os controles citados têm >= 44 px e que nenhum texto essencial fica cortado; sem rolagem horizontal. Em 1280 px nada quebra. Restaurar o tamanho da janela e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
