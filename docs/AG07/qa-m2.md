# QA do M2 (T-031, BRF-042)

## Testes de integração

`tests/m2.integration.test.ts`: 32 testes, catálogo real, ambiente node, cerca de 0,5 s. `npm test` passa de 205 para 237 testes sem mudar de tempo (cerca de 4,5 s).

Cobertura: fórmula D-10 (soma na camada, mesmo multiplicador no passivo e no clique, rastreio em `production.layers`), descontos (equipamento, contratação e evolução com desconto; melhorias sem; custo inteiro e >= 1 com desconto acima de 100%; MAX para os 35 equipamentos com 5 descontos), estágios (um evento por degrau, salto de 4 estágios, sem regressão, `stageReached` junto), estados de agentes e melhorias, compra única, Evoluir só com agente, ordem das listas, crítico (chance limitada a 0..1, multiplicador somado), save (ida e volta, gravação após contratar/evoluir/melhoria/estágio, agrupamento, `resetGame`), independência de frames com 4 fatiamentos e 6 compras no meio, e números grandes.

Comportamento documentado, não defeito:

- Acima de 2^53 (~9e15) o `Decimal` tem ~15 dígitos: `1e17 + 1 == 1e17`. Custos continuam inteiros e crescentes com N, mas "inteiro exato" perde sentido; o teste só exige inteiro, crescente e saldo nunca negativo.
- Equipamentos são ordenados por custo **dentro de cada categoria**, não no catálogo inteiro (o teste checa por categoria).
- O catálogo real não tem fonte de `criticalMultiplier`; esse efeito foi testado com um clone do catálogo.

## Simulação da curva (`node tools/simular-curva.mjs`)

Comprador guloso: 1 clique por segundo, crítico base (5%, x5), compra o item de menor retorno (custo / ganho de renda efetiva, onde desconto conta como renda). Linha de base (sem agentes e melhorias) reproduz o `simular-equipamentos`: 108,0 min até Mega Corporation (referência 108,1).

| Estágio | Base | Só melhorias | Só agentes | Completo | Completo/base |
|---|---|---|---|---|---|
| Garage Company | 4,3 min | 4,3 | 4,3 | 4,3 | 1,00 |
| Startup Lab | 9,2 | 9,0 | 9,2 | 9,0 | 0,98 |
| Data Center | 19,6 | 18,0 | 16,1 | 15,4 | 0,78 |
| Corporate Network | 37,0 | 31,5 | 18,7 | 17,9 | 0,48 |
| Quantum Facility | 65,2 | 45,9 | 19,6 | 18,6 | 0,29 |
| Mega Corporation | 108,0 | 61,5 | 19,6 | 18,7 | 0,17 |

Primeira contratação (completo): KAI_VER_3 10,5 min, ATLAS_CORE 16,6, NEO_GEN_5 18,3, ECHO_AI 18,6; SPECTRE_X nunca (custo 5e13, o jogo termina antes). Melhorias: 11 de 20 compradas; as 9 que nunca entram: ergonomic_keys, neural_macro, haptic_gloves, quantum_gloves, neural_overdrive (clique) e facility_contract, orbital_orchestrator, megacorp_charter, singularity_core. No fim: KAI 131 agentes nível 50, ATLAS 67 nível 25, NEO 74 nível 28, desconto 95,6% (valor da simulação; no jogo não há teto).

### Achados de balanceamento (propostas, nada foi alterado)

1. **Os agentes encurtam a curva de 108 para ~19 min (17%).** Corporate Network cai de 37 para 18 min e Quantum e Mega ficam a 0,1 a 0,6 min uma da outra: a partir de Corporate Network não há mais progressão por estágio, só um muro de compras. Causas, por variante da simulação (Mega Corporation):
   - sem KAI_VER_3 e NEO_GEN_5: 42,0 min; KAI e NEO com 1/10 do valor: 32,1 min; 1/20: 36,0; 1/40: 38,4;
   - desconto limitado a 25% ou 50%: 19,6 e 19,2 min (sozinho quase não muda); sem ATLAS_CORE: 20,1;
   - sem KAI/NEO e desconto a 25%: 55,5 min; com KAI/NEO a 1/10 e desconto a 25%: 38,0 min.
   Os dois fatores juntos explicam o encurtamento: bônus global somado por agente (+2 e +5 pp por unidade, x(1+0,5 por nível)) sem teto, e agentes baratos demais frente à renda (KAI custa 6e4 e vale mais a cada nível).
2. **Proposta A (recomendada):** manter o custo e reduzir o valor global por agente: KAI 0,2 pp e NEO 0,5 pp (1/10), crescimento por nível 0,25; mais teto de desconto acumulado de 50% (ou 75%). Resultado esperado na simulação: ~35 a 38 min. Para voltar perto de 100 min, somar uma elevação dos limites de estágio e custos de equipamentos (decisão do AG00; este sistema já era 108 min sem melhorias, então o orçamento de tempo de M2 em diante precisa ser definido: alvo da run com tudo).
3. **Proposta B:** manter valores e subir `costGrowth` dos agentes de 1,25 para ~1,4 e `levelCostGrowth` de 1,8 para ~2,2, para que 130 contratações não caibam. Menos limpo: o bônus continua sem teto.
4. **Trecho parado:** nenhum acima de 2,1 min (NAS Array, 6,6 min); os saltos entre estágios completos ficam abaixo de 2,6x até Data Center, depois colapsam (item 1).
5. **ECHO_AI quase inútil:** contratado só aos 18,6 min, 3 unidades, 1 evolução. +5 pp de clique é desprezível contra a produção passiva. Sugestão: valor 25 a 50 pp (cliques ainda importam no começo), ou revelar/desbloquear mais cedo (Garage já é o estágio). SPECTRE_X nunca é contratado (custo 5e13 após o fim da simulação): custo base 50e12 vs primeiro equipamento do estágio; reduzir para ~5e12 ou deslocar o desbloqueio.
6. **9 melhorias nunca são compradas no fluxo guloso** (as de clique e as 4 mais caras). As de clique só valem para quem clica mais de 1 por segundo; pode ser aceitável (clique é secundário), mas as caras (`orbital_orchestrator`, `megacorp_charter`, `singularity_core`, `facility_contract`) ficam sem uso na run se o fim vem em 19 min. Com a curva reaberta (item 2) devem passar a entrar.
7. **Desconto:** com 67 ATLAS no nível 25 a soma chega a 95,6% e, sem teto, passa de 100%; o custo vira 1 Byte (testado em `tests/m2.integration.test.ts`, comportamento previsto pela regra do mínimo de 1 Byte). Abrir a decisão de teto (já pedida em `agentes-m2.md`) antes do M4.

## Defeitos encontrados

Nenhum defeito de lógica em código de outros donos: todos os casos de integração passam. Pendências de decisão, não de código: teto de desconto e de chance de crítico (itens 1 e 7), e a curva do M2 (itens 1 a 5).

Limitação da simulação: números em ponto flutuante, sem arredondamento por unidade nos descontos além de `floor`, sem offline, sem boosts e com cliques fixos de 1 por segundo; o retorno de desconto é aproximado pela renda efetiva. Serve para comparar variantes, não para prever minutos reais.
