# BRF-100 · AG04 · Esconder Continuar após Reset na tela inicial

- **Task:** T-090e (marco M5), D-24
- **Dono:** AG04
- **Pode escrever em:** `src/ui/start/`, `src/ui/App.tsx`, `src/ui/settings/` (só o necessário para avisar o Reset). Não editar `src/app/settings.ts` nem `src/app/notifications.ts` (o AG03 mexe neles em paralelo).

## Escopo

- Depois de um Reset feito pelas Configurações abertas na tela inicial, o botão Continuar some (como no primeiro acesso) e o foco vai para Novo jogo.
- Teste de componente; verificar no navegador copiando e restaurando o save fora da página do jogo.
- Aproveitar e conferir no navegador o `v0.6.0` no cabeçalho do jogo e a dica do tutorial em 375 (passo firstEquipment), relatando.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
