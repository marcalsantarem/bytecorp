# BRF-089 · AG04 · Janela de Configurações

- **Task:** T-084 (marco M5)
- **Dono:** AG04
- **Depende de:** T-083 (feita; API de configurações na entrega do AG03)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` nem o módulo de configurações.

## Objetivo

Janela de Configurações (Bíblia 15.8) com idioma reativado (revoga D-11) e o botão Reset dentro dela (D-21).

## Escopo

- Botão de engrenagem no lugar do Reset atual do rodapé; abre a janela (`useModal`).
- Seções: Áudio (três volumes, sliders; só guardam valor até o M6), Gráficos (qualidade; só guarda valor), Idioma (pt-BR e en, troca na hora), Notificações (ligar e categorias; o pedido de permissão é da T-089, aqui só o valor), Velocidade de jogo (item reservado, desabilitado com "em breve", D-19), Dados (Reset com a confirmação em dois passos atual, D-21).
- Textos pt-BR e en; mobile 375 e desktop.
- Testes de componente: troca de idioma, valores persistem via API, Reset em dois passos.
- Verificar no navegador (troca de idioma em toda a tela, recarga mantém) e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
