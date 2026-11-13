# BRF-027 · AG01 · Melhorias comuns (regras)

- **Task:** T-020 (marco M2)
- **Dono:** AG01
- **Depende de:** T-019 (feita)
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Regras do Upgrade System: listar, desbloquear e comprar melhorias comuns, e expor os efeitos ativos. Ligar os efeitos à produção é a T-021 (não faça aqui).

## Contexto

Bíblia 8.1 a 8.6 e 4.6. Contrato: `UpgradeDef` em `src/core/catalog/types.ts` (`cost`, `effect`, `unlockBytesEarnedInRun`, textos e ícone); estado: `run.upgrades: string[]` (ids comprados); o Reboot (M3) zera `run.upgrades`. O catálogo de melhorias está vazio (o AG07 o preenche na T-024): teste com catálogo próprio no arquivo de teste. Regras:

- Três tipos de efeito: produção global, ganho por clique, redução de custo.
- Desbloqueio pelo total de Bytes gerados na execução (`run.bytesEarned`), nunca pelo saldo; várias podem liberar ao mesmo tempo.
- Compra única por execução, imediata, sem confirmação; custo fixo, inteiro; **descontos não afetam o custo de melhorias** (4.6).
- Melhoria comprada continua na lista, não pode ser comprada de novo; sem notificação de desbloqueio.

## Escopo

- Faz: estado por melhoria `locked` (mostra o requisito), `available` (liberada e não comprada) e `purchased`; `GameEngine.buyUpgrade(id)` (devolve boolean; não compra bloqueada, comprada ou sem saldo; debita, atualiza `run.upgrades`, chama `invalidate()`); consultas `upgradeInfo(id)` e `upgradeList()` (lista única ordenada por custo crescente, com estado, custo, efeito e requisito); função pura que devolve a lista de efeitos das melhorias compradas, para a T-021 somar por tipo; evento `upgradePurchased` (id, custo) em `events.ts`. Testes.
- Não faz: ligar efeitos à produção ou ao clique (T-021), dados do catálogo (AG07), interface, salvar após comprar (T-022, AG03), mudar o formato do save.

## Critério de pronto

- [ ] Testes: bloqueada não compra; libera ao atingir o total gerado e não pelo saldo (gastar Bytes não bloqueia de novo); compra debita o custo exato, marca como comprada e não permite repetir; sem saldo não compra; desconto de custo não altera o preço; lista ordenada por custo; a lista de efeitos reflete só as compradas; mais de uma melhoria liberando no mesmo instante.
- [ ] O formato do save não muda; nada em `src/core` importa interface.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
