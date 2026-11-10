# BRF-002 · AG03 · Configuração do Netlify

- **Task:** T-004 (marco M0)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `netlify.toml` (novo, na raiz)

## Objetivo

Versionar a configuração de build do Netlify para a `dev` publicar em dev--bytecorpgame.netlify.app.

## Contexto

`docs/00_processo.md`, seção Git. Build: `npm run build`, saída em `dist/`. O projeto usa Node 24 localmente. Não há roteamento no cliente (página única).

## Escopo

- Faz: `netlify.toml` com comando de build, pasta publicada e versão do Node.
- Não faz: ligar o site ou o branch deploy no painel do Netlify (é do usuário); redirects de SPA.

## Critério de pronto

- [ ] `netlify.toml` válido em TOML, com `command = "npm run build"`, `publish = "dist"` e `NODE_VERSION`.
- [ ] `npm run build` passa localmente.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
