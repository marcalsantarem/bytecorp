# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositório

M0 e M1 fechados (tags `v0.1.0` e `v0.2.0`); o estado dos marcos está em [docs/roadmap.md](docs/roadmap.md). `bytecorp.md` (a "Bíblia") é o GDD/documento de requisitos do **Byte Corp Idle** (jogo incremental/idle tycoon cyberpunk, Web primeiro). Ele é a referência central: qualquer mudança de escopo deve ser registrada nele, e a seção 29 prevalece sobre propostas anteriores em caso de conflito.

`cyber_corp_node_tycoon.html` é um protótipo descartável de validação da jogabilidade (ver "Protótipo" abaixo). Não é a base do projeto e não deve ser evoluído.

Remoto `origin` em https://github.com/marcalsantarem/bytecorp. Trabalho só na branch `dev` (ver "Processo de trabalho").

Idioma do projeto: a especificação e a conversa com o usuário são em português brasileiro. O jogo é bilíngue (pt-BR e en), então nenhum texto de interface pode ficar fixo no código.

## Comandos

```bash
npm run dev          # servidor Vite em http://localhost:5173 (também em .claude/launch.json como "dev")
npm test             # todos os testes (Vitest, ambiente node)
npx vitest run src/core/engine.test.ts      # um arquivo
npx vitest run -t "fatiado"                 # testes cujo nome contém o texto
npm run lint         # ESLint
npm run typecheck    # tsc -b
npm run build        # typecheck + build de produção em dist/
```

Testes ficam ao lado do código (`*.test.ts`) e só cobrem `src/core`, `src/i18n` e `src/platform`. O IndexedDB é testado com `fake-indexeddb`. Não há testes de componentes React ainda.

## Stack

Definida pelo GDD (18.2 e 24.1): React, Tailwind CSS, Lucide Icons, Three.js (câmera isométrica fixa), Canvas 2D, Web Audio API, IndexedDB. Escolhida no M0: Vite, TypeScript estrito (com `noUncheckedIndexedAccess`), Vitest, ESLint e `break_infinity.js` para números grandes. Tailwind 4 configurado por CSS: os tokens de cor e fonte ficam no bloco `@theme` de `src/index.css` (`bg-panel`, `text-neon-cyan`, `font-mono` etc.), não há `tailwind.config`. Evitar dependências exclusivas de plataforma: a ordem de lançamento é Web, PWA, Android (Capacitor), Steam (Electron/Tauri), iOS.

## Estrutura do código

- `src/core/`: lógica pura, sem React, DOM nem Three.js. **O ESLint bloqueia** imports de `react`, `three`, `lucide-react` e de `ui/`, `render/`, `audio/` e `platform/` dentro desta pasta.
  - `engine.ts`: `GameEngine`. Recebe tempo por `advance(ms)` e o fatia em passos de até `maxStepMs`; o resultado depende só do total de ms. Toda mudança que afete a produção deve chamar `invalidate()`, que limpa o cache de `production` e incrementa `revision`.
  - `clock.ts`: dirige o engine por `setInterval` e `performance.now()`, nunca por `requestAnimationFrame`.
  - `state.ts`: `GameState` dividido em `run` (zerado pelo Reboot), `meta` (permanente) e `stats` (histórico). Onde um campo novo entra define o que o Reboot faz com ele.
  - `production.ts`: produção consolidada; `globalMultiplier` é o ponto onde a fórmula global (D-10 em `docs/decisoes.md`, três camadas) será implementada na T-021.
  - `catalog/`: tipos e dados dos catálogos. Textos são `MessageKey` do i18n. `validateCatalog` roda nos testes e checa ids, chaves de i18n, custos e a ordem por custo crescente.
  - `save/`: `codec.ts` serializa (Decimal vira string), valida campo a campo e aplica `MIGRATIONS`. Ao mudar o formato do estado: incrementar `SAVE_VERSION`, adicionar a migração e atualizar `parseState`.
- `src/i18n/`: `pt-BR.ts` é o dicionário de referência e define `MessageKey`; os outros idiomas são `Record<MessageKey, string>`, então chave faltando é erro de compilação. Interpolação com `{param}`.
- `src/platform/`: adaptadores de APIs do navegador (`IndexedDbStorage`).
- `src/app/bootstrap.ts`: único ponto que liga engine, relógio e salvamento (autosave a cada 10 s, ao ocultar a aba e em `pagehide`).
- `src/ui/`: React. `useEngineRevision` re-renderiza no máximo uma vez por quadro a partir dos eventos do engine; componentes leem `engine.state` e alteram estado só pelos métodos do engine.
- Configurações (por ora só o idioma) ficam na chave `settings`, separadas do save: sobrevivem a "Novo jogo".

Limitações conhecidas do M0:

- A gravação em `pagehide` é assíncrona e pode não terminar antes de a página fechar; num recarregamento logo após uma ação, o progresso desde o último autosave se perde. O M1 deve salvar também após compras (GDD 21.2, "salvamentos em momentos importantes").
- Com a aba ou a pane do navegador oculta, `requestAnimationFrame` não dispara e a tela não atualiza, embora o núcleo continue rodando. Ao verificar a interface com ferramentas de navegador, leia o save no IndexedDB (`byte-corp-idle` / `kv` / `save`) ou mantenha a pane visível.
- O ganho offline ainda não existe; ao carregar, o tempo ausente é ignorado (M4).

## Regras de arquitetura que atravessam todo o código

