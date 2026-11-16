# BRF-056 · AG04 · Janela de Reboot

- **Task:** T-041 (marco M3)
- **Dono:** AG04
- **Depende de:** T-035 e T-040 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, e `src/render/` só para ler (usar `RebootEffect`, não editar).

## Objetivo

Janela de Reboot (Bíblia 9): botão no rodapé, estimativa de Quantum Cores, confirmação do que se perde e do que se preserva, efeito de Reboot pulável.

## Contexto

Engine: `engine.rebootRewardNow` (cores agora; botão habilita com ≥ 1, D-15), `engine.reboot()` (retorna `{ok, reward, rebootNumber}` ou `{ok:false}`; evento `reboot`), `engine.state.meta.quantumCores`. Efeito: `<RebootEffect active onDone skipLabel label />` em `src/render/RebootEffect.tsx`; as props `skipLabel` e `label` vêm do i18n (criar as chaves). Lista do que zera/preserva: CLAUDE.md, seção "Reboot" (zera Bytes, equipamentos, agentes e níveis, melhorias comuns e desbloqueios de execução; preserva Quantum Cores, árvore Quantum, conquistas, estatísticas e bônus temporários de conquistas; encerra evento ativo sem recompensa).

## Escopo

- Botão de Reboot no rodapé (ver o layout atual em `src/ui/layout`), desabilitado com dica quando a recompensa é 0 e habilitado com ≥ 1; mostra a estimativa.
- Janela modal acessível (foco, Esc para cancelar): estimativa em cores, total de cores depois, listas do que se perde e do que se preserva, botões Confirmar e Cancelar; confirmar chama `engine.reboot()`, fecha a janela e mostra `RebootEffect` até `onDone` (pulável).
- Textos pt-BR em `src/i18n/ui/` (en espelhado, tipos obrigam); ícones Lucide; estilo neon do projeto; layout mobile (375 px) e desktop.
- Testes de componente (jsdom): botão desabilitado/habilitado, confirmação chama o engine, cancelar não chama, efeito aparece e some.
- Verificar no navegador (desktop 1280x720 e mobile 375) e relatar.
- Não faz: árvore Quantum (T-042/T-043), mudanças no `src/core`.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
