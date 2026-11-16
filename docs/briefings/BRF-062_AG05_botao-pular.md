# BRF-062 · AG05 · Botão "Pular" com alvo de toque de 44 px

- **Task:** T-047d (resto do D4 de `docs/AG07/resultado-qa-m3.md`)
- **Dono:** AG05
- **Pode escrever em:** `src/render/RebootEffect.tsx` e seu teste.

## Escopo

O botão "Pular" do efeito de Reboot mede 68x30 a 375 px (`px-3 py-1`, linha ~55). Dar `min-h-11 min-w-11` (44x44), mantendo o visual neon e a posição. Sem outras mudanças; um teste simples de classe ou tamanho mínimo se couber.

## Critério de pronto

- [ ] lint, typecheck, `npx vitest run src/render` e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
