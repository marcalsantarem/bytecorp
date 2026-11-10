# BRF-001 · AG03 · Versão do app

- **Task:** T-002 (marco M0)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `package.json`, `vite.config.ts`; autorização extra: criar `src/env.d.ts` (declaração global)

## Objetivo

Tornar a versão do `package.json` disponível no código do app como constante global, com a versão do M0.

## Contexto

D-07 em `docs/decisoes.md`: M0 = v0.1.0. Cada marco fecha com a versão no título do jogo; a fonte única da versão é o `package.json`.

## Escopo

- Faz: `version` do `package.json` = `0.1.0`; `define` no `vite.config.ts` com `__APP_VERSION__` lido do `package.json` (não duplicar o número); declaração `declare const __APP_VERSION__: string` em `src/env.d.ts`.
- Não faz: exibir a versão (T-003, AG04); tags ou Git.

## Critério de pronto

- [ ] `npm run build` passa e `dist/assets/*.js` contém `0.1.0` quando o código usa `__APP_VERSION__` (pode validar com um uso temporário, removido depois).
- [ ] `npm run lint`, `npm run typecheck` e `npm test` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
