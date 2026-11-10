# BRF-003 · AG04 · Versão no título

- **Task:** T-003 (marco M0)
- **Dono:** AG04
- **Depende de:** T-002 (constante `__APP_VERSION__`, declarada em `src/env.d.ts`)
- **Pode escrever em:** `src/ui/`, `src/main.tsx`, `index.html`

## Objetivo

Mostrar a versão do jogo no título da aba e no cabeçalho.

## Contexto

D-07 em `docs/decisoes.md`: cada marco fecha com a versão no título do jogo. A versão vem de `__APP_VERSION__` (não escrever o número no código). O título usa a chave `app.title` do i18n.

## Escopo

- Faz: título da aba no formato `Byte Corp Idle v0.1.0`, mantido ao trocar de idioma; versão discreta (ex. `v0.1.0`) ao lado do nome no cabeçalho do `GameScreen`.
- Não faz: novas chaves de i18n; mudanças fora das pastas acima.

## Critério de pronto

- [ ] Com `npm run dev`, `document.title` é `Byte Corp Idle v0.1.0` e o cabeçalho mostra `v0.1.0`.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
