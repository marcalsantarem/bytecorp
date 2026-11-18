# BRF-088 · AG04 · Estatísticas em modal

- **Task:** T-082 (marco M5)
- **Dono:** AG04
- **Depende de:** T-079 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` (se faltar um total, relatar ao AG00).

## Objetivo

Modal de estatísticas detalhadas (Bíblia 15.5): lista vertical única de totais acumulados, sem abas nem gráficos.

## Escopo

- Botão de acesso (rodapé ou onde for mais coerente com o layout atual).
- Itens a partir de `engine.state.stats` e `meta`: Bytes gerados (total e na run), cliques e críticos, equipamentos e agentes comprados, melhorias, Reboots, Quantum Cores ganhos e gastos, nós comprados, conquistas, tempo de jogo aberto, tempo offline creditado, maior produção por segundo (os que existirem; listar os que faltarem).
- Números com a formatação do jogo; tempo em h/min.
- Textos pt-BR e en; mobile 375 e desktop; `useModal`.
- Testes de componente; verificar no navegador e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
