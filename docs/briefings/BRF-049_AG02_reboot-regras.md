# BRF-049 · AG02 · Reboot (regras)

- **Task:** T-034 (marco M3)
- **Dono:** AG02
- **Depende de:** M2 fechado; D-15 em `docs/decisoes.md`
- **Pode escrever em:** `src/core/progression/` e, só no mínimo necessário e só para esta task, `src/core/events.ts`, `src/core/state.ts` e `src/core/engine.ts` (donos: AG01). Se o formato do `GameState` mudar, avisar no relatório (o AG03 trata o save na T-038).

## Objetivo

Implementar as regras do Reboot no núcleo, sem interface.

## Contexto

Bíblia 9.2 a 9.4 e CLAUDE.md ("Reboot"): zera Bytes, equipamentos, agentes e níveis, melhorias comuns e desbloqueios de execução (`run`); preserva Quantum Cores, árvore Quantum, estatísticas históricas e `meta`. A recompensa vem de uma função injetável; a fórmula real é a T-035 (D-15), fora desta task.

## Escopo

- Faz: `GameEngine.reboot()` (ou serviço em `progression/` chamado pelo engine) que:
  - recusa se a recompensa injetada for menor que 1 core ou se não houver condição (retorna resultado, não lança);
  - soma a recompensa a `meta` (saldo de Quantum Cores e total já ganho, se o campo existir; criar se faltar);
  - reinicia `run` ao estado inicial (estágio, bytes, equipamentos, agentes, melhorias, `bytesEarned`);
  - incrementa `stats.reboots` e preserva o restante de `stats`;
  - chama `invalidate()` e emite o evento `reboot` (com recompensa e número do reboot) e `stateReplaced`/`stageChanged` se for o caso.
- Recompensa e condição entram por uma função injetável (`rebootReward(state) => number`), com padrão provisório que retorna 0 até a T-035.
- Testes com o catálogo real: o que zera, o que fica, contagem, evento, recusa sem recompensa, o motor segue produzindo depois.
- Não faz: fórmula de Quantum Cores (T-035), árvore (T-036), interface, efeito visual, mudar o formato do save.

## Critério de pronto

- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- [ ] Testes cobrem os itens do escopo; arquivos de AG01 alterados só no mínimo e listados no relatório.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
