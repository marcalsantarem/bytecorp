# BRF-017 · AG07 · Rótulos das categorias em pt-BR

- **Task:** T-050 (marco M1)
- **Dono:** AG07
- **Depende de:** decisão A-05 (resolvida: traduzir)
- **Pode escrever em:** `src/i18n/content/`, `docs/AG07/`

## Objetivo

Traduzir os rótulos das categorias de equipamento no idioma pt-BR, mantendo o inglês no idioma en (defeito D1 da QA).

## Contexto

`src/i18n/content/pt-BR.ts` tem hoje `category.*` em inglês. Rótulos definidos pelo usuário: Rede (networking), Processamento (processing), Armazenamento (storage), Refrigeração (cooling), Infraestrutura (infrastructure). As chaves não mudam. Procure no repositório outros textos pt-BR de conteúdo que ainda estejam em inglês e relate (não traduza nomes próprios de equipamentos).

## Escopo

- Faz: trocar só os cinco valores em `src/i18n/content/pt-BR.ts`; conferir se algum teste ou documento cita os rótulos antigos em pt-BR e relatar.
- Não faz: mudar chaves, o idioma en, ou arquivos fora das pastas acima.

## Critério de pronto

- [ ] Os cinco rótulos em pt-BR traduzidos; en intacto.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
