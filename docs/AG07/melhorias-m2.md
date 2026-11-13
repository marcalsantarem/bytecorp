# Melhorias comuns do M2 (T-024, BRF-029)

Valores provisórios. Compra única por execução, custo fixo, sem desconto (4.6). Lista por custo crescente; custo = 2x o desbloqueio (como nos equipamentos). Valores em pontos percentuais, exceto `clickFlat` (Bytes). Retorno: simulação gananciosa de `tools/simular-melhorias.mjs` (1 clique/s, sem outras melhorias), taxa do instante do desbloqueio.

| Melhoria | Tipo | Efeito | Ícone | Custo | Desbloqueia (Bytes na run) | Disponível em | Retorno |
|---|---|---|---|---|---|---|---|
| macro_script | clickFlat | +1 | terminal | 50 | 25 | 22 s | 50 s |
| overclock_basic | globalProductionPercent | +10 | gauge | 400 | 200 | 88 s | 22 min |
| ergonomic_keys | clickPercent | +50 | keyboard | 1.500 | 750 | 2,3 min | 25 min |
| bulk_discount | costDiscountPercent | +1 | ticket-percent | 2.500 | 1.000 | 2,5 min | 2,2 h |
| neural_macro | clickFlat | +30 | zap | 20.000 | 10.000 | 4,5 min | 22 min |
| task_scheduler | globalProductionPercent | +21 | layers | 100.000 | 50.000 | 6,3 min | 45 min |
| haptic_gloves | clickFlat | +30.000 | hand-coins | 50 mi | 25 mi | 16 min | cerca de 100 s (motor real) |
| supplier_contract | costDiscountPercent | +1,5 | piggy-bank | 5 mi | 2,5 mi | 10,5 min | 4 h |
| distributed_cache | globalProductionPercent | +32 | rocket | 60 mi | 30 mi | 13,7 min | 36 min |
| corporate_volume | costDiscountPercent | +2 | badge-percent | 5 bi | 2,5 bi | 21,7 min | 5,3 h |
| load_balancer | globalProductionPercent | +85 | trending-up | 100 bi | 50 bi | 28,6 min | 31 min |
| quantum_scheduler | globalProductionPercent | +60 | sparkles | 10 tri | 5 tri | 41,7 min | 26 min |

Totais: produção global +75 (5, 10, 15, 20 e 25), desconto +4,5, clique +1/+30/+300.000 fixos e +50%.

**T-062 (BRF-044):** `neural_macro` passou de +10 para +30, `haptic_gloves` virou `clickFlat` +300.000 com custo 5e7 (desbloqueio 2,5e7), `load_balancer` +25 para +20 e `quantum_scheduler` +40 para +25. Os tempos da coluna "Disponível em" e "Retorno" desta tabela vêm da simulação antiga (sem agentes, produção só dos equipamentos); os da curva atual estão em `curva-m2.md`. Lista reordenada por custo: `haptic_gloves` vem depois de `supplier_contract`.

## Ícones novos para o `iconMap` (AG04, T-027)

Todos existem no lucide-react: `terminal`, `gauge`, `keyboard`, `ticket-percent`, `hand-coins`, `piggy-bank`, `trending-up`, `sparkles`, `rocket`. Já mapeados: `zap`, `layers`, `badge-percent`.

## Pontos de atenção

- Desconto acumulado das melhorias: no máximo 4,5 pp (A-06). Sozinho é seguro; o risco está na soma com ATLAS_CORE e a árvore Quantum (ver `agentes-m2.md`). O retorno de 2 a 5 h dos descontos é pessimista (assume só a taxa de produção como gasto).
- Cliques perdem peso rápido: a partir de ~10 min a produção passa de milhares de B/s e `clickFlat` fixo fica irrelevante. As melhorias de clique ficam todas até 7 min de jogo; clique a escala depende de agentes (ECHO_AI) e da árvore Quantum. Decidir se `clickFlat` deveria escalar.
- Retornos globais ficam em 22 a 45 min, plano e previsível; o retorno cresce pouco porque o custo é 2x o desbloqueio e a taxa cresce a cada compra. Se for muito barato, subir o multiplicador de custo para 3x.
- Intervalo sem melhoria entre 7 min e 10 min e depois entre 42 min e o fim do meio do jogo: as melhorias param no estágio Quantum Facility. Melhorias de estágios finais podem entrar depois.
- A simulação ignora agentes e cliques ativos; vale revalidar na T-026.

## Sugestão para `docs/decisoes.md`

- Registrar como provisório: 12 melhorias, custo = 2x desbloqueio, soma de desconto das melhorias 4,5 pp.
- Manter aberta A-06 (teto de desconto), indicando 4,5 pp vindos das melhorias.
- Abrir decisão: `clickFlat` fixo perde relevância após ~10 min; escalar ou aceitar.

**T-064 (BRF-046, A-09, P5 recalibrada):** produção global das melhorias ×2,1 aproximado (`overclock_basic` 10, `task_scheduler` 21, `distributed_cache` 32, `load_balancer` 85) e `haptic_gloves` ×0,1 (+30.000). As colunas de tempo acima seguem da simulação antiga; os tempos reais estão em `curva-m2.md` e `clique-m2.md`.
