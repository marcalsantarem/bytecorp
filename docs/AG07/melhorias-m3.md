# Melhorias comuns dos estágios finais (T-059, BRF-041)

Valores provisórios (reequilibrados na T-062: ver a nota abaixo; as colunas "Disponível em" e "Retorno" são da simulação antiga, a curva atual está em `curva-m2.md`). Estende `melhorias-m2.md`: as 12 melhorias antigas ficam intactas; entram 8 novas (20 no total), custo = 2x o desbloqueio, ordem crescente de custo e de desbloqueio. Retorno: `node tools/simular-melhorias.mjs` (guloso, 1 clique/s, sem melhorias, 35 equipamentos), mesma metodologia do M2.

| Melhoria | Tipo | Efeito | Ícone | Custo | Desbloqueia (Bytes na run) | Disponível em | Retorno |
|---|---|---|---|---|---|---|---|
| photonic_bus | globalProductionPercent | +30 | cable | 4e13 | 2e13 | 45 min | 14 min |
| quantum_gloves | clickFlat | +3e10 | mouse-pointer-click | 3,5e13 | 1,75e13 | 36 min | cerca de 2 min (motor real) |
| facility_contract | costDiscountPercent | +1,5 | handshake | 1e15 | 5e14 | 57 min | 18 h |
| entangled_cache | globalProductionPercent | +35 | database-zap | 5e15 | 2,5e15 | 89 min | 5,4 h |
| neural_overdrive | clickFlat | +6e12 | brain-circuit | 1e16 | 5e15 | 54 min | cerca de 40 s (motor real) |
| orbital_orchestrator | globalProductionPercent | +45 | workflow | 4e16 | 2e16 | 64 min | cerca de 4 min (motor real) |
| megacorp_charter | costDiscountPercent | +2 | landmark | 5e17 | 2,5e17 | 99 min | 6,5 h |
| singularity_core | globalProductionPercent | +60 | crown | 3e18 | 1,5e18 | 113 min | 100 min |

Ícones novos no `iconMap`: `cable`, `handshake`, `workflow`, `landmark`, `crown`. Os demais já estavam mapeados.

## Totais e desconto (para A-06)

- Produção global (T-062): +245 pontos percentuais no total (antes +405): 5, 10, 15, 20, 25, 30, 35, 45 e 60.
- Clique (T-062): `quantum_gloves` e `neural_overdrive` viraram `clickFlat` grandes (3e10 e 6e12) e `haptic_gloves` +300.000, para o clique seguir relevante com a renda (fatia exata não medida); só `ergonomic_keys` segue em percentual.
- Desconto das melhorias: 4,5 + 3,5 = **8,0 pp** (limite do briefing).
- Desconto máximo acumulado: as melhorias dão 8,0 pp fixos. O ATLAS_CORE é aditivo e sem teto (0,4 pp por agente, +0,1 por nível; 40 agentes no nível 20 somam 46,4 pp, ver `agentes-m2.md`), então o máximo acumulado em jogo realista é cerca de 54 pp (8 + 46,4), antes da árvore Quantum. Acima de 100% o custo cai ao mínimo de 1 Byte: o teto (A-06) precisa vir dos agentes e da árvore, não das melhorias.

## Pontos de atenção

- Cliques: resolvido na T-062 com `clickFlat` que escala com a renda (ver acima); a consequência é que um jogador que clica mais de 1 vez por segundo ganha proporcionalmente mais (suposição a validar na UI).
- Descontos têm retorno de horas, como no M2, pois o ganho medido é só a taxa que deixa de ser gasta.
- `entangled_cache` (5,4 h) e `singularity_core` (100 min) retornam devagar porque o bônus é aditivo sobre uma base já grande (+145 e +405 acumulados) e o custo é 2x o desbloqueio. Se ficar lento no jogo real, subir os valores (+100 e +150) em vez de baixar o custo.
- A simulação ignora agentes e Quantum; o tempo "disponível em" depende do ritmo dos 35 equipamentos e deve ser revalidado na T-026.
- Compra única por execução; o Reboot as devolve.

## Sugestão de texto para P-05 em `docs/decisoes.md`

> Texto atualizado para P-05 em `curva-m2.md` (T-062).
