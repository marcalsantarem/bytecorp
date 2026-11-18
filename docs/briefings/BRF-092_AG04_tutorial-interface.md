# BRF-092 · AG04 · Tutorial na interface

- **Task:** T-088 (marco M5)
- **Dono:** AG04
- **Depende de:** T-087 (feita; API e alvos de interface na entrega do AG02)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Dicas guiadas do tutorial (Bíblia 16.1): uma por vez, dispensáveis.

## API da T-087

`engine.tutorialStep` (passo atual ou null; `titleKey`, `textKey`, `target`), `completeTutorialStep(id?)`, `dismissTutorialStep()`, `dismissTutorial()`, evento `tutorialChanged`. Passos `passiveProduction` e `achievements` são de conclusão manual (chamar `completeTutorialStep()` no "Entendi" ou ao abrir a janela de conquistas). Alvos: `click-button`, `shop-equipment`, `production-rate`, `shop-agents`, `shop-upgrades`, `achievements-button` (novos) e `reboot-button`, `quantum-button` (já existem como `data-testid`).

## Escopo

- Balão junto ao elemento alvo do passo atual, com destaque leve do alvo, título, texto, "Entendi" (dispensar passo) e "Pular tutorial" (dispensar tudo). Marcar os elementos alvo com os ids que o AG02 listou.
- Não bloquear o clique no alvo; reposicionar em redimensionamento e no mobile (alvo fora da aba visível: indicar a aba).
- Não aparecer por cima da tela inicial, do resumo offline nem de outros modais.
- Textos pt-BR e en; mobile 375 e desktop.
- Testes de componente; verificar no navegador num jogo novo até pelo menos o primeiro agente e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
