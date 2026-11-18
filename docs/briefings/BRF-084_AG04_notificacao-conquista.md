# BRF-084 · AG04 · Notificação central de conquista

- **Task:** T-080 (marco M5)
- **Dono:** AG04
- **Depende de:** T-077 e T-079 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Notificação central de conquista desbloqueada (Bíblia 11.7): uma por vez, fila, fecha só manualmente, sem histórico.

## Contexto

Engine: `achievementNotification` (primeiro id da fila em `meta.achievementQueue`), `dismissAchievementNotification()`, `achievementInfo(id)` (nome, descrição, raridade, recompensa), evento `achievementUnlocked`. A fila persiste no save; ao recarregar, a notificação pendente volta.

## Escopo

- Cartão central com ícone, raridade (cor por raridade), nome, descrição e recompensa formatada; botão fechar e Esc; ao fechar, mostra a próxima da fila.
- Não bloquear o jogo nem empilhar com outras janelas (se outro modal estiver aberto, esperar ele fechar).
- Textos pt-BR e en; mobile 375 e desktop 1280x720.
- Testes de componente: aparece no desbloqueio, fila em ordem, fechar chama o engine.
- Verificar no navegador com save semeado (conquista na fila) e relatar. Como o catálogo real é feito em paralelo (T-078), usar o que existir; se não houver, verificar só nos testes e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
