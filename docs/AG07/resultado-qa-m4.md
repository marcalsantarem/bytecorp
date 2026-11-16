# Resultado do QA do M4 (BRF-075 / T-074)

Execução: navegador embutido, `npm run dev` (5173), v0.5.0, 1280x720 e 375x812. Saves semeados no IndexedDB (SAVE_VERSION 2) por `/manifest.webmanifest` e só depois navegando para `/`; banco apagado ao fim, janela restaurada, servidor encerrado. Roteiro: `roteiro-qa-m4.md`. Simulação: `tests/tempo-m4.test.ts` (relatório com `TEMPO_REPORT=1`, cerca de 18 min; sem a variável, cerca de 45 s).

Legenda: P = passou, F = falhou, P* = passou com observação, N = não executado (motivo).

## 1. Roteiro manual

| # | 1280 | 375 | Evidência |
|---|---|---|---|
| 1 | P* | N | Passar de 1e4 B: estágio Garage Company, aviso "Acelerador recebido: 1 no inventário.", contador 1, nada ativou. O aviso (top-28) cobre o painel de estágio por 5 s (D4). |
| 2 | P | N | Reboot +2 com 2x ativo: save com `active` 2x (9:54 restantes, correndo), inventário com 2x/15 e `granted` com `reboot:1`; aviso de recebimento. |
| 3 | P | N | Reentrada no estágio já concedido não repete (`granted` guarda a chave; coberto também na simulação, run 2 em diante). |
| 4 | P | P | Lista "5x 30:00" antes de "2x 15:00" (maior multiplicador primeiro); diálogo 351 px em 375. |
| 5 | P | P | Ativar sem ativo: item sai da lista, indicador "2x 14:58", produção dobra (2 B/s com 5 roteadores; 25 B/s com 5x em 375). |
| 6 | P | P | Com ativo: janela ATUAL x NOVO e regra; Cancelar não altera nada. |
| 7 | P | N | Guardar: o novo ativa e o antigo volta com 14:55 (tempo preservado). |
| 8 | P | N | Perder: o novo ativa, o antigo some, inventário vazio. |
| 9 | P | P | Indicador "Nx", tempo e barra no topo. |
| 10 | P | N | Aos 30 s: indicador magenta, "Acelerador terminando" (texto no sm+; em 375 só leitor de tela, não conferido). |
| 11 | P* | N | Expiração: indicador some, "Acelerador encerrado" por 5 s, produção volta. O botão do núcleo desce 25 px com o indicador (539 sem, 564 com): a pendência do backlog (15 px) continua (D1). |
| 12 | P | N | Reboot com ativo mantém multiplicador e tempo (ver 2). |
| 13 | P | P | 3 h atrás, 2x/15: "ausente 3 h, contado 3 h, +58,5 kB" (esperado 5 B/s x (900x2 + 9900) = 58.500). Acelerador expirou; save gravado na hora. |
| 14 | F | F | Mesmo save cruzando Garage Company: o resumo não mostra o estágio alcançado (D2, `stageBefore` não implementado). A concessão do estágio entrou no inventário (2 itens) sem menção no resumo. |
| 15 | P | N | 20 h atrás, 5x/60: "ausente 20 h, contado 8 h, +216 kB" (esperado 5 x (3600x5 + 25200) = 216.000) e "Só as primeiras 8 h foram contadas." |
| 16 | P | N | Continuar e recarregar: sem resumo; Bytes 68.490 -> 68.541 (só 10 s de produção); inventário igual. |
| 17 | N | N | Volta à aba oculta com `visibilitychange` real: não reproduzível. A aba do navegador embutido continua `visible` mesmo com outra aba em primeiro plano e não há como ocultar a pane pelas ferramentas; o `Date.now` do `boot` é capturado, então sobrescrevê-lo não simula. Coberto só por `offlineSession.test.ts`. |
| 18 | P | P | Reset em dois passos (o primeiro vira "Confirmar reset" e expira): save zerado, `accelerators` vazio, botão Aceleradores desabilitado. |
| 19 | N | P | Em 375: janelas de 351 px, `scrollWidth` 375 (sem rolagem horizontal), botões de 44 px ou mais, contador sobre o botão. Passos 1 a 3, 7 a 12 e 15 a 17 não repetidos no celular (mesmo código). |

## 2. Pendências do backlog do M4

