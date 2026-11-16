# Resultado do QA do M3 (BRF-059 / T-044)

Execução: navegador embutido, `npm run dev` (porta 5173), versão exibida v0.3.0, 1280x720 e 375x812. Estados criados editando o save (`byte-corp-idle` / `kv` / `save`) e recarregando; banco apagado no início e no fim. Com a pane oculta o DOM só redesenha após uma captura de tela; a leitura foi feita por DOM e pelo save. Roteiro: `roteiro-qa-m3.md`. Simulação: `tests/prestigio-m3.test.ts` (relatório com `PRESTIGIO_REPORT=1`).

Legenda: P = passou, F = falhou, P* = passou com observação, N = não executado (motivo).

## 1. Roteiro manual

| # | 1280 px | 375 px | Evidência |
|---|---|---|---|
| 1 | P | P | Jogo novo: Reboot `disabled`, `title` e texto `sr-only` "Gere mais Bytes para ganhar ao menos 1 Quantum Core." |
| 2 | P | P | Garage Company com 1e4 B: botão "Reboot +1". |
| 3 | P | P | Janela: "+1", total 1 (saldo 0), listas Perde (5) e Preserva (5), foco em Cancelar. Em 375: janela 351x558 sem rolagem, botões 155x58. |
| 4 | P | N | Tab x3 e x1 alternam só Cancelar/Confirmar (trap ok). No celular o mesmo código; não repeti por teclado. |
| 5 | P | N | Escape fecha, nada muda; com clique real o foco volta ao `reboot-button` (com `.click()` por script o foco não tinha origem e ficou no body: artefato do teste). |
| 6 | P | P | Efeito "REBOOT" em canvas tela cheia, botão "Pular"; sumiu ao pular e ao esgotar (~3 s). Pós: cores 1, Bytes 0, Solo Hacker, botão desabilitado. |
| 7 | P | P | 1e9 B, Data Center, 2 melhorias: "+9" e total 14 (6+3+0, bate com a D-15). Pós: run zerada, cliques (7) e total gerado preservados, conquista preservada, `reboots` +1. No celular: +9 e 11 -> 20. |
| 8 | P | N | Recarga 150 ms após confirmar (Corporate Network, +20): save com cores 21, reboots 3, run zerada. |
| 9 | P | P | Árvore abre com saldo, Resetar (desabilitado sem níveis), Fechar, 12 nós, zoom, foco em Fechar. |
| 10 | P | P | Painel com nome, caminho, nível 0/∞, efeito atual "nenhum", próximo "+10% de produção global", custo 1, comprar. Celular: painel inferior. |
| 11 | P | P | Overclock: "Núcleo Quantum pendente", "Bloqueado: compre antes os pré-requisitos.", compra desabilitada. |
| 12 | P | P | Custos 1, 1, 3, 5 (14 -> 4); com 4 cores "faltam 6" e compra desabilitada. O save atrasa até 300 ms (coalescido): ok. |
| 13 | P* | P | Arrastar move (desktop zoom 2: translate -112/-112 px); zoom + / - de 0,3 a 2; roda muda o zoom sem rolar a página. No enquadramento inicial arrastar não move (limite do mapa): esperado. Celular: arrastar leva as raízes beta/gama à vista. |
| 14 | P | N | Escape (evento) fecha a árvore; o botão X fecha no celular. |
| 15 | F | F | Tab x20: o foco saiu da árvore para os botões da loja atrás (ver D1). |
| 16 | P | N | `ghost_node: 3` no save: árvore normal com 12 nós, nível do núcleo 1, save preservou o campo depois do autosave. |
| 17 | P | P | Resumo: devolvidos +10, custo -3, final 11; celular +2, -3, 11. |
| 18 | F | N | Tab x5: o foco saiu da janela de reset para "Melhorias" da loja; com o foco fora, Escape não fechou a janela (ver D1). |
| 19 | P | P | Passo 2 "Confirma? O custo do reset não é devolvido.", foco em Cancelar; Cancelar não altera o save. |
| 20 | P | P | Save: cores 4 -> 11, nós `{}`, `treeResets` 1; árvore continua aberta; Resetar desabilitado. |
| 21 | P | N | Cores 1 + devolvidos 1 contra custo 9: "faltam 7", saldo final "—", só o botão Fechar. |
| 22 | P | N | Coberto pelos passos 8 e 20 (recarga com cores, nós, `treeResets` e `reboots`). |
| 23 | P | P | Reset do jogo em dois toques: cores 0, nós `{}`, `treeResets` 0, `reboots` 0, conquistas vazias, Solo Hacker. |
| 24 | N | P* | Sem rolagem horizontal (375). Alvos: Resetar árvore 42x44, nós 31x31 no enquadramento inicial, "Pular" 68x30 (ver D3 e D4). |

