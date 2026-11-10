# Roteiro de QA manual do M1

Pré-requisito: `npm run dev` e abrir o endereço indicado. Repetir o roteiro em duas larguras (DevTools, modo responsivo): **1280 px** e **375 px**. Para zerar o jogo: DevTools > Application > IndexedDB > apagar o banco do jogo (ou aba anônima).

Convenção: cada passo tem **Ação** e **Esperado**.

## A. Carga inicial

1. Ação: abrir a página com banco limpo. Esperado: tela "Carregando…" breve, depois o jogo com 0 Bytes, produção 0/s, sem erro no console.
2. Ação: no 375 px, rolar a página. Esperado: sem rolagem horizontal; nada cortado; botão de clique, loja e abas visíveis/alcançáveis.

## B. Clique

3. Ação: clicar em "Processar dados" uma vez. Esperado: Bytes sobe em +1 (valor do "+N por clique").
4. Ação: clicar 20 vezes rápido. Esperado: Bytes aumenta a cada clique, sem travar; o total em Estatísticas > Cliques bate com o número de cliques.
5. Ação: clicar até ver um ganho maior que o normal. Esperado: cerca de 1 em 20 cliques rende 5x o valor (crítico); Bytes aumenta de acordo.

## C. Compra x1 / x10 / MAX

6. Ação: com 15+ Bytes, ver o card do roteador. Esperado: botão "Comprar 1" habilitado com o custo 15.
7. Ação: comprar x1. Esperado: Bytes cai pelo custo; quantidade possuída 1; produção/s sobe 0,5; custo da próxima unidade sobe (floor(15 x 1,15^1) = 17).
8. Ação: escolher x10 sem saldo suficiente para 10. Esperado: botão desabilitado; nada é comprado ao tocar.
9. Ação: juntar saldo e comprar x10. Esperado: 10 unidades de uma vez; Bytes cai pela soma exata dos 10 custos.
10. Ação: escolher MAX. Esperado: botão mostra a maior quantidade que cabe; após comprar, o saldo restante é menor que o custo de mais uma unidade e nunca fica negativo.
11. Ação: no 375 px, repetir 6 a 10 com toque. Esperado: seletor x1/x10/MAX e botão de compra com área de toque confortável (>= 44 px de altura).

## D. Abas e categorias

12. Ação: 1280 px: observar o layout. Esperado: loja, núcleo e agentes acessíveis conforme o layout desktop; rodapé com Reboot, Árvore Quantum e Conquistas.
13. Ação: 375 px: alternar as abas Loja, Agentes, Núcleo. Esperado: cada aba mostra só o seu conteúdo; aba ativa destacada; Agentes mostra "Os agentes chegam em breve."
14. Ação: no seletor "Categoria" da loja, percorrer as 5 categorias (rede, processamento, armazenamento, refrigeração, infraestrutura). Esperado: cada uma lista só seus itens, em ordem de custo crescente; categoria sem item disponível mostra "Nada disponível nesta categoria ainda."

## E. Requisito de item revelado

15. Ação: com poucos Bytes gerados na rodada (< 50), ver o Servidor Doméstico. Esperado: aparece mas bloqueado, com "Desbloqueio: gere 50 nesta rodada"; botão de compra desabilitado.
16. Ação: ver itens ainda ocultos (ex.: HD Externo antes de gerar 50). Esperado: não aparecem na lista (ou só como "próximo", conforme o design).
17. Ação: gerar 50 Bytes na rodada (os gastos não contam, só o total gerado). Esperado: o Servidor passa a ser comprável; o HD Externo aparece revelado com "gere 500 nesta rodada".
18. Ação: gastar Bytes comprando e conferir o item bloqueado. Esperado: o requisito continua atendido (conta o total gerado, não o saldo).

## F. Idioma

19. Ação: trocar o idioma em Idioma (Português <-> English). Esperado: todos os textos mudam na hora (títulos, loja, categorias, requisitos, nomes e descrições dos equipamentos), sem chaves cruas tipo `shop.title`; números continuam coerentes.
20. Ação: recarregar a página. Esperado: o idioma escolhido é mantido.

## G. Persistência

21. Ação: comprar um item, esperar ~1 s, recarregar (F5). Esperado: Bytes, quantidades e produção iguais ao antes (a diferença de Bytes pode ser só o ganho do tempo decorrido até o recarregamento).
22. Ação: clicar e deixar produzindo por >= 10 s sem comprar, recarregar. Esperado: o progresso volta com no máximo ~10 s de perda (autosave a cada 10 s).
23. Ação: comprar e recarregar imediatamente (< 300 ms). Esperado: aceitável perder a compra mais recente; registrar se perder mais que isso.

## H. Save corrompido

24. Ação: DevTools > Application > IndexedDB: editar o valor da chave `save` para `{ruim` e recarregar. Esperado: tela "Salvamento inválido" com o botão "Iniciar novo jogo"; o jogo não abre quebrado nem fica em branco.
25. Ação: clicar em "Iniciar novo jogo". Esperado: jogo novo com 0 Bytes; recarregar mantém o jogo novo (sem voltar à tela de erro).
26. Ação: repetir 24 com um save de versão futura (editar `"version"` para 99 num save válido). Esperado: mesma tela de salvamento inválido.
27. Ação: em 375 px, conferir a tela de salvamento inválido. Esperado: texto legível, botão alcançável, sem corte.

## I. Geral

28. Ação: deixar a aba em segundo plano por 1 min e voltar. Esperado: a produção continuou a contar (sem salto absurdo nem travamento); offline com limite só chega no M4.
29. Ação: olhar o console durante todo o roteiro. Esperado: nenhum erro nem aviso novo.
