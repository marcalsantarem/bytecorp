# BRF-090 · AG04 · Tela inicial

- **Task:** T-085 (marco M5)
- **Dono:** AG04
- **Depende de:** T-084 (feita), D-21
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`, `src/app/` só no ponto em que a interface decide mostrar a tela inicial. Não editar `src/core`.

## Objetivo

Tela inicial (Bíblia 17): Continuar, Novo jogo com confirmação, Configurações e Créditos.

## Escopo

- Aparece ao abrir o jogo. Continuar só com save existente; Novo jogo com confirmação quando houver save (apaga o save, mantém `settings`); Configurações abre a janela da T-084; Créditos em janela simples (texto em i18n, conteúdo provisório).
- O núcleo pode seguir rodando por trás; o resumo offline aparece depois de Continuar, não por cima da tela inicial.
- Logotipo em texto neon; espaço reservado para o fundo animado da T-086 (um componente `<StartBackground />` vazio que o AG05 vai preencher em `src/render/`).
- Textos pt-BR e en; mobile 375 e desktop; teclado.
- Testes de componente; verificar no navegador (primeiro acesso, com save, Novo jogo) e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, mais o ponto exato onde o AG05 encaixa o fundo. Não commitar.