Console sem erros.

Pendências do backlog verificadas: trap de foco na árvore e na janela de reset: **não existe** (D1); botão de reset da árvore **desabilitado sem nível comprado**: correto (passos 9 e 20).

## 2. Simulação de prestígio (motor real, 1 clique/s, comprador guloso)

Política da árvore: antes de cada run, comprar o nó disponível mais barato até o saldo não cobrir o mais barato; "completa" = todos os nós finitos no máximo e `alpha_core` nível 5 (495 cores).

**Run 1 (sem árvore):** primeiro core aos 3,8 min (Garage Company; o índice do estágio já dá 1 core, então o "~7 min / L=6" da D-15 não vale: o botão habilita no 1o estágio). Recompensa ao abrir cada estágio: Startup Lab 4 (7,2 min), Data Center 10 (13,6), Corporate Network 22 (23,3), Quantum Facility 38 (37,7), Mega Corporation 59 (74,3 min, com 18 melhorias). A D-15 estimava 3, 10, 22, 38 e 59: o primeiro valor era 3, na prática 4.

**Política "Reboot ao abrir Mega" (a run de referência):** a árvore completa em **10 Reboots, 4,3 h** de jogo. Mega Corporation por run: 74,2, 33,5, 27,8, 23,8, 19,0, 17,7, 16,5, 16,3, 13,9 e 13,0 min (run 2 = 45%, run 3 = 37%, run 5 = 26% da primeira). Multiplicador final da run: 7,2 na run 1 e 35,6 na run 10. Compras por Reboot: 21 nós (59 cores), 8, 6, 5, 3, 3, 2, 2, 2.

**Comparação de políticas de Reboot (tempo para completar a árvore):**

| Política | Runs | Total de jogo | Run típica |
|---|---|---|---|
| Ao chegar a 1 core (Garage Company) | 60+ (incompleta em 60 runs, 2,0 h) | - | 3,8 min caindo a 1,5 min, 1 core por run |
| Ao poder comprar o nó mais barato ("afford") | 53 | 3,9 h | 3 a 7 min |
| Ao abrir Startup Lab | 60+ (incompleta, 2,6 h) | - | 7,2 min caindo a 1,6 min, 4 cores |
| Ao abrir Data Center | 52 | 3,5 h | 13,6 min caindo a 2,3 min, 10 a 11 cores |
| Ao abrir Corporate Network | 25 | 3,0 h | 23 min caindo a 4,1 min, 22 cores |
| Ao abrir Mega Corporation | 10 | 4,3 h | 74 min caindo a 13 min, 59 cores |

Leitura: jogar até Mega é a política que menos Reboots exige (os 8 a 10 estimados), mas a mais lenta em tempo de relógio; o prestígio frequente em Corporate Network completa a árvore em 3,0 h. Cores por hora de jogo: run 1 até Mega 48/h; run 10 até Mega 272/h; Corporate Network na run 25, 320/h. Não há run infinita de ganho nem run estagnada: toda run alcançou o estágio de parada (teto de 3 h por run, não usado) e a recompensa é função só da run, sem realimentação.

**Aceleração:** a primeira run até Mega leva 74 min e a quinta 19 min (4x). Os ganhos têm retornos decrescentes: as últimas runs economizam 1 a 3 min por 22 a 33 cores.

**Sensibilidade do custo da árvore (`baseCost` x k):**

| Custo | Reboot ao abrir Mega | Corporate Network |
|---|---|---|
| x1 (495 cores) | 10 Reboots, 4,3 h | 25 runs, 3,0 h |
| x1,5 | 15 Reboots, 6,2 h | 38 runs, 4,7 h |
| x2 | 19 Reboots, 7,8 h | 51 runs, 6,1 h |

### Efeitos da árvore

Testes (`tests/prestigio-m3.test.ts`, catálogo real): cada um dos 12 nós, com 1 nível e pré-requisitos, muda o resultado do tipo prometido (produção, clique, chance de crítico, multiplicador crítico via clique forçado, desconto, limite offline); nó sem pré-requisito recusa sem gastar; nós desconhecidos (`no_exist: 9`) não alteram produção, clique, desconto, limite offline nem `quantumCoresSpent`, a compra de um id desconhecido é recusada e o reset zera o mapa.

