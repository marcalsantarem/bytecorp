# BRF-059 · AG07 · QA do M3

- **Task:** T-044 (marco M3)
- **Dono:** AG07
- **Depende de:** T-037, T-038, T-043 (feitas)
- **Pode escrever em:** `docs/AG07/`, testes novos em `tests/`. Não corrigir código de produção; defeitos vão para a lista da entrega.

## Objetivo

Validar o prestígio do M3 em simulação e no navegador, e propor ajustes de balanceamento (D-15 prevê ajuste dos pesos).

## Escopo

1. **Simulação de ciclos de prestígio** (`tests/prestigio-m3.test.ts`, motor real, jogador guloso com 1 clique/s como em `tests/curva-m2.test.ts`; relatório com env `PRESTIGIO_REPORT=1`, teste protegido em faixa): quantos cores por Reboot a cada estágio e quando o botão habilita (≈ 1 core, ~7 min); duração de cada run seguinte comprando nós da árvore (política simples e documentada: comprar o nó mais barato disponível); quantos Reboots para completar a árvore (~495 cores, alvo de 8 a 10 estava na estimativa); quanto o prestígio acelera a run (tempo até Mega Corporation na run 2, 3, 5); risco de run infinita de ganho ou de run que estagna. Propor ajustes (pesos da D-15, custos da árvore) com números.
2. **Efeitos da árvore:** conferir no motor que cada tipo de efeito muda o resultado, que o desconto do caminho gama (+10 pp) é inócuo ou não diante do teto de 50 pp (A-04/backlog) e propor solução; confirmar que nós desconhecidos no save são ignorados nos cálculos.
3. **Roteiro manual** (`docs/AG07/roteiro-qa-m3.md` e execução em `resultado-qa-m3.md`) no navegador, 1280x720 e 375: Reboot (botão desabilitado/habilitado, janela, confirmação, efeito pulável, estado pós-Reboot), árvore (abrir/fechar, pan, zoom, selecionar, comprar, bloqueios, reset em dois passos e recusa), save após Reboot e recarga (cores, nós, reboots), Reset do jogo. Servidor: `.claude/launch.json` config `dev`; ver dicas de pane oculta em `docs/briefings/BRF-047_AG07_executar-roteiro-m2.md`. Estados de teste por edição do save em IndexedDB (`byte-corp-idle` / `kv` / `save`). Ao terminar, apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
4. Verificar as pendências do backlog (M3): trap de foco, botão de reset desabilitado sem nível comprado.

## Critério de pronto

- [ ] Relatório com tabela por passo, evidências curtas, defeitos com gravidade e passos para reproduzir; propostas de ajuste com números.
- [ ] lint, typecheck, test e build passam com o teste novo.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, lista de defeitos e de propostas de ajuste. Não commitar.
