# BRF-052 · AG05 · Efeito de Reboot

- **Task:** T-040 (marco M3)
- **Dono:** AG05
- **Depende de:** T-034 (feita: evento `reboot` do engine)
- **Pode escrever em:** a pasta de cena/efeitos de AG05 (ver `docs/00_processo.md`) e arquivos novos de teste; nenhuma outra.

## Objetivo

Efeito visual de Reboot em Canvas 2D, de 2 a 3 s, que o jogador pode pular (Bíblia 9 e 19).

## Escopo

- Faz: componente/módulo de efeito em tela cheia (Canvas 2D), estilo cyberpunk neon do projeto (ciano e magenta sobre escuro, varredura, glitch, contagem ou reinício de terminal), com API simples para o AG04: `<RebootEffect active onDone />` (ou equivalente), dispara `onDone` ao fim ou ao pular (clique, toque, Esc ou botão "Pular"). Respeita `prefers-reduced-motion` (versão curta e estática). Baseado em tempo (não em frames), cancela limpo ao desmontar.
- A lógica do jogo não espera o efeito: o Reboot já foi aplicado no engine; o efeito só cobre a tela.
- Testes de componente (jsdom) para pular, fim por tempo e desmontagem; Canvas pode ser simulado.
- Não faz: janela de confirmação (T-041), lógica de Reboot, áudio.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; efeito verificado visualmente no navegador (descrever como).

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
