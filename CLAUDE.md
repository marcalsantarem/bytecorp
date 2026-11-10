# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositório

**M0 (Fundação) concluído.** `bytecorp.md` é o GDD/documento de requisitos do **Byte Corp Idle** (jogo incremental/idle tycoon cyberpunk, Web primeiro). Ele é a referência central: qualquer mudança de escopo deve ser registrada nele, e a seção 29 prevalece sobre propostas anteriores em caso de conflito.

`cyber_corp_node_tycoon.html` é um protótipo descartável de validação da jogabilidade (ver "Protótipo" abaixo). Não é a base do projeto e não deve ser evoluído.

Repositório git local na branch `main`, sem remoto configurado.

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
  - `production.ts`: produção consolidada; `globalMultiplier` é o ponto onde a fórmula global (decisão 1) será implementada.
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

## Decisões em aberto

A seção 28 lista os valores pendentes de balanceamento. Os pontos abaixo precisam de resposta do usuário e não devem ser inventados em silêncio:

1. **Aberta, bloqueia o M1/M2.** Fórmula matemática exata da produção global e ordem de combinação dos bônus (4.2). Hoje `globalMultiplier` retorna 1.
2. **Resolvida no M0:** números grandes com `break_infinity.js` (`Decimal`, em `src/core/decimal.ts`). Toda grandeza econômica usa `Decimal`; contagens de itens e níveis continuam `number`.
3. **Provisória:** depois de YB a formatação usa RB e QB (prefixos SI ronna e quetta) e então notação científica. Trocar em `BYTE_UNITS` quando as unidades fictícias forem definidas (4.7).
4. **Aberta, bloqueia o M3.** Fórmula de Quantum Cores e condição mínima para habilitar o Reboot. O texto de 9.6 fala em "Quantum Cores suficientes para executar a ação", o que é ambíguo (28.2).
5. **Resolvida no M0:** Vite, TypeScript e Vitest.
6. **Assumida:** eventos ficam fora da primeira versão jogável (12.1, 25.4), mas o beta exige todo o conteúdo previsto (2.3). O plano os coloca no M7, antes do beta.

## Marcos de desenvolvimento

Cada marco entrega um incremento jogável e integrado (25.3). Não desenvolver sistemas isolados para integrar no final.

| Marco | Entrega | Seções do GDD |
|---|---|---|
| **M0 Fundação** | Projeto criado, Game Core (estado, ciclo com delta time, barramento de eventos), números grandes e formatação por idioma, i18n, esquema dos catálogos, testes do núcleo | 4.1, 4.7, 16.2, 24 |
| **M1 Loop básico** | Clique com crítico, equipamentos (custo, x1/x10/MAX, descontos), produção passiva, layout responsivo mínimo com cena provisória, save/load versionado com autosave | 5, 6, 15.1 a 15.4, 21 |
| **M2 Expansão da execução** | Agentes (contratação, nível coletivo, bônus), melhorias comuns, estágios corporativos, regras de desbloqueio e visibilidade | 7, 8, 1.2, 6.3 |
| **M3 Prestígio** | Reboot com confirmação, Quantum Cores, árvore Quantum (pan, zoom, painel de detalhes, reset com custo crescente). **Fecha a primeira versão jogável (25.1)** | 9, 10 |
| **M4 Tempo** | Bônus temporários, aceleradores (inventário, substituição com escolha de perder ou armazenar), produção offline por intervalos, resumo de retorno | 13, 14 |
| **M5 Metajogo e fluxo** | Conquistas (fila de notificações, recompensas), janela de estatísticas, tela inicial, configurações, tutorial contextual, notificações locais | 11, 15.5 a 15.8, 16.1, 17, 22 |
| **M6 Apresentação** | Cena Three.js por estágio, agrupamento visual, partículas em Canvas 2D, transições de estágio e de Reboot, qualidade adaptativa, música em camadas e efeitos | 18, 19, 20 |
| **M7 Eventos** | Sistema de eventos, integração com aceleradores, Reboot e offline, etapa do tutorial | 12 |
| **M8 Beta** | Catálogo completo, balanceamento, acabamento responsivo, preparação para PWA, canal externo de feedback | 2, 25.2, 28 |

A monetização (seção 23) vem depois do beta; antes disso só deixar os pontos de extensão (origem de aceleradores, dobro do ganho offline). O M6 não depende de M4 e M5 e pode correr em paralelo a partir do fim do M1, desde que consuma apenas o estado público do núcleo.

## Divisão em subagentes

Seis subagentes especializados, com a sessão principal como orquestradora (dona dos contratos compartilhados: tipos do estado, eventos internos, esquema dos catálogos e do save). O limite real de paralelismo é a posse de arquivos: dois agentes nunca escrevem na mesma área.

| # | Subagente | Área exclusiva | Marcos |
|---|---|---|---|
| 1 | **Núcleo e economia** | Game Core, números, fórmula de produção, cliques, equipamentos, agentes, melhorias | M0 a M2 |
| 2 | **Progressão e tempo** | Reboot, Quantum, conquistas, bônus temporários, aceleradores, offline, eventos | M3 a M5, M7 |
| 3 | **Persistência e plataforma** | Save em IndexedDB, versionamento e migrações, i18n, configurações, notificações, PWA | M0, M1, M5, M8 |
| 4 | **Interface React** | Layout, loja, modais, árvore Quantum, tutorial, tela inicial | M1 a M8 |
| 5 | **Cena e áudio** | Three.js, Canvas 2D, qualidade adaptativa, Web Audio | M1 (provisório), M6 |
| 6 | **Conteúdo, balanceamento e QA** | Dados dos catálogos, simulações da curva econômica, testes de independência de frames e de offline | M2 em diante |

Concorrência recomendada: no M0, apenas os agentes 1 e 3, porque os contratos ainda estão mudando. Do M1 em diante, de três a quatro ao mesmo tempo (lógica, interface, cena/áudio e conteúdo). O agente 4 sempre parte de contratos já publicados pelos agentes 1 e 2, nunca de implementação em andamento. Áudio fica junto com a cena por ser pequeno e não ter dependência cruzada; se o M6 crescer, pode ser separado em um sétimo agente.