| Pendência | Resultado |
|---|---|
| Indicador sobe ao acabar | Persiste: 25 px em 1280x720 (539 -> 564 com o indicador), não 15. |
| Nome do catálogo no inventário | Persiste: só "Nx" e tempo ("5x 30:00"); o item não guarda o id do catálogo. |
| `stageBefore` do resumo | Não implementado (passo 14). |
| Aviso de encerramento visto | Visto em 1280 (magenta e texto, 00:28). Em 375 e com reduced-motion: não conferido. |
| Volta à aba oculta | Não reproduzível (passo 17). |
| Gravação em `pagehide` sobrescreve save semeado | Confirmado e contornado com a página estática. |

## 3. Defeitos

| # | Gravidade | Defeito | Como reproduzir |
|---|---|---|---|
| D1 | Baixa | O conteúdo central desloca 25 px (não 15) quando o indicador aparece ou some; o clique no botão do núcleo pode errar o alvo. | Ativar um acelerador em 1280x720 e comparar o topo do botão "Processar dados" (539 sem, 564 com). Reservar a altura do `accelerator-area`. (AG04) |
| D2 | Média | O resumo de retorno não mostra o estágio alcançado nem as concessões recebidas na ausência. | Save de 3 h atrás com 9.990 B gerados e 10 roteadores. (AG03 e AG04) |
| D3 | Baixa | Inventário sem nome do item. | Abrir Aceleradores. (AG01, AG04) |
| D4 | Baixa | O aviso "Acelerador recebido" (top-28) cobre o painel de estágio por 5 s em 1280x720. | Mudar de estágio. (AG04) |
| D5 | Informativa | Quem fica ausente mais de 8 h com acelerador ativo gasta o tempo do acelerador pela ausência inteira (20 h), mas só 8 h são creditadas; com durações de até 60 min não tem efeito prático. | Teste "acelerador ativo com ausência de 20 h". |

## 4. Simulação com o motor real

Política do jogador: 1 clique por segundo, comprador guloso do `curva-m2`, 1 acelerador por vez, nunca substitui. "Ao receber": ativa só no instante da concessão e só se não houver ativo (o que chega com outro ativo fica guardado e não é usado). "Encadeando": a cada segundo, se não há ativo, ativa o primeiro do inventário (inclusive o que sobrou de runs anteriores).

### Run 1 até Mega Corporation

| Política | Mega | Ganho | Estágios (Garage, Startup, Data Center, Corporate, Quantum, Mega) |
|---|---|---|---|
| Sem aceleradores | 74,3 min | - | 3,8 / 7,2 / 13,6 / 23,2 / 37,7 / 74,2 |
| Ao receber | 44,6 min | -39,9% | 3,8 / 5,5 / 8,8 / 13,6 / 22,9 / 44,6 |
| Encadeando | 39,2 min | -47,2% | 3,8 / 5,5 / 8,8 / 13,6 / 20,9 / 39,2 |

Sem aceleradores a curva não mudou: Mega em 74,3 min (`curva-m2` e `prestigio-m3` passam).

### Ganho isolado de cada concessão (run 1, só aquela ativada)

| Concessão | Mega | Ganho | Economia "máxima" da conta de `aceleradores-m4.md` |
|---|---|---|---|
| Garage Company 2x/15 | 59,5 min | 14,7 min (19,8%) | 7,5 min |
| Startup Lab 2x/15 | 59,5 min | 14,8 min (19,9%) | 7,5 min |
| Data Center 2x/30 | 44,5 min | 29,8 min (40,1%) | 15 min |
| Corporate Network 5x/15 | 33,5 min | 40,7 min (54,8%) | 12 min |
| Quantum Facility 5x/15 | 45,1 min | 29,2 min (39,3%) | 12 min |
| Mega Corporation 5x/30 | 74,3 min | 0 (concedido no fim da run) | 24 min na run 2 |

O ganho real é de 2 a 3 vezes a economia "máxima" da conta de `aceleradores-m4.md`: a conta trata a produção como linear, mas a economia reinveste (o jogador compra mais cedo e a taxa fica maior para sempre). Quanto mais cedo o acelerador, mais compõe; o 5x de Corporate Network sozinho tira 55% da run 1.

### Árvore completa (política do `prestigio-m3`: Reboot ao abrir Mega, nó mais barato primeiro)

| Política | Reboots | Tempo total | Ganho | Runs (min) |
|---|---|---|---|---|
| Sem aceleradores | 10 | 4,4 h | - | 74,3; 36,1; 29,0; 26,0; 19,2; 17,7; 17,7; 16,4; 14,0; 13,8 |
| Ao receber | 10 | 114,0 min | -56,8% | 44,4; 18,2; 17,4; 5,4; 4,0; 3,8; 11,4; 3,5; 3,0; 3,0 |
| Encadeando | 10 | 93,5 min | -64,6% | 39,1; 18,2; 9,8; 5,4; 4,0; 3,8; 3,8; 3,5; 3,0; 3,0 |

