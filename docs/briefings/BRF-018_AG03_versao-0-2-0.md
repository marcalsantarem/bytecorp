# BRF-018 · AG03 · Versão 0.2.0

- **Task:** T-016 (marco M1)
- **Dono:** AG03
- **Depende de:** T-049 e T-050 (feitas)
- **Pode escrever em:** `package.json`, `package-lock.json`

## Objetivo

Fechar a versão do M1 como 0.2.0 (D-07: marco Mn = v0.(n+1).0).

## Contexto

A versão do app vem de `package.json` e chega ao código por `__APP_VERSION__` (vite.config.ts); o título da aba e o cabeçalho a exibem. O `package-lock.json` ainda tem o campo `version` desatualizado em relação ao `package.json`.

## Escopo

- Faz: `version` = `0.2.0` no `package.json`; o mesmo valor nos dois lugares do `package-lock.json` que carregam a versão do próprio projeto (raiz e `packages[""]`), sem mexer em dependências.
- Não faz: instalar, atualizar ou remover dependências; tags e Git.

## Critério de pronto

- [ ] `npm run build` passa e `dist/assets/*.js` contém `0.2.0`.
- [ ] `git diff` mostra só as linhas de versão nos dois arquivos.
- [ ] `npm run lint`, `npm run typecheck` e `npm test` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
