# BRF-048 · AG03 · Versão 0.3.0

- **Task:** T-032 (marco M2)
- **Dono:** AG03
- **Depende de:** T-031 (feita); a T-060 roda ao mesmo tempo
- **Pode escrever em:** `package.json`, `package-lock.json`

## Objetivo

Fechar a versão do M2 como 0.3.0 (D-07: marco Mn = v0.(n+1).0).

## Contexto

A versão do app vem de `package.json` e chega ao código por `__APP_VERSION__` (`vite.config.ts`); o título da aba e o cabeçalho a exibem; o service worker usa a versão no nome do cache (`bytecorp-<versão>-<hash>`). Hoje `package.json` e `package-lock.json` estão em 0.2.0.

## Escopo

- Faz: `version` = `0.3.0` no `package.json` e nos dois lugares do `package-lock.json` que carregam a versão do próprio projeto (raiz e `packages[""]`), sem mexer em dependências.
- Não faz: instalar, atualizar ou remover dependências; tags e Git; qualquer outro arquivo.

## Critério de pronto

- [ ] `git diff` mostra só as linhas de versão nos dois arquivos.
- [ ] `npm run build` passa; `dist/assets/*.js` contém `0.3.0` e `dist/sw.js` tem o nome de cache com `0.3.0`.
- [ ] `npm run lint`, `npm run typecheck` e `npm test` passam (a suíte inclui testes longos de curva; se falhar por timeout sob carga, rode de novo e relate).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
