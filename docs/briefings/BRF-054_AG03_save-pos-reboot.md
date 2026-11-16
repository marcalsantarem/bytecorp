# BRF-054 · AG03 · Save após Reboot e reset da árvore

- **Task:** T-038 (marco M3)
- **Dono:** AG03
- **Depende de:** T-034 e T-036 (feitas)
- **Pode escrever em:** `src/core/save/`, `src/app/`, `src/platform/`.

## Objetivo

Garantir que Reboot, compra de nós Quantum e reset da árvore sejam salvos logo e que o formato cubra o prestígio.

## Contexto

Eventos do engine: `reboot`, `quantumNodePurchased`, `quantumTreeReset`. `meta` já tem `quantumCores`, `quantumNodes` e `treeResets`; `stats.reboots` existe. `purchaseSave` (`src/app`) faz salvamento coalescido de 300 ms nas compras.

## Escopo

- Revisar `parseState`/codec: validar `meta.quantumNodes` (ids string, níveis inteiros ≥ 0), `treeResets` e `stats.reboots`; nós desconhecidos no catálogo devem ser descartados com segurança ou preservados (escolher e documentar). Bump de `SAVE_VERSION` e migração só se o formato mudar de fato; se não mudar, dizer no relatório.
- Salvar após `reboot`, `quantumNodePurchased` e `quantumTreeReset` pelo mesmo mecanismo coalescido (o Reboot sem espera de 300 ms se for simples; senão manter o coalescido).
- Testes (fake-indexeddb): salvar após Reboot e recarregar mantém cores, nós, reboots e run zerada; save antigo (v1 sem estes campos) carrega.
- Não faz: regras de prestígio, interface.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