- **Núcleo de lógica independente da interface.** Game Core, economia e progressão não importam React, Three.js nem DOM. A interface e a cena apenas leem estado e despacham ações; os sistemas se comunicam por interfaces ou eventos internos (24.2).
- **Economia baseada em tempo decorrido, nunca em frames.** O mesmo intervalo de tempo deve produzir o mesmo resultado a 10 ou 144 FPS e com a renderização parada (4.1, 24.4). A redução de qualidade gráfica nunca altera a produção.
- **Fórmula global unificada de produção** (4.2, decisão 29.5): equipamentos, agentes e cliques somam em uma produção única e os bônus incidem sobre o total. Não criar multiplicadores separados por origem, mas manter a origem rastreável para as estatísticas.
- **Custos:** `C(N) = C_base × k^N`, descontos aditivos sem teto, aplicados antes de calcular o MAX, arredondamento para baixo, mínimo de 1 Byte. Descontos valem para equipamentos e agentes, não para melhorias comuns (4.6).
- **Catálogos orientados a dados.** Equipamentos, agentes, melhorias, nós Quantum, conquistas e estágios devem poder crescer sem mudança estrutural (6.2, 27).
- **Reboot** zera Bytes, equipamentos, agentes e seus níveis, melhorias comuns e desbloqueios de execução; preserva Quantum Cores, árvore Quantum, conquistas, estatísticas históricas, desbloqueios permanentes e bônus temporários de conquistas (com temporizador correndo). Encerra evento ativo sem recompensa (9.2, 9.3).
- **Offline:** cálculo por intervalos entre eventos relevantes (expiração de bônus e aceleradores), não por simulação segundo a segundo nem pelo último B/s. Limite inicial de 8 h, ampliável pela árvore Quantum (seção 14).
- **Save:** versionado e validado. Save corrompido informa o problema e oferece novo jogo; não há recuperação por backup (21.4).
- **Fora de escopo, não implementar:** Threat Level e qualquer sistema de ameaça ou defesa, combo de cliques, busca ou filtros na loja, seletor global de compra, compra x10/MAX de agentes, posicionamento ou interação com objetos da cena, histórico de notificações ou de eventos, anúncios obrigatórios.

## Protótipo (`cyber_corp_node_tycoon.html`)

Arquivo único em HTML e JavaScript puro, com Tailwind e Lucide via CDN e save em `localStorage`. Cobre clique, cinco equipamentos, três agentes, Reboot, boost 2x e ganho offline com anúncio simulado. Onde ele diverge do GDD, **o GDD vence**.

Aproveitar como referência:

- Ciclo com delta time por relógio (`gameLoop`), que já atende à independência de frames.
- Valores iniciais de balanceamento: custos base 15, 100, 1.100, 12.000 e 130.000; produção 0,5, 4, 32, 260 e 1.400 B/s; fator 1,15 para equipamentos e 1,25 para agentes.
- Identidade visual: fundo `#050811`, ciano `#00ffcc`, magenta `#ff007f`, fontes Inter e Fira Code.
- Fluxo de anúncio recompensado simulado (dobro do offline, boost), útil para a seção 23.

Não portar:

- Clique no próprio núcleo (o GDD separa núcleo visual e botão, 5.1 e 5.2).
- Bônus de +25% por Quantum Core apenas por possuí-lo; no GDD os Cores são gastos na árvore Quantum.
- Fórmula `equipamentos × agentes × quantum × boost`, em que o bônus de agentes só incide sobre equipamentos; contraria a fórmula global unificada (4.2).
- Reboot sem confirmação e com recompensa `floor(sqrt(total / 100.000))` baseada só em Bytes (9.4 e 9.6).
- Boost que soma tempo indefinidamente; o GDD exige um único acelerador ativo com inventário (seção 13).
- Offline como último B/s vezes o tempo, sem limite de 8 h (seção 14). Há ainda um defeito: `checkOfflineProgress` não atualiza `lastTimestamp`, então o primeiro `gameLoop` credita a ausência inteira de novo e o ganho offline é pago em dobro.
- Save sem versão nem validação, com falha de leitura silenciosa (seção 21).
- `formatBytes`: uma casa fixa abaixo de 1.000, "KB" em vez de "kB", para em EB e ignora o idioma (4.7).

Ausentes no protótipo: melhorias comuns, estágios corporativos, categorias de loja, x10/MAX, descontos, clique crítico, níveis de agentes, árvore Quantum, conquistas, i18n e cena 3D.

## Processo de trabalho

A sessão principal é o **AG00 (Líder)**: fala com o usuário, escreve briefings, delega, valida, registra decisões, commita e envia. **O AG00 não implementa**: código, imagens, efeitos e sons são sempre feitos por um especialista (`ag01` a `ag07` em `.claude/agents/`), a partir de um briefing em `docs/briefings/`.

Antes de agir, consulte:

- [docs/00_processo.md](docs/00_processo.md): time, fluxo, posse de pastas, regras de tasks e de Git.
- [docs/roadmap.md](docs/roadmap.md): marcos e o que cada um entrega.
- [docs/backlog.md](docs/backlog.md): tasks e status reais.
- [docs/decisoes.md](docs/decisoes.md): decisões tomadas, provisórias e "A definir" (que bloqueiam tasks).

Lembretes que mais se perdem:

- Só disparar tasks (delegar a um especialista) com autorização do usuário. Ao fechar cada etapa, listar as tasks concluídas e as próximas do marco atual.
- Commits só na `dev`, agrupados por etapa, mensagem curta em português no imperativo, e só depois de lint, typecheck, testes e build passarem. Nada de push na `main` nem de outras branches.
- PR `dev` → `main` só quando o usuário pedir; título e descrição também colados no chat.
- Decisões criativas, de escopo e de stack vão ao usuário com 2 ou 3 opções e uma recomendação.
- Respostas e briefings curtos; ler arquivos em trechos.
