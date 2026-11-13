# Melhorias comuns dos estágios finais (T-059, BRF-041)

Valores provisórios. Estende `melhorias-m2.md`: as 12 melhorias antigas ficam intactas; entram 8 novas (20 no total), custo = 2x o desbloqueio, ordem crescente de custo e de desbloqueio. Retorno: `node tools/simular-melhorias.mjs` (guloso, 1 clique/s, sem melhorias, 35 equipamentos), mesma metodologia do M2.

| Melhoria | Tipo | Efeito | Ícone | Custo | Desbloqueia (Bytes na run) | Disponível em | Retorno |
|---|---|---|---|---|---|---|---|
| photonic_bus | globalProductionPercent | +50 | cable | 4e13 | 2e13 | 45 min | 14 min |
| quantum_gloves | clickPercent | +200 | mouse-pointer-click | 2e14 | 1e14 | 49 min | irrelevante |
| facility_contract | costDiscountPercent | +1,5 | handshake | 1e15 | 5e14 | 57 min | 18 h |
| entangled_cache | globalProductionPercent | +60 | database-zap | 5e15 | 2,5e15 | 89 min | 5,4 h |
| neural_overdrive | clickFlat | +100.000 | brain-circuit | 2e16 | 1e16 | 92 min | irrelevante |
| orbital_orchestrator | globalProductionPercent | +80 | workflow | 1e17 | 5e16 | 95 min | 15 min |
| megacorp_charter | costDiscountPercent | +2 | landmark | 5e17 | 2,5e17 | 99 min | 6,5 h |
| singularity_core | globalProductionPercent | +120 | crown | 3e18 | 1,5e18 | 113 min | 100 min |

Ícones novos no `iconMap`: `cable`, `handshake`, `workflow`, `landmark`, `crown`. Os demais já estavam mapeados.

## Totais e desconto (para A-06)

- Produção global: +95 (antigas) + 310 = +405 pontos percentuais.
- Desconto das melhorias: 4,5 + 3,5 = **8,0 pp** (limite do briefing).
- Desconto máximo acumulado: as melhorias dão 8,0 pp fixos. O ATLAS_CORE é aditivo e sem teto (0,4 pp por agente, +0,1 por nível; 40 agentes no nível 20 somam 46,4 pp, ver `agentes-m2.md`), então o máximo acumulado em jogo realista é cerca de 54 pp (8 + 46,4), antes da árvore Quantum. Acima de 100% o custo cai ao mínimo de 1 Byte: o teto (A-06) precisa vir dos agentes e da árvore, não das melhorias.

## Pontos de atenção

- Cliques: `quantum_gloves` e `neural_overdrive` são irrelevantes diante da produção (milhões de B/s); servem só para completar o tipo e o catálogo. O retorno da simulação (1 clique/s) é absurdo de propósito. Se P-05 for tratada (escalar `clickFlat`), reavaliar.
- Descontos têm retorno de horas, como no M2, pois o ganho medido é só a taxa que deixa de ser gasta.
- `entangled_cache` (5,4 h) e `singularity_core` (100 min) retornam devagar porque o bônus é aditivo sobre uma base já grande (+145 e +405 acumulados) e o custo é 2x o desbloqueio. Se ficar lento no jogo real, subir os valores (+100 e +150) em vez de baixar o custo.
- A simulação ignora agentes e Quantum; o tempo "disponível em" depende do ritmo dos 35 equipamentos e deve ser revalidado na T-026.
- Compra única por execução; o Reboot as devolve.

## Sugestão de texto para P-05 em `docs/decisoes.md`

> P-05 (provisório): 20 melhorias comuns (4 tipos de efeito dentro das 3 categorias), custo = 2x o desbloqueio, de 50 a 3e18 Bytes. Produção global +405 pp, desconto das melhorias 8 pp (cerca de 54 pp com 40 ATLAS_CORE no nível 20, sem a árvore Quantum). Os dois itens de clique dos estágios finais são marginais diante da produção; decidir se `clickFlat` deve escalar. A-06 (teto de desconto) segue aberta.