Resultado: **o teto estimado de cerca de 45% está errado para cima**: a árvore completa cai de 4,4 h para 1,6 h (-65% encadeando, -57% ao receber). Das 270 min concedidas só 90 min são usadas (5 itens); as runs 5 a 10 duram 3 a 4 min e um único 5x/15 cobre 3 a 4 runs seguidas. As concessões de Reboot (150 min) quase não pesam: sem elas o resultado é idêntico (93,5 min); o que pesa são os 5x de estágio, que viram janelas de 5x sobre as runs curtas.

### Alavancas (encadeando, árvore completa)

| Tabela de concessões | Total | Ganho | Observação |
|---|---|---|---|
| Atual | 93,5 min | -64,6% | 11 itens sobram |
| Sem concessão de Reboot | 93,5 min | -64,6% | igual: a concessão de Reboot não é o gargalo |
| 5x só em Mega; demais 2x (15/15/30/15/15), sem Reboot | 111,2 min | -57,9% | |
| Todos 2x (15/15/30/15/15/30), sem Reboot | 2,4 h | -44,6% | dentro de ~45% |

A alavanca "Reboot a cada 2" não reduz nada (sem Reboot já dá o mesmo) e a de baixar o Data Center para 2x/15 não é uma redução confiável: na simulação encurta a run 2 (13,1 contra 18,2 min) por mudar a ordem de encadeamento, e a árvore sai em 84,7 min. Proposta com números: ver "Propostas".

## 5. Offline com o motor real

Todos passam (`tests/tempo-m4.test.ts`, produção constante contra `advance`, tolerância 1e-9 relativa):

| Caso | Resultado |
|---|---|
| 1 h sem acelerador | offline = `advance(1 h)` |
| 8 h e 20 h sem acelerador | 8 h iguais a `advance`; 20 h creditam 8 h e cortam 12 h |
| 2x/15 ativo, ausência de 1 h | 15 min em dobro + 45 min normais; ativo some |
| 5x com 5 min restantes, ausência de 1 h | 5 min em 5x + 55 em 1x = `advance` |
| 5x/60 ativo, ausência de 10 h | credita 8 h (60 min em 5x), corta 2 h; ativo expira |
| 2x/15 e ausência de 5 min | sobram 10 min; item do inventário (30 min) não corre |
| Ausência de 20 h com 2x/60 | expira; multiplicador volta a 1 |
| Acelerador 2x/30 + bônus 3x/10 min, 1 h | 10 min em 6x, 20 em 2x, 30 em 1x |
| Ausência de 59 s | nada creditado, temporizadores intactos |
| Boot com save de 3 h atrás e 2x/15; segundo boot 5 s depois | primeiro credita 3 h (15 min em dobro); o segundo não credita e os Bytes ficam iguais |

## 6. Propostas de ajuste (opções ao AG00)

1. **Manter e aceitar -57% a -65%** (4,4 h para 1,6 h): rápido demais para o plano; a árvore deixa de ser a meta de várias sessões. Não recomendado.
2. **Trocar os 5x de estágio por 2x e tirar a concessão de Reboot** (Garage 2x/15, Startup 2x/15, Data Center 2x/30, Corporate 2x/15, Quantum 2x/15, Mega 2x/30): árvore em 2,4 h (-44,6%), run 1 mais curta que hoje apenas pelo 2x. **Recomendada**, pois cumpre a estimativa de 45% e mantém o 5x livre para eventos, conquistas e anúncio (M5, M6, M9). A concessão de Reboot sairia da D-16, mas não faz diferença medida; a outra opção é manter 2x/15 e medir de novo (provavelmente 40% a 50%).
3. **5x só em Mega** (demais 2x): -57,9% (111 min); ainda alto.

A medir se escolher a 2: run 1 com uso típico (item por estágio) e o ganho da concessão de Reboot mantida.

## 7. Suposições e limites

- O jogador clica 1 vez por segundo e usa o `curva-m2`; jogadores que não encadeiam ficam entre "ao receber" e sem aceleradores.
- A política "encadeando" usa o item mais antigo primeiro, sem otimizar (usar o 5x mais cedo ou mais tarde pode mudar o resultado em alguns pontos percentuais).
- Volta à aba oculta e reduced-motion não verificados.
