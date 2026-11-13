# Agentes do M2 (T-023, BRF-022)

Valores provisórios, reequilibrados na T-062 (BRF-044; curva em `curva-m2.md`). Bônus = `quantidade × valor × (1 + crescimento × (nível − 1))` (D-10). Valor em pontos percentuais por agente. Custo da contratação: `custo base × fator^N` com fator 1,5 (ECHO_AI 2). Nível: `levelBaseCost × levelCostGrowth^(nível − 1)`, fator 2,5 (ECHO_AI 3). Teto de desconto 50 pp e de chance de crítico 25% (D-13).

| Agente | Especialidade | Ícone | Custo base | Custo do nível 1→2 | Efeito por agente | Crescimento/nível | Revela | Desbloqueia |
|---|---|---|---|---|---|---|---|---|
| ECHO_AI | Cliques manuais | mouse-pointer-click | 1.500 | 6.000 | clickPercent +3 | 0,25 | 3.000 Bytes na execução | Garage Company |
| KAI_VER_3 | Produção global | brain-circuit | 60.000 | 250.000 | globalProductionPercent +0,2 | 0,25 | Garage Company | Startup Lab |
| ATLAS_CORE | Redução de custos | badge-percent | 40.000.000 | 200.000.000 | costDiscountPercent +0,35 | 0,05 | Startup Lab | Data Center |
| NEO_GEN_5 | Operações de hardware | cpu | 30.000.000.000 | 150.000.000.000 | globalProductionPercent +0,5 | 0,25 | Data Center | Corporate Network |
| SPECTRE_X | Cliques críticos | dices | 20.000.000.000.000 | 250.000.000.000.000 | criticalChancePercent +0,5 | 0,1 | Corporate Network | Quantum Facility |

Antes da T-062: fatores 1,25 e 1,8; ECHO_AI +5 (crescimento 0,5); KAI +2 e NEO +5 (crescimento 0,5, antes da D-13); ATLAS +0,4 (crescimento 0,1); SPECTRE_X custo 5e13 e +0,3.

Cada estágio de Garage a Quantum Facility libera um agente. Mega Corporation fica sem agente novo. Na simulação do motor real (`curva-m2.md`): KAI aos 10 min, ECHO aos 16, ATLAS aos 18, NEO aos 30 e SPECTRE_X aos 46 min; no fim, 45 ECHO, 65 KAI, 51 ATLAS, 33 NEO e 19 SPECTRE.

## Suposições

- NEO_GEN_5 virou produção global com identidade própria (o tipo de efeito não tem categoria; 7.5). É a versão cara e forte de KAI_VER_3.
- Nenhum agente tem bônus secundário e nenhum afeta outros agentes (D-10).
- Desbloqueio por `stageReached` e revelação pelo estágio anterior (ECHO_AI usa Bytes porque Solo Hacker não tem estágio anterior útil).
- Custo base de cada agente fica na faixa do primeiro equipamento do estágio em que desbloqueia.

## Alertas de balanceamento

- Desconto: com os tetos da D-13 (50 pp) o ATLAS_CORE (0,35 pp, crescimento 0,05) e as melhorias (8 pp) chegam a 45 pp só no fim da run (22% ao abrir Quantum Facility). O teto vale para equipamentos e agentes.
- Chance de crítico: a base é 5% e o teto 25%; 19 SPECTRE_X de nível 7 somam 21%. O crítico só age sobre o clique, que é uma fração da renda; por isso o SPECTRE_X só entra quando os cliques escalam (melhorias `clickFlat`, ver `melhorias-m3.md`).
- Cliques: ECHO_AI e SPECTRE_X dependem das melhorias de clique escalarem com a renda (P-05); sem isso o clique é irrelevante a partir de 10 min.

## Sugestão para `docs/decisoes.md`

- Registrar como provisório: 5 agentes, fator de custo 1,5 (ECHO_AI 2), nível 2,5 (ECHO_AI 3), desbloqueio por estágio; tetos da D-13 (50 pp e 25%) já implementados. Texto para P-03 em `curva-m2.md`.
- Ícones novos exigem entrada em `src/ui/components/iconMap.ts` (AG04).
