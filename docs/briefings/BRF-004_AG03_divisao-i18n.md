# BRF-004 · AG03 · Divisão dos dicionários de i18n

- **Task:** T-006 (marco M1)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `src/i18n/`

## Objetivo

Separar os textos de interface dos textos de conteúdo, para que AG04 e AG07 tenham arquivos próprios.

## Contexto

Hoje `src/i18n/pt-BR.ts` (referência, define `MessageKey`) e `en.ts` misturam os dois. Conteúdo = chaves `stage.*`, `category.*`, `equipment.*` (e futuras de agentes, melhorias, nós, conquistas). O resto é interface. `src/core/catalog/types.ts` importa `MessageKey` de `../../i18n/pt-BR`: esse caminho precisa continuar funcionando sem editar `types.ts`.

## Escopo

- Faz: `src/i18n/ui/{pt-BR,en}.ts` e `src/i18n/content/{pt-BR,en}.ts`; `pt-BR.ts` e `en.ts` passam a só combinar os dois; `MessageKey` continua a união de todas as chaves; teste que falha se a mesma chave existir em interface e conteúdo; os testes existentes seguem valendo.
- Não faz: mudar textos, chaves ou a API de `src/i18n/index.ts`.

## Critério de pronto

- [ ] Nenhum arquivo fora de `src/i18n/` alterado.
- [ ] Faltar uma chave em `en` (interface ou conteúdo) continua sendo erro de compilação.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
