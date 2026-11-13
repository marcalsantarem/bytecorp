# BRF-034 · AG03 · Jogo instalável como aplicativo (PWA)

- **Task:** T-056 (marco M2, pedido do usuário)
- **Dono:** AG03
- **Depende de:** nenhuma
- **Pode escrever em:** `public/` (inclusive a nova `public/icons/`), `vite.config.ts`, `netlify.toml`, `package.json` e `package-lock.json`, `src/app/`. **Autorizações extras:** `index.html` (somente tags `<link>` e `<meta>` no `<head>`), `src/main.tsx` (somente a chamada de registro do service worker) e uma nova pasta `scripts/` (script de geração dos ícones).

## Objetivo

Preparar o jogo para ser instalado e usado como aplicativo (PWA), com ícone próprio e nome de atalho que sugira ByteCorp Idle.

## Contexto

Bíblia 2.1 e 2.2 (Web, depois PWA; arquitetura preparada) e 22. Decisão D-12 (`docs/decisoes.md`): o PWA básico entra antes do beta. O save fica em IndexedDB (não é afetado pelo cache). O site é publicado no Netlify (`netlify.toml`: `npm run build`, `dist/`), tanto na `main` quanto na `dev`, então uma atualização precisa chegar aos testadores sem ficar presa em cache velho. Cores do jogo: fundo `#050811` (`src/index.css`).

## Escopo

- **Ícone:** fundo preto e o símbolo `>_` (o mesmo do ícone `terminal` do Lucide usado no protótipo: um sinal de maior, em ângulo, e um sublinhado) em verde de contraste alto, estilo letras do Matrix (por exemplo `#00ff41`), com um brilho discreto, traço grosso e cantos arredondados, bem legível em tamanho pequeno. Entregar o fonte em SVG (`public/icons/icon.svg`) e os PNGs gerados por um script em `scripts/` (pode usar um pacote de desenvolvimento para rasterizar, ex. `sharp` ou `@resvg/resvg-js`; os PNGs gerados ficam versionados, para o build não depender do script): 192x192, 512x512, 512x512 **maskable** (o símbolo dentro da zona segura de cerca de 80% central, com o preto até as bordas), `apple-touch-icon` 180x180 e favicon (SVG e PNG 32x32). Conferir o resultado olhando as imagens geradas.
- **Manifesto** (`public/manifest.webmanifest`): `name` "Byte Corp Idle", `short_name` "ByteCorp Idle" (é o nome do atalho), `description` curta em pt-BR, `lang` `pt-BR`, `start_url` e `scope` `/`, `display` `standalone`, `background_color` e `theme_color` `#050811`, ícones com `purpose` correto (any e maskable), `categories` `games`.
- **`index.html`:** `link rel="manifest"`, ícones (favicon, `apple-touch-icon`), `meta name="theme-color"`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` "ByteCorp Idle", `viewport-fit=cover`.
- **Service worker:** preferir um service worker próprio e simples a uma dependência pesada (se usar `vite-plugin-pwa`, confirmar antes que é compatível com o Vite 8 instalado; qualquer dependência nova só de desenvolvimento). Comportamento: pré-cache do shell do app e dos ativos com hash; navegação (HTML) em rede primeiro com cópia em cache de reserva, para o jogo abrir offline; ativos com hash em cache primeiro; cache versionado pelo build (nome derivado de um hash ou da versão + data do build) e limpeza dos caches antigos; nada de `skipWaiting` que troque o código no meio de uma partida sem o jogador recarregar (a nova versão assume na próxima abertura); não cachear chamadas fora da origem. Registrar só em build de produção (nunca no `npm run dev`), de um ponto em `src/app/` chamado por `src/main.tsx`, com falha de registro apenas registrada no console.
- **Netlify:** cabeçalhos em `netlify.toml` para que `sw.js` e o manifesto não fiquem presos em cache do navegador (`Cache-Control: no-cache` ou equivalente) e os ativos com hash tenham cache longo.
- Não faz: notificações push, sincronização em nuvem, telas de instalação ou botão "instalar" na interface, empacotamento Android, mudar o jogo.

## Critério de pronto

- [ ] Ícones gerados e conferidos visualmente (descreva o que viu); `>_` verde sobre preto, legível em 48 px; versão maskable com margem.
- [ ] Com `npm run build` e `npm run preview` (ou servidor estático de `dist/`), no navegador embutido: o manifesto carrega sem erro e todos os ícones declarados respondem 200 com o tamanho declarado; o service worker registra e fica ativo; o cache contém o shell do app; uma navegação com o servidor parado ainda abre o jogo a partir do cache (ou, se o navegador embutido não permitir, justificar e provar por `caches.match` das URLs do shell); recarregar não perde o save. No `npm run dev` o service worker não registra.
- [ ] Teste automatizado onde fizer sentido (por exemplo, o manifesto: campos obrigatórios, ícones existentes no disco com as dimensões declaradas).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- [ ] Ao terminar: apagar o banco de teste e os registros do service worker no navegador embutido, restaurar a janela (preset desktop) e encerrar os servidores que iniciou.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar. Diga também o que o usuário precisa fazer para instalar (por exemplo, no Chrome do celular) e o que não deu para verificar sem um aparelho real.
