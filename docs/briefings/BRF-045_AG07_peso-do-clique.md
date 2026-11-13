# BRF-045 · AG07 · Peso do clique na curva (A-09)

- **Task:** T-063 (marco M2)
- **Dono:** AG07
- **Depende de:** T-062 (feita)
- **Pode escrever em:** `tests/`, `tools/`, `docs/AG07/`

## Objetivo

Medir quanto o ritmo de cliques muda a duração da run completa e quanto da renda vem dos cliques, para decidir se a curva de cerca de 75 min resiste a quem clica rápido (e a quem não clica).

## Contexto

A-09 em `docs/decisoes.md`. Depois da T-062 a run completa mede 74,0 min contra o motor real com **1 clique por segundo** (`tests/helpers/curva.ts`, `tests/curva-m2.test.ts`, `docs/AG07/curva-m2.md`). As melhorias de clique têm ganho fixo grande (`haptic_gloves` +300.000, `quantum_gloves` +3e10, `neural_overdrive` +6e12) e a sensibilidade mostrou que +20% no bônus de clique corta 8,4% do tempo. A Bíblia 5.3: sem limite de velocidade de clique e sem combo; o jogo também precisa funcionar como idle (produção passiva é central, Bíblia 1.3 e 4.1).

## Escopo

- Faz:
  - Parametrizar o comprador do motor real pelo ritmo de cliques (cliques por segundo) sem mudar o comportamento padrão do teste de curva de 1 clique por segundo.
  - Rodar a run completa com 0, 0,5, 1, 2, 3, 5 e 10 cliques por segundo e registrar: tempo até cada estágio e até Mega Corporation, e o desvio em relação a 1 clique por segundo. Para 1 clique por segundo, registrar também a **fatia da renda que vem dos cliques** (Bytes por clique somados sobre o total gerado) ao abrir cada estágio.
  - Registrar quais melhorias e agentes de clique são compradas em cada ritmo e quando.
  - Se o tempo com 5 ou 10 cliques por segundo cair abaixo de cerca de 50 min, ou o tempo sem clicar passar de cerca de 130 min, **propor 2 ou 3 ajustes concretos com números** (por exemplo, reduzir os `clickFlat` das melhorias, trocar parte deles por `clickPercent`, ou dar maior peso à produção passiva), cada um com o resultado medido nos mesmos ritmos. Para medir uma proposta sem mexer no catálogo, use uma cópia modificada do catálogo dentro do teste ou do script.
  - `docs/AG07/clique-m2.md` com as tabelas, a leitura dos resultados e a recomendação.
- Não faz: alterar o catálogo, o motor, a interface ou `docs/decisoes.md`; a decisão sobre o ajuste é do usuário depois deste relatório.

## Critério de pronto

- [ ] Tabela de tempos por ritmo de cliques (0 a 10 por segundo) e a fatia de renda dos cliques por estágio, medidas no motor real.
- [ ] Se algum limite acima foi ultrapassado: 2 a 3 propostas com resultados medidos; se não, a afirmação explícita de que a curva resiste.
- [ ] O teste de curva existente continua passando sem mudança de comportamento; `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam; as medições extras ficam fora do `npm test` padrão (variável de ambiente, como a de sensibilidade) para não deixar a suíte lenta.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, incluindo a tabela principal. Não commitar.
