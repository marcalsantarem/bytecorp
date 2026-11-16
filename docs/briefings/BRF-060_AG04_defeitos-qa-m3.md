# BRF-060 · AG04 · Defeitos da QA do M3

- **Task:** T-047b (corrige D1, D3, D4 e D5 de `docs/AG07/resultado-qa-m3.md`)
- **Dono:** AG04
- **Depende de:** T-044 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Escopo

- **D1 (média):** trap de foco (Tab e Shift+Tab) na tela da árvore Quantum e na janela de reset, como já existe na janela de Reboot (`src/ui/reboot/RebootControl.tsx`; extrair um hook/utilitário compartilhado se simples). Foco inicial dentro da tela, devolução do foco ao fechar, Esc sempre fecha a janela de reset (e só ela, não a árvore) mesmo com o foco em qualquer elemento interno.
- **D3:** a 375 px os nós da árvore ficam com 31x31 px no enquadramento inicial; garantir alvo de toque de pelo menos 44x44 px efetivos (por exemplo enquadramento inicial com zoom maior e pan, ou área de toque ampliada), sem perder a visão geral (zoom −).
- **D4:** a 375 px, "Pular" (68x30) e "Resetar árvore" (42x44) devem ter pelo menos 44x44 px.
- **D5:** a 375 px o botão Reboot com "+N" (58 px) deve ter a mesma altura do botão da Árvore (44 px).
- Testes de componente para o trap de foco e o Esc; verificar D3 a D5 no navegador a 375 px (medir com `getBoundingClientRect`) e 1280x720; restaurar o preset desktop.
- Não faz: regras do núcleo, balanceamento.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; medidas antes/depois relatadas.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
