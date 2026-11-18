# BRF-091 · AG05 · Fundo animado da tela inicial

- **Task:** T-086 (marco M5)
- **Dono:** AG05
- **Depende de:** T-085 (feita; ponto de encaixe na entrega do AG04)
- **Pode escrever em:** `src/render/`, e o componente de fundo indicado pelo AG04.

## Objetivo

Fundo animado da tela inicial em Canvas 2D (Bíblia 17): infraestrutura tecnológica (linhas de dados, nós, grade neon) com o logotipo em destaque.

## Escopo

- Paleta do projeto (fundo `#050811`, ciano, magenta); animação leve e contínua por `requestAnimationFrame`, parada quando a tela inicial sai ou a aba fica oculta.
- Respeitar `prefers-reduced-motion` (quadro estático) e a qualidade gráfica salva (menos elementos em baixa).
- Redimensionamento e densidade de pixels corretos em 375 e 1280x720; custo baixo em celular.
- Testes do que for lógica pura (geração de elementos, limites); verificar no navegador e relatar.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
