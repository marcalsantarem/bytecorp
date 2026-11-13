# BRF-041 · AG07 · Melhorias comuns para os estágios finais

- **Task:** T-059 (marco M2)
- **Dono:** AG07
- **Depende de:** T-052 (feita)
- **Pode escrever em:** `src/core/catalog/` (exceto `types.ts`), `src/i18n/content/`, `tools/`, `tests/`, `docs/AG07/`. **Autorização extra:** `src/ui/components/iconMap.ts`, somente para acrescentar os ícones novos (import e entrada no mapa); o teste `iconMap.test.ts` falha se um ícone do catálogo faltar. Não toque em mais nada de `src/ui/`.

## Objetivo

Acrescentar melhorias comuns para os estágios finais (Quantum Facility e Mega Corporation), que hoje não têm nenhuma além das 12 existentes.

## Contexto

`docs/AG07/melhorias-m2.md`: 12 melhorias (5 de produção global, 4 de clique, 3 de desconto), custo igual a 2x o desbloqueio, de 50 a 1e13 Bytes; descontos somam no máximo 4,5 pontos percentuais e se somam aos dos agentes e, no futuro, aos da árvore Quantum (A-06 em `docs/decisoes.md` segue aberta: sem teto). Estágios: 1e4, 1e6, 1e9, 1e12, 1e15 e 1e18 Bytes gerados; 35 equipamentos até 4e18 de custo (`docs/AG07/equipamentos-m3.md`). Regras: três tipos apenas (produção global, clique, desconto), nenhuma melhoria específica de um equipamento ou agente (Bíblia 8.2), compra única, custo fixo, desbloqueio pelo total gerado na execução (8.4), distribuição progressiva por estágio (8.6). Fórmula D-10: produção, clique fixo e percentual e desconto somam dentro da camada de melhorias e agentes.

## Escopo

- Faz: cerca de 8 melhorias novas (de 12 para cerca de 20) cobrindo de cerca de 1e13 até além de 1e18 Bytes gerados, com custo igual a 2x o desbloqueio, em ordem crescente, equilibrando os três tipos; valores conservadores, em especial o desconto (mantenha o total de desconto vindo de melhorias em no máximo cerca de 8 pontos percentuais e informe o máximo acumulado possível somado aos agentes, para a decisão A-06); chaves `upgrade.<id>.name` e `.desc` nos dois idiomas em `src/i18n/content/` (ícones Lucide que existam de fato, acrescentados ao `iconMap.ts` conforme a autorização; reaproveite os que já existem quando fizer sentido); atualizar `catalog.test.ts` e os testes em `tests/` (contagens, ordenação por custo e por desbloqueio, tipos); estender `tools/simular-melhorias.mjs` e `docs/AG07/melhorias-m2.md` (ou criar `melhorias-m3.md`) com a tabela, o tempo de retorno estimado e os pontos de atenção; sugerir ao AG00 o texto para P-05 (não edite `docs/decisoes.md`).
- **Mantenha as 12 melhorias atuais exatamente como estão** (ids, custos, efeitos, desbloqueios): testes do núcleo e da interface dependem delas.
- Não faz: alterar `types.ts`, regras do engine, interface além do `iconMap.ts`, equipamentos, agentes.

## Critério de pronto

- [ ] `validateCatalog(CATALOG)` vazio; testes de contagem, ordem e tipos atualizados; as 12 antigas intactas.
- [ ] Os dois idiomas com todas as chaves novas (o compilador garante); `iconMap.test.ts` passa.
- [ ] Documento e simulação entregues, com o máximo de desconto acumulado informado.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
