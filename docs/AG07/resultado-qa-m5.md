# Resultado do QA do M5 (BRF-094 / T-090)

Execução: dev em e8f02d9, navegador embutido, servidor `dev` (5173), 1280x720 e 375x812. Save e configurações existentes copiados para fora do navegador antes do teste e restaurados no fim (conferido byte a byte); estados semeados no IndexedDB a partir de `/manifest.webmanifest`. A chave `localStorage['__ag05_bk']` foi apagada. Janela restaurada (preset desktop), servidor encerrado. Roteiro: `roteiro-qa-m5.md`. Testes novos: `tests/qa-m5.test.ts` (50 casos, cerca de 2 s).

Legenda: P = passou, F = falhou, P* = passou com observação, N = não executado (motivo), C = ponto já conhecido, aguardando decisão (não é defeito).

## 1. Roteiro manual

| # | 1280 | 375 | Evidência |
|---|---|---|---|
| 1 | P | P | Banco vazio: logo, "Novo jogo" (primário), Configurações e Créditos, sem Continuar. Novo jogo entra direto no jogo com o tutorial "Primeiros Bytes". Em 375: botões 320x48, `scrollWidth` 375. |
| 2 | P / C | P | Com save: Continuar com foco (`activeElement` = `start-continue`) e entra com 110 cliques. Novo jogo abre "Começar um novo jogo?"; Cancelar fecha sem apagar; "Apagar e começar" (375) zera o save (cliques 0) e mantém as configurações (música 30). Continuar visível após Reset pela tela inicial: conhecido, não repetido. |
| 3 | P | N | Créditos abre ("Créditos completos em breve") e fecha com Esc. |
| 4 | P* | N | Fundo animado (canvas com rede e grade) visível atrás do menu. Movimento reduzido: a pane não emula `prefers-reduced-motion`; coberto só por `src/render/startBackground.test.ts`. |
| 5 | P | N | English troca header, painéis, loja, tutorial, conquistas (datas em "11/18/26, 1:40 PM", números "1,000"), estatísticas, configurações, tela inicial e `lang="en"`; nada em português restante. Sobrevive à recarga. |
| 6 | P | N | Música 30, qualidade Baixa e idioma en gravados em `settings` e mantidos após recarregar. As categorias ficam desabilitadas com "Ativar notificações" desligado (clique sem efeito, correto). |
| 7 | P | N | 1º clique: "Confirm reset", volta a "Reset" após o prazo (conferido em 5 s). 2º clique: save zerado (stats 0), volta ao jogo novo com o tutorial do início, idioma en mantido. |
| 8 | P | N | "Velocidade de jogo: 1x, Em breve", sem controle (D-19). |
| 9 | P | P | Notificação central "Conquista desbloqueada" com raridade, nome, descrição e recompensa ("Dedo aquecido", +50 B). Fecha só pelo jogador (X ou Esc) e espera janelas modais (some com o resumo offline aberto, aparece depois). Fila: save v2 com 11 desbloqueios de uma vez mostrou um por vez, na ordem do catálogo, com "+N na fila" de 10 a 0; a fila fechada fica vazia no save. |
| 10 | P | P | Janela com 7 categorias e contagem (Cliques 1/7), selo de raridade, progresso ("110 / 1.000"), recompensa e "Desbloqueada em 18/11/2026, 13:40". 375: 351x788, sem rolagem horizontal. |
| 11 | P | N | Secretas bloqueadas: "Conquista secreta" e só a pista, sem nome, raridade, progresso nem recompensa. |
| 12 | P | N | Save v2 com `clicks_100` já listada: não reaparece na fila nem paga; após a fila, recarregar não gera notificação nem pagamento (12 desbloqueadas, 12 entregues, fila vazia). Reboot e reinício da árvore: só em teste (`qa-m5.test.ts`). |
| 13 | P / C | P | Valores iguais ao save: 1.200 cliques, 60 críticos, 20,08 MB gerados (save 20.077.553), 10 kB por cliques, 105 equipamentos, 1 agente, 12 de 42, 58 min. Bytes de recompensa não entram em "gerados" (regra da T-077). Sem totais históricos de compras, cores ganhos, offline e maior B/s: conhecido. |
| 14 | P* | P* | Clique (destaca o botão), Primeiro equipamento (destaca a loja), Produção passiva (manual, "Entendi"), Conquistas (concluída ao abrir a janela). Com o agente ainda indisponível, o passo seguinte exibido foi Melhorias (cada passo só aparece quando ativa; não é uma sequência rígida). Reboot e árvore: não percorridos no navegador (cobertos por `tutorial.test.ts`). Em 375 o passo da loja diz "Abra a aba Loja." e destaca a aba, mas o cartão cobre o botão Processar dados (D1). |
| 15 | P* | N | "Pular tutorial" esconde a dica; `dismissed: true` só chega ao save no autosave seguinte (até 10 s, O3). Após recarregar, sem dica. |
| 16 | P | N | Permissão do navegador embutido é `denied`: ligar mostra "O navegador bloqueou as notificações..." e o interruptor fica desligado. |
| 17 | N | N | Aba oculta e limites: permissão negada na pane e sem como ocultar a aba (mesmo limite do M4). Coberto por `src/app/notifications.test.ts` (3 s, 2 min, 10 min). Categoria offlineFull ausente da tela: conhecido. |
| 18 | P* | N | Save v2 (Data Center, 105 equipamentos, 1.200 cliques, 1 agente, `achievements: [clicks_100]`): resumo offline, depois 11 conquistas de uma vez, cada uma paga uma vez (saldo = 50 MB + 50,25 kB offline + 25.600.600 B de recompensas + produção), bônus 1,05x e 1,1x ativos, save regravado como v3. O tutorial do jogador do M4 começa do zero e mostra "Produção passiva" (O2). |
| 19 | P | N | Save v3 com `achievementQueue: [42]`: tela "Salvamento inválido" com "Iniciar novo jogo". |
| 20 | - | P | 375: tela inicial, Conquistas (351 px), Estatísticas (351 px), Configurações (351 px; interruptores 20x20 dentro de rótulos de 279 a 291x44), notificação e dica de 320 px; `scrollWidth` 375 em todas. |

