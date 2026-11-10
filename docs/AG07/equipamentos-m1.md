# Equipamentos do M1 (provisório)

Valores provisórios (BRF-009, T-014). Sugestão ao AG00 para P-02 em `docs/decisoes.md`. Itens em negrito já existiam e não mudaram.

| Id | Categoria | Custo base | Fator | Produção/s | Desbloqueio (bytes na run) | Revelação |
|---|---|---|---|---|---|---|
| **home_router** | networking | 15 | 1,15 | 0,5 | sempre | sempre |
| wifi_mesh | networking | 600 | 1,15 | 18 | 300 | 50 |
| fiber_node | networking | 25.000 | 1,18 | 640 | 12.500 | 6.000 |
| **home_server** | processing | 100 | 1,15 | 4 | 50 | sempre |
| gpu_rig | processing | 4.500 | 1,15 | 150 | 2.250 | 500 |
| blade_cluster | processing | 200.000 | 1,20 | 5.600 | 100.000 | 65.000 |
| **external_drive** | storage | 1.100 | 1,15 | 32 | 500 | 50 |
| nas_array | storage | 50.000 | 1,15 | 1.300 | 25.000 | 12.500 |
| ssd_vault | storage | 2.200.000 | 1,20 | 52.000 | 1.100.000 | 250.000 |
| **desk_fan** | cooling | 12.000 | 1,15 | 260 | 6.000 | 500 |
| liquid_loop | cooling | 500.000 | 1,18 | 9.500 | 250.000 | 100.000 |
| cryo_chamber | cooling | 22.000.000 | 1,25 | 380.000 | 11.000.000 | 2.750.000 |
| **power_strip** | infrastructure | 130.000 | 1,15 | 1.400 | 65.000 | 6.000 |
| ups_bank | infrastructure | 5.500.000 | 1,18 | 70.000 | 2.750.000 | 1.100.000 |
| micro_generator | infrastructure | 250.000.000 | 1,25 | 2.800.000 | 125.000.000 | 11.000.000 |

Critérios: desbloqueio ≈ metade do custo base (padrão dos itens existentes); revelação = desbloqueio do degrau anterior na ordem global; fator 1,15 comum, 1,18 a 1,20 hardware avançado, 1,25 tecnologia de ponta. Requisitos usam só `bytesEarnedInRun`, sem dependência entre categorias.

## Tempo até a primeira unidade

Script: `node tools/simular-equipamentos.mjs` (1 clique/s de 1 Byte, compra gananciosa por menor custo/produção, sem melhorias nem agentes).

| Item | Tempo |
|---|---|
| home_router | 15 s |
| home_server | 77 s |
| wifi_mesh | 2,5 min |
| external_drive | 3,1 min |
| gpu_rig | 4,2 min |
| nas_array | 6,8 min |
| fiber_node | 7,1 min |
| blade_cluster | 8,5 min |
| desk_fan | 9,1 min |
| ssd_vault | 11,0 min |
| liquid_loop | 11,6 min |
| cryo_chamber | 13,9 min |
| ups_bank | 14,8 min |
| power_strip | 15,5 min |
| micro_generator | 18,0 min |

Saltos: nenhum intervalo supera 6x. O maior é router para server (5x, 15 s para 77 s), aceitável como abertura. O ritmo é rápido (tudo em 18 min) porque o modelo não inclui o custo de decisão do jogador nem o fator de produção global pendente; se o M1 pedir progressão mais lenta, elevar custos ou reduzir produção dos itens de alto nível.
