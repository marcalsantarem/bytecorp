# BRF-038 · AG03 · Ambiente de teste de componentes React

- **Task:** T-029 (marco M2)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `package.json`, `package-lock.json`, `src/app/`. **Autorização extra:** nova pasta `src/test/` (arquivo de preparação do ambiente e um teste de fumaça). Não toque em `src/ui/` (outra task, T-030, do AG04, vai escrever os testes dos componentes).

## Objetivo

Deixar o Vitest pronto para testar componentes React com DOM, sem afetar os testes de lógica (ambiente node).

## Contexto

Hoje o Vitest roda só em ambiente node (`vite.config.ts`: `test.include` com `src/**/*.test.ts` e `tests/**/*.test.ts`, `environment: 'node'`). Não há testes de componentes, e a lógica em `src/core` deve continuar testada sem DOM. Dependências atuais: React 19, Vitest 5, Vite 8, TypeScript 6. O AG04 vai escrever na T-030 testes para os cartões da loja, de agentes e de melhorias, que usam `I18nProvider` (`src/ui/i18n.tsx`) e o `GameEngine`.

## Escopo

- Faz: escolher e instalar, só como dependências de desenvolvimento, o ambiente de DOM (`jsdom` ou `happy-dom`, o que for compatível com o Vitest 5) e `@testing-library/react` (e `@testing-library/jest-dom` se ajudar nos matchers, com os tipos corretos no TypeScript); configurar o Vitest para que arquivos `*.test.tsx` rodem em ambiente de DOM e os `*.test.ts` existentes continuem em node (por exemplo, `projects` do Vitest, ou o comentário `// @vitest-environment` por arquivo; escolha o que for estável nesta versão e explique); incluir `src/**/*.test.tsx` no `include`; arquivo de preparação em `src/test/` com limpeza automática entre testes e, se necessário, o polyfill mínimo de APIs do navegador que os componentes usam (`matchMedia`, `ResizeObserver`, `requestAnimationFrame`); um teste de fumaça em `src/test/` que renderize um componente real e simples do projeto (por exemplo `NeonPanel` dentro do `I18nProvider`) e confira o texto na tela; garantir que `tsc -b`, `eslint` e `npm run build` cobrem os arquivos `.tsx` de teste sem erro e que o build de produção não inclui nada de teste.
- Não faz: escrever testes dos componentes de loja, agentes ou melhorias (T-030), mudar componentes, mudar o ambiente dos testes de `src/core`.

## Critério de pronto

- [ ] O teste de fumaça passa em DOM; um teste `.ts` de lógica existente continua passando em node (por exemplo, conferir que `document` é indefinido num teste de `src/core`, ou provar por configuração).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam; o tempo total de `npm test` não dobra.
- [ ] Entrega descreve como o AG04 escreve um teste de componente (3 a 5 linhas de exemplo).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
