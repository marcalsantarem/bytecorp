# BRF-058 · AG04 · Árvore Quantum na interface (2): painel, compra e reset

- **Task:** T-043 (marco M3)
- **Dono:** AG04
- **Depende de:** T-042 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Painel de detalhes do nó selecionado, compra de nível e reset da árvore com confirmação (Bíblia 10).

## Contexto

`src/ui/quantum/QuantumTree.tsx` já guarda `selected` e tem um espaço reservado no rodapé. Engine: `quantumNodeInfo(id)` (status, custo do próximo nível, motivo se bloqueado), `buyQuantumNode(id)` (retorna `{ok}` ou `{ok:false, reason: 'unknown'|'locked'|'maxed'|'insufficient'}`), `resetQuantumTree()`, `quantumTreeResetCost`, `quantumCoresSpent`, `meta.quantumCores`, `meta.treeResets`. Regra do reset: devolve todos os cores gastos e cobra o custo (3, 6, 9...) depois da devolução; recusa se saldo + devolução < custo. Efeitos por nível estão no catálogo (`QUANTUM_NODES`); textos `quantum.<id>.name|desc`.

## Escopo

- Painel do nó selecionado (lateral no desktop, inferior no mobile): nome, descrição, ícone, nível atual/máximo, efeito atual e do próximo nível (formatado com as unidades do jogo), pré-requisitos (cumpridos ou não), custo do próximo nível, botão "Comprar nível" (desabilitado com motivo: bloqueado, saldo insuficiente, máximo).
- Botão de reset da árvore com janela de confirmação em dois passos: mostra cores a devolver, custo do reset e saldo final; recusa clara se não houver saldo. Reset não faz Reboot.
- Feedback ao comprar (nó pisca/ganha destaque simples) e atualização imediata do saldo e dos nós; reutilizar `useEngineRevision` (se faltar subscrição a `quantumNodePurchased` e `quantumTreeReset`, adicionar).
- Textos pt-BR e en em `src/i18n/ui/`; estilo neon; mobile 375 e desktop 1280x720.
- Testes de componente: painel por estado, compra chama o engine e atualiza, motivo de bloqueio, reset com confirmação e recusa.
- Verificar no navegador com save semeado (comprar, bloquear por pré-requisito, resetar) e relatar.
- Não faz: mudanças no núcleo, efeitos visuais novos, trap de foco (anotar como pendência se não resolver).

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
