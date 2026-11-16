# Roteiro de QA manual do M3 (Reboot e árvore Quantum)

Pré-requisito: `npm run dev` (ou `.claude/launch.json`, config `dev`). Repetir em **1280x720** e **375x812**. Estados de teste: editar o save no IndexedDB (`byte-corp-idle` / `kv` / `save`, valor JSON em texto; `state.run`, `state.meta`, `state.stats`; Decimais como string) e recarregar. Com a pane oculta, o DOM só redesenha depois de uma captura de tela. Zerar: apagar o banco.

Fórmula de cores (D-15): `floor(((L-4)/2)^2) + índice do estágio + floor(melhorias/4)`, L = log10 de `run.bytesEarned`. Exemplos: Garage Company com 1e4 B = 1; Data Center com 1e9 B e 2 melhorias = 6+3 = 9; Corporate Network com 1e12 B e 1 melhoria = 16+4 = 20.

Cada passo: **Ação** e **Esperado**.

## A. Reboot

1. Jogo novo. Esperado: botão Reboot do rodapé desabilitado, com dica "Gere mais Bytes para ganhar ao menos 1 Quantum Core." (title e texto para leitor de tela).
2. Garage Company com 1e4 B gerados (estágio `garage_company`). Esperado: Reboot habilitado com "+1".
3. Abrir a janela. Esperado: "Quantum Cores a ganhar +1", "Total depois do Reboot" = saldo + 1; listas "Perde" e "Preserva"; foco em Cancelar.
4. Tab repetido e Shift+Tab. Esperado: o foco circula entre Cancelar e Confirmar, sem sair da janela.
5. Escape e Cancelar. Esperado: fecha sem alterar Bytes, cores nem estágio; o foco volta ao botão Reboot.
6. Confirmar. Esperado: efeito "REBOOT" em tela cheia (2 a 3 s) com botão "Pular"; ao fim ou ao pular o efeito some; cores + recompensa; Bytes 0, Solo Hacker, sem equipamentos, agentes nem melhorias; Reboot desabilitado de novo.
7. Estado com cores 5, 1e9 B gerados, estágio Data Center, home_router 10, echo_ai nível 2, duas melhorias, conquista e 7 cliques. Reboot. Esperado: recompensa +9, total 14; run zerada; estatísticas (cliques, total gerado), conquistas e árvore preservadas; `stats.reboots` +1.
8. Recarregar logo após confirmar (menos de 0,5 s). Esperado: o save já tem cores, reboots e run zerada (o Reboot grava na hora).

## B. Árvore Quantum

9. Rodapé > Árvore Quantum. Esperado: tela cheia com saldo de cores, botão Resetar árvore (desabilitado sem nível comprado), Fechar, mapa com 12 nós (3 raízes disponíveis), zoom + e -; foco em Fechar.
10. Selecionar nó (clique ou toque). Esperado: painel (lateral no desktop, inferior no celular) com nome, caminho, nível, efeito atual e do próximo nível, pré-requisitos, custo, "Comprar nível".
11. Selecionar nó bloqueado. Esperado: pré-requisito "pendente", "Bloqueado: compre antes os pré-requisitos.", compra desabilitada.
12. Comprar níveis do núcleo (custos 1, 1, 3, 5). Esperado: saldo cai, nível sobe, nó acende; com saldo curto "Saldo insuficiente: faltam N Quantum Cores." e compra desabilitada; o save grava em até 0,5 s.
13. Pan (arrastar) e zoom (botões, roda, pinça). Esperado: arrastar move o mapa; zoom entre 0,3 e 2; no enquadramento inicial, onde o mapa cabe inteiro, arrastar não move (limite).
14. Fechar (X e Escape). Esperado: volta ao jogo; foco volta ao botão do rodapé.
15. Tab repetido (mais vezes que o número de controles). Esperado: o foco fica dentro da árvore (janela modal).
16. Nó desconhecido no save (`quantumNodes.ghost_node = 3`). Esperado: a tela abre normal, mostra 12 nós, o save preserva o campo.

## C. Reset da árvore

17. Com níveis comprados, Resetar árvore. Esperado: passo 1 com "Cores devolvidos", "Custo do reset" (3, 6, 9, ...) e "Saldo final"; "Não é um Reboot".
18. Tab repetido. Esperado: o foco não sai da janela.
19. Continuar. Esperado: passo 2 "Confirma? O custo do reset não é devolvido."; Cancelar fecha sem alterar nada.
20. Confirmar. Esperado: níveis zerados, saldo = antes + devolvidos - custo, `treeResets` +1, botão Resetar árvore desabilitado, Bytes e equipamentos intactos.
21. Saldo + devolução menor que o custo. Esperado: aviso de recusa com "faltam N", só o botão Fechar.

## D. Save e Reset do jogo

22. Reboot, comprar nós e recarregar. Esperado: cores, nós, `treeResets` e `reboots` iguais.
23. Reset do jogo (dois toques). Esperado: cores 0, nós vazios, `treeResets` 0, `reboots` 0, conquistas vazias, Solo Hacker.

## E. Layout

24. 375 px: janela de Reboot, árvore e janela de reset sem rolagem horizontal; botões de 44 px; nós e botão Pular com alvo confortável.
