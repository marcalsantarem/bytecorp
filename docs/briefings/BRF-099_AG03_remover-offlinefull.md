# BRF-099 · AG03 · Remover a categoria offlineFull

- **Task:** T-090d (marco M5), D-23
- **Dono:** AG03
- **Pode escrever em:** `src/app/settings.ts`, `src/app/notifications.ts` e testes, `src/i18n/` (remover chaves sem uso, inclusive `settings.notifications.offlineFull` em `src/i18n/ui/`).

## Escopo

- Tirar `offlineFull` de `NOTIFICATION_CATEGORIES`; `SUPPORTED_NOTIFICATION_CATEGORIES` deixa de ser necessário se ficar igual (simplificar, ajustando o uso em `src/ui/settings/SettingsDialog.tsx` só no import, se preciso).
- Configurações salvas com `offlineFull` continuam carregando (chave ignorada); teste disso.
- Remover as chaves de i18n que ficarem sem uso.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