**Desconto do caminho gama (+10 pp) e teto de 50 pp:** a preocupação do backlog não se confirma. Sem a árvore o desconto da run 1 chega a **44,2 pp** em Mega Corporation (nunca atinge o teto); com a árvore gama completa: 10, 11, 12,5, 20, 33 e 50 pp (bruto 50,3) por estágio. O efeito é real: Mega em 68,0 min contra 74,3 min (-8,5%). Só os últimos 4,2 pp do caminho ficam acima do teto no fim da run 1, e em runs com mais agentes/ATLAS_CORE evoluídos isso cresce, mas o efeito não é inócuo. Recomendação: manter; se se quiser garantir folga futura, não reduzir o ATLAS_CORE, e sim deixar o caminho gama como está (retorno concentrado no início e no meio da run, onde faz diferença).

## 3. Defeitos

- **D1 (média, acessibilidade). Falta trap de foco na árvore Quantum e na janela de reset.** Ambas são `role="dialog" aria-modal="true"` mas o Tab sai para a loja e os botões atrás. Reproduzir: abrir a árvore, Tab 20 vezes: `activeElement` vira um botão da loja ("x1"). Na janela de reset: Tab 5 vezes leva a "Melhorias"; com o foco fora, Escape não fecha a janela (o `onKeyDown` está na própria janela). A janela de Reboot prende o foco corretamente (modelo: `RebootControl.tsx`). Corrigir no `QuantumTree.tsx` e no `QuantumResetDialog.tsx` (AG04).
- **D2 (baixa, balanceamento/documentação). O primeiro core vem aos 3,8 min (Garage Company), não aos ~7 min da D-15.** A causa é o índice do estágio (+1), não o L. Registrar na D-15 ou mover a condição (ver propostas).
- **D3 (baixa, toque). Nós da árvore com 31x31 px em 375 px no enquadramento inicial** (zoom 0,40); o rótulo "0/5" fica ilegível. Reproduzir: 375x812, abrir a árvore. O zoom + resolve, mas o enquadramento inicial poderia ter piso de zoom ou nós de 44 px.
- **D4 (baixa, toque). Botão "Pular" do efeito de Reboot com 68x30 px e "Resetar árvore" com 42x44 px em 375 px.** Abaixo dos 44 px do projeto.
- **D5 (baixa, visual). No rodapé de 375 px o botão Reboot (116x58) é mais alto que Árvore Quantum (116x44)** quando mostra "+N" (o valor quebra para a segunda linha).

Nenhum defeito de lógica (cores, custos, compras, reset, save, preservação do Reboot) encontrado.

## 4. Propostas de ajuste (opções para o AG00 levar ao usuário)

1. **Custos da árvore**: sem ajuste, completa em 10 Reboots (4,3 h de jogo ativo até Mega), dentro dos 8 a 10 estimados. Se a meta de longo prazo for maior, multiplicar `baseCost` por 1,5 (15 Reboots, 6,2 h) ou por 2 (19 Reboots, 7,8 h); a run final continua em ~13 min nos dois casos. Recomendação: manter x1 no M3 e rever com o conteúdo do M4 em diante (offline e conquistas também aceleram).
2. **Condição do botão e peso do estágio (D-15)**: o botão habilita aos 3,8 min porque o estágio vale 1 core. Opção A: manter (primeiro Reboot cedo, 1 core, ensina o sistema). Opção B: `stageWeight` 0,5 (a conta, não simulada: Garage Company 0 cores; em Startup Lab, 1e6 B, L=6: 1 + 1 = 2), de modo que o botão habilita só ao abrir Startup Lab, aos 7,2 min, como a D-15 descrevia. Recomendação: B, se a intenção era o primeiro Reboot por volta dos 7 min; os demais valores (Mega 59 -> 56, Corporate Network 22 -> 20) mudam pouco, mas a curva de prestígio precisaria ser resimulada.
3. **Recompensa quase fixa por estágio**: com o peso atual, parar em Corporate Network rende 320 cores/h, acima de Mega (272/h), o que incentiva Reboots frequentes. Não é defeito. Se se quiser incentivar runs longas, a alavanca é o termo logarítmico (`logDivisor` menor dá mais cores a runs longas: L=18 vale 49 hoje e 60 com 1,8), mas o efeito nas políticas não foi simulado.
4. **Desconto gama**: manter (seção 2).

## 5. Limpeza

Banco `byte-corp-idle` apagado, janela restaurada ao preset desktop e servidor de desenvolvimento encerrado.

## 6. Ajuste do D2 (T-047c)

`stageWeight` baixou de 1 para 0,5 em `DEFAULT_CORES_WEIGHTS`. Run 1 sem árvore: o botão habilita aos 6,9 min (Startup Lab, antes 3,8 min). Cores por estágio: 0 (Garage), 3, 8, 20, 35, 56 (antes 3, 10, 22, 38, 59). A árvore completa em 10 Reboots, como antes (4,4 h no total); Mega por run: 74, 36, 29, 26, 19 min.
