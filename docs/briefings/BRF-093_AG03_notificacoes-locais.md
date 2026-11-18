# BRF-093 · AG03 · Notificações locais

- **Task:** T-089 (marco M5)
- **Dono:** AG03
- **Depende de:** T-083 e T-077 (feitas)
- **Pode escrever em:** `src/platform/`, `src/app/`, o service worker, `src/i18n/` (arquivo próprio `src/i18n/notifications/`, ligado com uma linha). Não editar `src/ui/` além de um gancho mínimo para pedir permissão, se necessário.

## Objetivo

Notificações locais do navegador (Bíblia 22) enquanto o jogo está ativo, compatíveis com o PWA; sem push com backend.

## Escopo

- Pedido de permissão só por ação do jogador (quando ele liga a opção nas Configurações); tratar negada e indisponível.
- Categorias das configurações (T-083): conquista desbloqueada, acelerador terminou, limite de produção offline perto de encher (se não der sem backend, documentar e propor alternativa). Só notificar com a aba oculta.
- Limite contra excesso (por categoria e global, ex.: no máximo uma a cada X min) e agrupamento.
- Usar `ServiceWorkerRegistration.showNotification` quando houver SW, senão `Notification`; clique foca o jogo.
- Testes com a API simulada: permissão, categorias desligadas, limite, aba visível não notifica.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
