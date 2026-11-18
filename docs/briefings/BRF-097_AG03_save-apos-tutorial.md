# BRF-097 · AG03 · Salvar após ações do tutorial e das conquistas

- **Task:** T-090c (marco M5), observação O3 de `docs/AG07/resultado-qa-m5.md`
- **Dono:** AG03
- **Pode escrever em:** `src/app/`.

## Problema

"Pular tutorial", concluir/dispensar passo e fechar a notificação de conquista só vão ao save no autosave (até 10 s); ao recarregar logo depois, voltam.

## Escopo

- Incluir os eventos `tutorialChanged` (motivos `completed`, `stepDismissed`, `tutorialDismissed`) e o fechamento da notificação de conquista nos gatilhos de `src/app/purchaseSave.ts` (mesma janela coalescida). Se fechar a notificação não emitir evento, relatar ao AG00 qual evento falta (não editar `src/core`).
- Testes como os de `achievementsSave.test.ts`.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
