# BRF-094 · AG07 · QA do M5

- **Task:** T-090 (marco M5)
- **Dono:** AG07
- **Depende de:** T-081, T-082, T-085, T-086, T-088, T-089 (feitas)
- **Pode escrever em:** `docs/AG07/`, testes novos em `tests/`. Não corrigir código de produção; defeitos vão para a lista da entrega.

## Objetivo

Validar o M5 em simulação e no navegador.

## Escopo

1. **Simulação:** com o catálogo de conquistas, medir no motor real o impacto das recompensas na run 1 e na árvore completa (comparar com `docs/AG07/conquistas-m5.md`); quantas conquistas a run 1 desbloqueia; nenhuma conquista impossível no conteúdo atual (exceto as marcadas como futuras).
2. **Roteiro manual** (`docs/AG07/roteiro-qa-m5.md` e `resultado-qa-m5.md`), 1280x720 e 375: tela inicial (primeiro acesso, Continuar, Novo jogo, Créditos, fundo animado e movimento reduzido), Configurações (idioma em toda a tela e recarga, valores salvos, Reset em dois passos, velocidade reservada), conquistas (notificação e fila, janela, secretas, recompensa entregue uma vez), estatísticas, tutorial (jogo novo até o primeiro Reboot, dispensar, pular), notificações locais (permissão, aba oculta, limite), save e migração de um save v2 do M4.
3. Servidor: `.claude/launch.json` config `dev`; dicas de pane oculta e de semear o save em `docs/briefings/BRF-047_AG07_executar-roteiro-m2.md` (semear via página estática, como no M4). Ao terminar, apagar o banco de teste, restaurar a janela e encerrar o servidor.

## Critério de pronto

- [ ] Relatório com tabela por passo, evidências curtas, defeitos com gravidade e passos para reproduzir.
- [ ] lint, typecheck, test e build passam com os testes novos.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo** e a lista de defeitos. Não commitar.
