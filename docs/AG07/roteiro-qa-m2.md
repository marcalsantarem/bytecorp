# Roteiro de QA manual do M2

Pré-requisito: `npm run dev`. Repetir em **1280 px** e **375 px** (DevTools, modo responsivo). Para jogar rápido sem esperar, no console do navegador não há atalho oficial: use o save (IndexedDB `byte-corp-idle` / `kv` / `save`, editar `run.bytes` e `run.bytesEarned` como strings numéricas) e recarregue. Zerar: apagar o banco ou usar o botão Reset.

Cada passo: **Ação** e **Esperado**.

## A. Agentes

1. Ação: jogo novo, aba Agentes (375) ou painel de agentes (1280). Esperado: "Nenhum agente disponível ainda." e Estatísticas no lugar.
2. Ação: gerar 3.000 Bytes na execução. Esperado: ECHO_AI aparece revelado (nome, especialidade, requisito), sem botão de contratar ativo.
3. Ação: gerar 10.000 Bytes (Garage Company). Esperado: ECHO_AI desbloqueado com "Contratar" e custo 1.500; habilitado só com saldo.
4. Ação: contratar com saldo. Esperado: Bytes cai 1.500; contratados 1; nível 1; bônus "+5% de clique" visível; custo seguinte 1.875 (1,25x).
5. Ação: Evoluir. Esperado: Bytes cai 6.000; nível 2; bônus 5 x 1,5 = 7,5%; barra de progresso do nível reflete saldo/custo; Evoluir desabilitado sem saldo.
6. Ação: conferir o clique. Esperado: valor por clique sobe pelo bônus de clique.
7. Ação: chegar a Startup Lab e Data Center. Esperado: KAI_VER_3 e ATLAS_CORE liberam em ordem; lista ordenada pelo custo de contratação crescente; bônus global do KAI aumenta B/s; desconto do ATLAS reduz custos mostrados na loja e em agentes (não em melhorias).
8. Ação: 375 px, botões Contratar e Evoluir. Esperado: toque confortável, sem corte nem rolagem horizontal.

## B. Melhorias

9. Ação: Loja > Melhorias, jogo novo. Esperado: lista por custo crescente, todas bloqueadas com o requisito ("gere N Bytes").
10. Ação: gerar 25 Bytes. Esperado: Script de macro disponível (50 B); as demais bloqueadas; saldo sozinho não desbloqueia.
11. Ação: comprar com 50+ Bytes. Esperado: custo debitado sem desconto; estado "comprada" e botão inativo; clique +1; não dá para comprar de novo.
12. Ação: com saldo insuficiente, tocar em disponível. Esperado: nada acontece.
13. Ação: comprar Overclock básico com produção. Esperado: B/s sobe 5%.

## C. Indicador de estágio

14. Ação: olhar o indicador no núcleo. Esperado: estágio atual e "Próximo: nome (requisito)"; em Mega Corporation, sem próximo.
15. Ação: cruzar 10.000 Bytes gerados. Esperado: indicador muda para Garage Company, sem recarregar, e desbloqueios por estágio aparecem junto.

## D. Abas de categoria e ponto de novidade

16. Ação: loja de equipamentos. Esperado: 5 abas (rede, processamento, armazenamento, refrigeração, infraestrutura) em ambas as larguras (375: todas juntas, sem rolagem horizontal); rótulos traduzidos.
17. Ação: ficar numa aba enquanto um equipamento de outra categoria é desbloqueado. Esperado: a outra aba mostra o ponto de "novo equipamento disponível" (rótulo acessível) só se houver equipamento novo comprável; some ao abrir a aba ou comprar.

## E. Reset

18. Ação: tocar em Reset. Esperado: pede confirmação ("Confirmar reset"), sem apagar ainda; tocar fora ou esperar cancela, se o botão voltar ao normal.
19. Ação: confirmar. Esperado: jogo volta a 0 Bytes, sem agentes nem melhorias, estágio Solo Hacker; o idioma é mantido; F5 mantém o jogo zerado.

## F. Cena do núcleo em tela baixa

20. Ação: 1280 x 500 e 375 x 600 (altura baixa). Esperado: núcleo e botão de clique visíveis juntos, sem sobreposição nem corte, sem rolagem horizontal.

## G. PWA

21. Ação: DevTools > Application > Manifest (build com `npm run build && npm run preview`). Esperado: nome "Byte Corp Idle", display standalone, cores #050811, ícones 192, 512 e maskable 512 sem erro.
22. Ação: Application > Service Workers e "Installability". Esperado: service worker registrado e app instalável; jogo abre offline depois da primeira visita.

## H. Persistência

23. Ação: contratar, evoluir e comprar melhoria; F5 em seguida (após ~1 s). Esperado: agentes, nível, melhorias e estágio idênticos; Bytes iguais ao instante da última gravação.
24. Ação: alternar idioma pt-BR e English em todas as telas acima. Esperado: sem chaves cruas nem texto fixo.
