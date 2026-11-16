# BRF-075 · AG07 · QA do M4

- **Task:** T-074 (marco M4)
- **Dono:** AG07
- **Depende de:** T-067, T-069, T-072, T-073 (feitas)
- **Pode escrever em:** `docs/AG07/`, testes novos em `tests/`. Não corrigir código de produção; defeitos vão para a lista da entrega.

## Objetivo

Validar aceleradores, bônus temporários e produção offline em simulação e no navegador, e dizer se o ganho dos aceleradores é aceitável.

## Escopo

1. **Simulação com o motor real** (`tests/tempo-m4.test.ts`, relatório com env `TEMPO_REPORT=1`, faixas protegidas; manter o tempo do teste moderado, abaixo de ~1 min, ou marcar a parte longa como pulada sem a variável; o `prestigio-m3` já pesa 2 min): tempo até Mega Corporation na run 1 com 1 clique/s (a) sem aceleradores, (b) usando cada concessão assim que recebida ("ao receber", ativando na hora), (c) encadeando quando possível; árvore completa em quantos Reboots e horas com e sem aceleradores (política do `prestigio-m3`); ganho percentual de cada concessão; confirmar a estimativa do AG07 (teto de cerca de 45% na árvore) e propor ajuste com números se for alto demais (alavancas: concessão de Reboot a cada 2 Reboots, que mudaria a D-16; baixar Data Center para 2x/15). Garantir que sem aceleradores a curva não mudou (`curva-m2` e `prestigio-m3` passam).
2. **Offline com o motor real:** ausência de 1 h, 8 h e 20 h (limite de 8 h), com e sem acelerador (inclusive acelerador que expira no meio e acelerador de 60 min com ausência de 10 h), produção constante contra `advance`, conferência do tempo do acelerador depois da ausência, nenhum crédito duplo após recarregar.
3. **Roteiro manual** (`docs/AG07/roteiro-qa-m4.md` e `resultado-qa-m4.md`) em 1280x720 e 375: receber acelerador ao mudar de estágio e no Reboot, inventário, ativar, substituir (perder e guardar), indicador, aviso de encerramento, expiração, acelerador durante o Reboot, resumo de retorno com save semeado (3 h e 20 h atrás, com acelerador), recarregar logo depois (sem crédito duplo), Reset do jogo. Semear o save no IndexedDB (`byte-corp-idle` / `kv` / `save`, SAVE_VERSION 2) por uma página estática da mesma origem (por exemplo `/favicon.svg`) e só depois navegar para `/`, pois a gravação em `pagehide` sobrescreve o save semeado ao recarregar a página do jogo. Dicas de pane oculta em `docs/briefings/BRF-047_AG07_executar-roteiro-m2.md`. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
4. Verificar as pendências do backlog do M4 (indicador sobe 15 px ao acabar, nome do catálogo no inventário, `stageBefore` do resumo, aviso de encerramento visto de fato) e a **volta à aba oculta** com `visibilitychange` real se for possível reproduzir no navegador.

## Critério de pronto

- [ ] Relatório com tabela por passo, evidências curtas, defeitos com gravidade e passos para reproduzir; propostas de ajuste com números.
- [ ] lint, typecheck, test e build passam com o teste novo.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, lista de defeitos e de propostas de ajuste. Não commitar.