## 2. Defeitos

| # | Gravidade | Defeito | Como reproduzir |
|---|---|---|---|
| D1 | Média | Em 375, a dica do tutorial que aponta para uma aba inferior ("Primeiro equipamento: Abra a aba Loja.") ocupa y 481 a 675 e cobre por inteiro o botão Processar dados (566 a 644): `elementFromPoint` no centro, no canto e no fim do botão cai na dica. O jogador só volta a clicar abrindo a Loja ou fechando a dica. Provável também no passo do agente (aba Agentes). | Novo jogo em 375x812, 20 cliques; a dica sobe para perto da barra de abas. (AG04) |

## 3. Observações (sem defeito)

- O1. Não há indicador dos bônus temporários de conquista ativos nem do tempo restante; só se vê o efeito na produção. A Bíblia 11.6 não exige indicador; registrar se for desejado.
- O2. Save do M4 migrado começa o tutorial do zero: um jogador com 105 equipamentos recebe "Produção passiva" e passos de iniciante. Opção: na migração v2 para v3, marcar como concluídos os passos já atendidos pelo estado.
- O3. "Pular tutorial" e o fechamento da fila de conquistas só vão ao save no autosave (até 10 s).
- O4. Em 375 o rótulo "Quantum Cores" do topo quebra em duas linhas (cabe, sem rolagem).
- Conhecidos, não repetidos como defeito: offlineFull sem efeito na UI; Continuar visível após Reset pela tela inicial; 10 cliques/s chega a Mega em 46,9 min com conquistas; estatísticas sem totais históricos.

## 4. Simulação com o motor real

`CONQUISTAS_REPORT=1 npx vitest run tests/conquistas-m5.test.ts --disable-console-intercept` (cerca de 5 min; sem a flag de console o relatório não aparece).

| Cenário | Sem conquistas | Com conquistas | Adianta | `conquistas-m5.md` |
|---|---|---|---|---|
| Run 1 até Mega, 1 clique/s | 74,3 min | 69,4 min | 6,6% | igual |
| Run 1 até Mega, 10 cliques/s | 51,5 min | 46,9 min | 8,9% | igual |
| Árvore completa (10 Reboots) | 4,4 h | 4,1 h | 7,9% | igual |

- Run 1: 25 conquistas, mesmos ids e minutos da tabela do `conquistas-m5.md` (diferenças de 0,1 min); todas as bronze não secretas de execução e nenhuma diamond.
- Árvore: runs com conquistas 69,3, 29,0, 26,5, 23,8, 19,0, 16,1, 16,3, 16,4, 14,0, 13,0 min (iguais ao documento); 42 Cores de conquistas; 38 de 42 desbloqueadas; não saem `clicks_15000`, `spectre_10`, `q_reset` e `play_24h`, como previsto.
- Nenhuma conquista impossível (`qa-m5.test.ts`): alvos dentro do catálogo (5 agentes, 46 níveis com teto mais `alpha_core` sem teto para os 50 níveis, `alpha_singularity` até 2, estágios e equipamento existentes). As quatro que a simulação gulosa não alcança saem no motor: `clicks_15000` (15 mil cliques), `spectre_10` (contratar e evoluir ao nível 10), `q_reset` (comprar e reiniciar a árvore) e `play_24h` (24 h; `play_1h` antes). Nenhuma está marcada como futura no catálogo; 7, 30 e 365 dias ficam para o M8.
- Recompensa única (`qa-m5.test.ts`): após Reboot, refazer `stage_mega` e `agent_first` não repaga Bytes nem Cores; ida e volta do save mantém desbloqueios e Cores; save v2 desbloqueia na primeira atualização e não repaga o que já estava listado.
