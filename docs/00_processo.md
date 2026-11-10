# Processo de trabalho

Acordo definido pelo usuário em 2026-11-10. Vale para todas as sessões.

## Time

| AG | Função | Perfil |
|---|---|---|
| AG00 | Líder | [agentes/AG00.md](agentes/AG00.md) |
| AG01 | Núcleo e economia | [agentes/AG01.md](agentes/AG01.md) |
| AG02 | Progressão e tempo | [agentes/AG02.md](agentes/AG02.md) |
| AG03 | Persistência e plataforma | [agentes/AG03.md](agentes/AG03.md) |
| AG04 | Interface React | [agentes/AG04.md](agentes/AG04.md) |
| AG05 | Cena e áudio | [agentes/AG05.md](agentes/AG05.md) |
| AG07 | Conteúdo, balanceamento e QA | [agentes/AG07.md](agentes/AG07.md) |

Não existe AG06; a numeração foi mantida como definida.

Economia de tokens: respostas e briefings curtos, leitura de arquivos em trechos, commit por etapa.

## Fonte da verdade

Em caso de conflito, vale nesta ordem: usuário, Bíblia (`bytecorp.md`), [decisoes.md](decisoes.md), documento do agente dono (`docs/AGxx/`).

## Fluxo

1. O usuário fala só com o AG00.
2. O AG00 escreve o briefing em `docs/briefings/BRF-xxx_AGxx_<entrega>.md` (modelo em [briefings/_modelo.md](briefings/_modelo.md)), com critério de pronto testável. Nenhum agente trabalha sem briefing.
3. O especialista entrega no formato: **entregue, validação, suposições, não testado, próximo passo**.
4. O AG00 valida (lê o diff, roda lint, typecheck, testes e build) antes de seguir.
5. Ao fechar a etapa, o AG00 commita e envia, e publica o relatório de fechamento: concluídas (ID e descrição) e próximas (ID, descrição e agente), sempre do marco atual.

**O AG00 só dispara tasks com autorização do usuário.** Escrever briefing e preparar o backlog pode; delegar a um especialista, não. A autorização vale para as tasks que o usuário nomear.

Regras:

- O AG00 gerencia e não implementa. Código, imagens, efeitos e sons são sempre de um especialista. O AG00 registra decisões, revisa, integra e commita.
- Agentes não pedem trabalho uns aos outros; pedem ao AG00. Todos podem ler os documentos de todos.
- Decisões criativas, de escopo e de stack sobem ao usuário com 2 ou 3 opções e uma recomendação.
- Sessões em paralelo só com arquivos diferentes, todas na branch `dev` e na mesma pasta (sem worktree).

## Posse de pastas (escrita)

Cada agente escreve só nas suas pastas. Escrever fora delas exige autorização explícita no briefing. Testes `*.test.ts` pertencem ao dono da pasta onde estão.

| Dono | Pastas e arquivos |
|---|---|
| AG00 | `CLAUDE.md`, `docs/00_*`, `docs/roadmap.md`, `docs/decisoes.md`, `docs/backlog.md`, `docs/briefings/`, `docs/agentes/`, `.claude/` |
| AG01 | Arquivos na raiz de `src/core/` (engine, clock, events, state, production, decimal, format), `src/core/economy/`, `src/core/catalog/types.ts`, `docs/AG01/` |
| AG02 | `src/core/progression/`, `docs/AG02/` |
| AG03 | `src/core/save/`, `src/platform/`, `src/app/`, `src/i18n/` (exceto `ui/` e `content/`), `public/` (exceto `public/assets/`), configuração da raiz (`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `.gitignore`, `netlify.toml`), `docs/AG03/` |
| AG04 | `src/ui/`, `src/i18n/ui/`, `src/main.tsx`, `src/index.css`, `index.html`, `docs/AG04/` |
| AG05 | `src/render/`, `src/audio/`, `public/assets/`, `docs/AG05/` |
| AG07 | `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/` |

A Bíblia (`bytecorp.md`) só muda com aprovação do usuário, registrada pelo AG00.

Textos de i18n: `src/i18n/ui/` é do AG04 e `src/i18n/content/` é do AG07; o restante de `src/i18n/` (combinação, `MessageKey`, `translate`) é do AG03.

## Marcos e tasks

- O [roadmap.md](roadmap.md) lista os marcos e o que se espera de cada um.
- Um marco só é quebrado em tasks quando começa.
- Task: pequena e verificável, cabe num briefing e numa sessão, tem um dono e um critério de pronto testável, pertence a um marco. O que não serve ao marco atual vai para "Depois".
- Dependências explícitas. Tasks que mexem nos mesmos arquivos não rodam em paralelo. Task que depende de item "A definir" em [decisoes.md](decisoes.md) fica bloqueada.
- Status: a fazer, pronta para briefing, em andamento, em validação, feita, bloqueada.
- O AG00 mantém o [backlog.md](backlog.md), que reflete o estado real confirmado por ele.

## Git

- `dev` é a única branch onde se commita. Publica em https://dev--bytecorpgame.netlify.app.
- `main` é protegida no GitHub: sem push direto, só recebe PR de `dev`, e só quando o usuário pedir, ao atingir um marco. Publica em https://bytecorpgame.netlify.app.
- Nenhuma outra branch é criada sem pedido do usuário.
- Só o AG00 commita e envia, por conta própria, ao fechar uma etapa. Especialistas nunca commitam.
- Trabalho agrupado, sem commit por pequena alteração. Mensagens em português, curtas e no imperativo.
- Todo commit deixa o projeto abrindo sem erro: antes de commitar, o AG00 roda `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
- PR: a descrição resume o que entrou e o que está pendente ou não verificado. Título e descrição são sempre colados também no chat.
- Cada marco fecha com PR, tag `v0.x.0` na `main` e a versão no título do jogo. Versões ficam só em tag, sem branch própria.
