# BRF-081 · AG02 · Conquistas: regras

- **Task:** T-077 (marco M5)
- **Dono:** AG02
- **Depende de:** M4 fechado (feito); D-20 (cerca de 40 conquistas)
- **Pode escrever em:** `src/core/progression/`, `src/core/catalog/` (só tipos e um catálogo mínimo de teste; o catálogo real é da T-078), `src/core/state.ts`, `src/core/engine.ts` e eventos. Não mexer em `src/core/save/` (T-079) nem em `src/ui/`.

## Objetivo

Sistema de conquistas no núcleo (Bíblia 11): avaliação de requisitos, progresso, recompensas e eventos, orientado a dados para o catálogo crescer sem mudança estrutural.

## Escopo

- Tipos do catálogo: id, categoria (7, ver Bíblia 11), raridade (4), requisito, secreta (com pista), recompensa; textos por `MessageKey` (`achievement.<id>.name|desc|hint`).
- Tipos de requisito: Bytes gerados, produção por segundo, cliques e críticos, equipamentos e agentes (quantidade ou nível), Reboots, Quantum Cores e nós da árvore, estágios, tempo de jogo acumulado. Cada um com valor-alvo e função que lê o progresso atual.
- Recompensas: Bytes, bônus temporário de 15, 30 ou 60 min (usar `grantTemporaryBonus`, D-17) e Quantum Cores.
- Estado em `meta` (permanente, sobrevive ao Reboot): conquistas desbloqueadas com data/tempo, recompensas já entregues. Progresso é calculado a partir do estado, sem duplicar contadores. Informar ao AG03 os campos novos e a necessidade de estatísticas novas (tempo de jogo aberto).
- Avaliação no `advance` e após ações (compra, clique, Reboot), barata; desbloqueio idempotente, recompensa entregue uma vez; evento `achievementUnlocked` com id e recompensa.
- Secretas: o requisito existe, mas o progresso não é exposto até desbloquear (consulta devolve só a pista).
- API para a UI: lista com estado, progresso (atual/alvo) e recompensa.
- Testes: cada tipo de requisito, idempotência, recompensa uma vez, sobrevivência ao Reboot, secreta oculta, tempo igual a 10 ou 144 FPS. Um catálogo mínimo de teste (3 a 5 itens), sem os 40 reais.
- Não faz: catálogo real e textos (T-078), save (T-079), interface (T-080 e T-081).

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, mais a lista exata de campos de estado novos para o AG03. Não commitar.
