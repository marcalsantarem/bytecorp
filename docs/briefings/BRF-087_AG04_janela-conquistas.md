# BRF-087 · AG04 · Janela de conquistas

- **Task:** T-081 (marco M5)
- **Dono:** AG04
- **Depende de:** T-078 e T-080 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Janela de conquistas aberta por um botão permanente do rodapé (Bíblia 11 e 15.6).

## Escopo

- Botão no rodapé com contador (desbloqueadas/total).
- Lista agrupada por categoria; cada item com ícone, raridade (cor), nome, descrição, progresso (barra atual/alvo, formatado), recompensa e estado (bloqueada ou desbloqueada, com data). Secretas bloqueadas mostram só a pista (`achievementInfo` já devolve nulos).
- Sem busca nem filtros (fora de escopo). Rolagem simples; reutilizar `useModal` (foco, Esc).
- Textos pt-BR e en; mobile 375 e desktop 1280x720.
- Testes de componente: agrupamento, secreta oculta, progresso, contador.
- Verificar no navegador com save semeado (algumas desbloqueadas e uma secreta) e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
