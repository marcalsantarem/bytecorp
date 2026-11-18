# BRF-085 · AG03 · Configurações: modelo e persistência

- **Task:** T-083 (marco M5)
- **Dono:** AG03
- **Depende de:** D-19, D-06
- **Pode escrever em:** `src/platform/`, `src/app/`, um módulo de configurações fora de `src/core/save/` (ex.: `src/app/settings.ts`), `src/i18n/` só para reativar o idioma salvo e o do navegador. Não editar `src/ui/`.

## Objetivo

Modelo de configurações (Bíblia 15.8) salvo na chave `settings`, fora do save do jogo (D-06), que sobrevive a Novo jogo.

## Escopo

- Campos: volumes de música, efeitos e interface (0 a 100), qualidade gráfica (automática, baixa, média, alta), idioma (pt-BR, en), notificações locais (ligadas e por categoria: conquista, acelerador expirado, produção offline cheia; ajustar conforme a T-089), velocidade de jogo reservada (D-19: só o campo/valor 1x, sem seletor).
- Validação e valores padrão; versão própria do formato e migração da chave `settings` atual (só idioma).
- Idioma: voltar a respeitar o salvo e, sem salvo, o do navegador (revoga D-11 na parte de idioma); expor API para a UI ler, alterar e assinar mudanças.
- Volumes e qualidade só guardam o valor até o M6.
- Testes: padrões, validação, migração, sobrevive a Novo jogo.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, mais a API para o AG04. Não commitar.
