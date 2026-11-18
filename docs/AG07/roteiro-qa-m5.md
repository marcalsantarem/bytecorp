# Roteiro de QA do M5 (BRF-094 / T-090)

Navegador embutido, `npm run dev` (5173), em 1280x720 e 375x812. Estados de teste semeados no IndexedDB (`byte-corp-idle` / `kv` / `save` e `settings`) a partir de `/manifest.webmanifest` e só depois abrindo `/` (a página do jogo grava em `pagehide` e sobrescreveria o save). O save e as configurações existentes são copiados antes e restaurados no fim, fora da página do jogo. Resultado em `resultado-qa-m5.md`.

## Tela inicial

1. Primeiro acesso (banco vazio): tela inicial com logo, sem Continuar; Novo jogo é o primário e entra direto, sem confirmação.
2. Com save: Continuar aparece com foco e entra no jogo com o progresso; Novo jogo pede confirmação, Cancelar não apaga, Confirmar apaga o progresso e mantém as configurações.
3. Créditos abre e fecha (botão e Esc).
4. Fundo animado presente; com `prefers-reduced-motion: reduce` a animação para ou fica estática.

## Configurações

5. Idioma: trocar para en muda toda a tela (jogo, janelas, tela inicial) e sobrevive à recarga; voltar a pt-BR.
6. Volumes, qualidade gráfica e notificações: valores alterados ficam salvos em `settings` e voltam após recarregar.
7. Reset em dois passos: o primeiro clique vira confirmação e expira; o segundo zera o save e mantém as configurações.
8. Velocidade do jogo: reservada (desabilitada ou fixa em 1x, D-19); não altera a produção.

## Conquistas

9. Desbloqueio mostra notificação com nome e recompensa; várias de uma vez entram em fila, uma por vez.
10. Janela de conquistas: categorias, raridades, progresso das bloqueadas, data das desbloqueadas.
11. Secretas bloqueadas mostram só a pista, sem nome, progresso nem recompensa.
12. Recompensa entregue uma vez: recarregar e passar de novo pelo requisito (ou Reboot) não repaga.

## Estatísticas

13. Janela de estatísticas: valores batem com o save (cliques, críticos, Bytes gerados, tempo de jogo, Reboots, conquistas).

## Tutorial

14. Jogo novo: o primeiro passo destaca o botão de clique; os passos avançam na ordem (clique, equipamento, produção, agente, melhorias, conquistas, Reboot, árvore).
15. Dispensar um passo avança para o próximo; pular o tutorial esconde os restantes e persiste após recarregar.

## Notificações locais

16. Ativar pede permissão; negada, informa e fica desligado.
17. Aba oculta: notificação de conquista e de acelerador encerrado; limite de agrupamento (3 s), mínimo global (2 min) e por categoria (10 min).

## Save

18. Save v2 do M4 semeado: carrega sem erro, migra para v3, conquistas já atingidas desbloqueiam uma vez, tutorial com valores iniciais.
19. Save v3 corrompido: informa e oferece novo jogo.

## Celular

20. Em 375: tela inicial, Configurações, Conquistas, Estatísticas e dica do tutorial sem rolagem horizontal e com alvos de 44 px.
