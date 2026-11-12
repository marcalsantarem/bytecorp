# Agentes do M2 (T-023, BRF-022)

Valores provisórios. Bônus = `quantidade × valor × (1 + crescimento × (nível − 1))` (D-10). Valor em pontos percentuais por agente. Fator de custo 1,25 em todos. Nível: `levelBaseCost × levelCostGrowth^(nível − 1)`, fator 1,8.

| Agente | Especialidade | Ícone | Custo base | Custo do nível 1→2 | Efeito por agente | Crescimento/nível | Revela | Desbloqueia |
|---|---|---|---|---|---|---|---|---|
| ECHO_AI | Cliques manuais | mouse-pointer-click | 1.500 | 6.000 | clickPercent +5 | 0,5 | 3.000 Bytes na execução | Garage Company |
| KAI_VER_3 | Produção global | brain-circuit | 60.000 | 250.000 | globalProductionPercent +2 | 0,5 | Garage Company | Startup Lab |
| ATLAS_CORE | Redução de custos | badge-percent | 40.000.000 | 200.000.000 | costDiscountPercent +0,4 | 0,1 | Startup Lab | Data Center |
| NEO_GEN_5 | Operações de hardware | cpu | 30.000.000.000 | 150.000.000.000 | globalProductionPercent +5 | 0,5 | Data Center | Corporate Network |
| SPECTRE_X | Cliques críticos | dices | 50.000.000.000.000 | 250.000.000.000.000 | criticalChancePercent +0,3 | 0,1 | Corporate Network | Quantum Facility |

Cada estágio de Garage a Quantum Facility libera um agente. Mega Corporation fica sem agente novo.

## Suposições

- NEO_GEN_5 virou produção global com identidade própria (o tipo de efeito não tem categoria; 7.5). É a versão cara e forte de KAI_VER_3.
- Nenhum agente tem bônus secundário e nenhum afeta outros agentes (D-10).
- Desbloqueio por `stageReached` e revelação pelo estágio anterior (ECHO_AI usa Bytes porque Solo Hacker não tem estágio anterior útil).
- Custo base de cada agente fica na faixa do primeiro equipamento do estágio em que desbloqueia.

## Alertas de balanceamento

- Desconto de ATLAS_CORE é aditivo e sem teto. Com 0,4 por agente e crescimento 0,1: 40 agentes no nível 20 dão 46,4%; 100 agentes no nível 50 passariam de 100% (0,4 × 100 × 5,9 = 236%). O custo do 100º agente (4e7 × 1,25^99) é inalcançável, mas o teto real depende do que a árvore Quantum e as melhorias somarem ao desconto. Sugestão: decidir um teto de desconto (ou custo mínimo de 1 Byte, já existente) antes do M4.
- Chance de crítico de SPECTRE_X soma com a chance base (A-04 em aberto). Sem teto definido, 40 agentes no nível 20 somam 34,8 pp.
- Crescimento 1,8 por nível pode ficar caro demais ou barato demais: validar com simulação em T-026 ou posterior.

## Sugestão para `docs/decisoes.md`

- Registrar como provisório: 5 agentes, fator de custo 1,25, nível 1,8, desbloqueio por estágio.
- Abrir decisão: teto para `costDiscountPercent` acumulado e para `criticalChancePercent`.
- Ícones novos exigem entrada em `src/ui/components/iconMap.ts` (AG04).
