# Resultado do QA manual do M1 (BRF-015 / T-048)

Execução: navegador embutido, `npm run dev` (porta 5173), 1280 px e 375 px. Estado limpo apagando o banco `byte-corp-idle`. Confirmação por IndexedDB (`kv`/`save`) e `get_page_text`/DOM, pois a tela só redesenha quando há captura de tela (rAF pausado na pane oculta: o DOM pode ficar ~1 s a minutos atrás do estado real).

Legenda: P = passou, F = falhou, N = não executável (motivo).

| # | 1280 px | 375 px | Evidência |
|---|---|---|---|
| 1 | P (parcial) | P (parcial) | Banco limpo: 0 B, 0 B/s, sem erro. "Carregando…" breve não observado (rápido demais). |
| 2 | N/A | P | scrollWidth = 375; nenhum elemento passa da borda; botão de clique, abas e rodapé visíveis. |
| 3 | P | P | 0 -> 1 B; save confirma. |
| 4 | P | P | 321 cliques = Cliques 321 nas Estatísticas (display atrasa até a captura de tela). |
| 5 | P | P | 321 cliques, 11 críticos (1280) e 21 (375): bytes = cliques + 4 x críticos (365 e 405). Taxa 3,4% e 6,5%, compatível com 5%. |
| 6 | P | P | "Comprar 1 / 15 B" habilitado. |
| 7 | P | P | Bytes -15, qtd 1, produção 0,5 B/s, próximo custo 17 (confere floor(15x1,15^n)). |
| 8 | P | P | Malha Wi-Fi x10 (12,17 kB) desabilitado; qtd não mudou ao clicar. |
| 9 | P | P | x10 custo 344 = soma exata floor(15x1,15^k), k=1..10; qtd 1 -> 11. |
| 10 | P | P | MAX mostrou "5 / 469 B" e "7 / 770 B"; compra deixou saldo (109 e 146) menor que o próximo custo (140 / 185) e positivo. |
| 11 | n/a | F | Toque em 375 funciona, mas seletor x1/x10/MAX tem 24 px de altura (30-38 px de largura) e "Comprar" 26 px; esperado >= 44 px. Ver D2. |
| 12 | P | n/a | 3 colunas: Estatísticas+Agentes, núcleo, loja; rodapé Reboot / Árvore Quantum / Conquistas. |
| 13 | n/a | P | Abas Loja/Agentes/Núcleo mostram só o seu conteúdo; ativa com `aria-current` e destaque; Agentes mostra Estatísticas + "Os agentes chegam em breve." |
| 14 | P | P | 5 categorias; vazias mostram "Nada disponível nesta categoria ainda."; ordem crescente (Roteador 15 < Malha 600; Servidor 100 < Rig). Ver D1 (rótulos em inglês no pt-BR). |
| 15 | P (nota) | P (nota) | Servidor caseiro com "Desbloqueio: gere 50 B nesta rodada". Não há botão de compra desabilitado: o card mostra só o requisito (ver D3, baixa). |
| 16 | P | P | Comportamento M1: HD externo e Malha Wi-Fi não aparecem como cards; só o item "próximo" bloqueado aparece (Rig de GPUs, Ventilador, Malha, HD). Itens além do próximo ficam ocultos. |
| 17 | P | P | Com 72 gerados: Servidor comprável (100 B, desabilitado só por saldo) e HD externo revelado com "gere 500 B". |
| 18 | P | P | Após gastar (saldo 23-41 B, total gerado 72-82) o Servidor continua revelado, sem texto de bloqueio. |
| 19 | P | P | pt-BR <-> English: títulos, loja, requisitos, nomes, descrições, rodapé e abas trocam; sem chaves cruas; números com vírgula/ponto. Exceção: D1. |
| 20 | P | P | Idioma `en` mantido após recarregar. |
| 21 | P | P | Compra salva em ~0,7 s; após F5 equipamento e Bytes idênticos. |
| 22 | P | P | Recarga restaura o último autosave: perda de 5,6 s (1280) e 8,3 s (375) de produção (<= 10 s). |
| 23 | P | P | Compra feita ~60 ms antes do reload foi perdida (botão estava habilitado); nenhuma outra perda. Aceitável. |
| 24 | P | P | `{ruim` -> "Salvamento inválido" + "Iniciar novo jogo". |
| 25 | P | P | Novo jogo 0 B; F5 mantém jogo novo. |
| 26 | P | P | `version: 99` -> mesma tela. |
| 27 | N/A | P | Texto legível, sem corte, scrollWidth 375; botão 177x38 px alcançável (abaixo de 44 px, ver D2). |
| 28 | P (limitado) | P (limitado) | Não foi possível deixar a aba realmente em segundo plano (`visibilityState` permaneceu `visible`; abrir outra aba da pane não a oculta). Com a pane oculta por ~100 s: +50,0 B com 0,5 B/s (esperado 50,0), sem salto nem erro. |
| 29 | P | P | Hooks de `console.error/warn` e `onerror` registraram 0 ocorrências. Erros antigos de HMR do Vite (ERR_CONNECTION_REFUSED/RESET em index.css) vieram de reinícios do servidor antes desta sessão. |

## Defeitos

- **D1 (baixa/média). Rótulos de categoria da loja não traduzidos em pt-BR.** Abas e seletor mostram "Networking, Processing, Storage, Cooling, Infrastructure" em inglês com o idioma Português. Reproduzir: abrir o jogo em pt-BR (1280 px ver abas; 375 px ver seletor "Categoria"). O roteiro espera rede, processamento, armazenamento, refrigeração, infraestrutura.
- **D2 (média). Alvos de toque pequenos em 375 px.** Reproduzir: 375 px, aba Loja: x1/x10/MAX com 24 px de altura, "Comprar" com 26 px; botão "Iniciar novo jogo" com 38 px; botões do rodapé com 30 px. Critério do passo 11: >= 44 px.
- **D3 (baixa). Item bloqueado sem botão desabilitado.** Passo 15 pede botão desabilitado; o card só mostra "Desbloqueio: gere N B nesta rodada". Decidir se é intencional.
- **D4 (baixa, visual). Truncamentos em 375 px.** Valor de Bytes no cabeçalho cortado com reticências (ex. "242,01…", "81,35…"), seletor de idioma mostra "Portu"/"Engli", rodapé "Rebo…", "Árvore Quant…". Reproduzir: 375 px com algumas centenas de Bytes.
- **D5 (baixa, acessibilidade). Seletor de idioma sem `aria-label`.** `header select` não tem rótulo acessível.
- Observação (não é defeito do jogo): com a pane oculta o DOM não atualiza até haver captura de tela; o estado salvo está correto.

Nenhum defeito de lógica (compra, requisitos, persistência, save inválido) encontrado.
