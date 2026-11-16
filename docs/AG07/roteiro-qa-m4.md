# Roteiro de QA manual do M4 (aceleradores, bônus temporários e offline)

Pré-requisito: `npm run dev` (`.claude/launch.json`, config `dev`). Repetir em **1280x720** e **375x812**. Zerar: apagar o banco `byte-corp-idle`.

**Semear o save:** abrir uma página estática da mesma origem (`/manifest.webmanifest`), gravar em IndexedDB (`byte-corp-idle` / `kv` / chave `save`, valor JSON em texto) o envelope `{version: 2, savedAt, state: {run, meta, stats}}` (Decimais como string; `meta.accelerators = {active, inventory, granted, nextItemId}`, itens `{id, multiplier, remainingMs}`) e só depois navegar para `/`. Nunca recarregar a página do jogo para semear: a gravação em `pagehide` sobrescreve o save. Com a pane oculta o DOM só redesenha depois de uma captura de tela.

Produção de referência: 10 `home_router` = 5 B/s. Estágio abre Garage Company com 1e4 Bytes gerados na run.

## A. Receber

1. Run com 9985 B gerados, 2 roteadores; clicar até passar de 1e4. Esperado: estágio Garage Company; aviso "Acelerador recebido: 1 no inventário." por 5 s; botão Aceleradores habilitado com contador 1; nada ativa sozinho.
2. Reboot (estado com +2 cores, acelerador ativo). Esperado: acelerador ativo continua correndo; inventário ganha 1 item 2x/15 (chave `reboot:1` em `granted`); aviso de recebimento.
3. Reentrar no mesmo estágio depois do Reboot. Esperado: nenhuma concessão repetida (`granted` já tem a chave).

## B. Inventário e ativação

4. Abrir Aceleradores. Esperado: lista ordenada por multiplicador e tempo, cada item com "Nx", tempo e Ativar; sem ativo, dica "Ative um item..."; foco preso na janela.
5. Ativar um item sem ativo. Esperado: ativa na hora, item sai da lista, nota "Ativo agora: Nx, mm:ss restantes", produção multiplica.
6. Ativar outro com um ativo. Esperado: janela "Já há um acelerador ativo" com ATUAL x NOVO e a regra; Cancelar não altera nada.
7. Guardar o atual. Esperado: o novo vira ativo; o antigo volta ao inventário com o tempo restante.
8. Perder o atual. Esperado: o novo vira ativo; o antigo some.

## C. Indicador e fim

9. Acelerador ativo. Esperado: indicador no topo com "Nx", tempo restante e barra; produção do cabeçalho multiplicada.
10. Faltando 30 s. Esperado: indicador magenta e texto "Acelerador terminando" (só ícone/leitor em 375).
11. Expiração. Esperado: indicador some, mensagem "Acelerador encerrado" por 5 s, produção volta ao normal; o botão do núcleo não deve se mover (medir `getBoundingClientRect().top` com e sem indicador).
12. Acelerador ativo durante o Reboot. Esperado: mantém multiplicador e tempo (ver 2).

## D. Offline

13. Save de 3 h atrás com 2x/15 ativo, 10 roteadores. Esperado: resumo "Tempo ausente 3 h / contado 3 h / +58,5 kB" (15 min em dobro); acelerador expirado e fora do indicador.
14. Mesmo save cruzando um estágio. Esperado: resumo mostra o estágio alcançado (pendência `stageBefore`); concessão do estágio no inventário.
15. Save de 20 h atrás com 5x/60 ativo. Esperado: ausente 20 h, contado 8 h, +216 kB, aviso "Só as primeiras 8 h foram contadas."; itens do inventário intactos (não correm).
16. Continuar e recarregar logo em seguida. Esperado: sem novo resumo e Bytes iguais ao save (diferença só da produção do intervalo).
17. Volta à aba oculta (visibilitychange real, mais de 60 s). Esperado: resumo com a diferença; sem duplicar.
18. Reset do jogo (confirmação em dois passos). Esperado: save zerado, inventário vazio, botão Aceleradores desabilitado.

## E. Celular (375x812)

19. Passos 4 a 8, 13 e 18. Esperado: janelas de 351 px, sem rolagem horizontal, botões com 44 px ou mais; contador do inventário sobre o botão; indicador visível no topo.
