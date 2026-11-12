# BRF-032 · AG04 · Cena do núcleo em telas baixas

- **Task:** T-055 (marco M2)
- **Dono:** AG04
- **Depende de:** T-028 (feita)
- **Pode escrever em:** `src/ui/core/`, `src/ui/layout/GameLayout.tsx`, `src/index.css`. **Não toque** em `src/ui/shop/`, `src/ui/components/`, `src/ui/agents/`, `src/ui/App.tsx` nem `src/i18n/ui/` (outra task roda ao mesmo tempo nessas pastas).

## Objetivo

Fazer a coluna central (indicador de estágio, cena do núcleo, botão de clique e legenda do valor por clique) caber inteira, sem rolagem, em telas de notebook comuns.

## Contexto

Hoje a cena é um quadrado de até 384 px no desktop (288 px no mobile) e, em 1280x720, a coluna passa 51 px da altura: o botão de clique fica 15 px cortado e a legenda exige rolagem (medido pelo AG00: coluna de 622 px, conteúdo de 673 px, botão termina em y=692 contra o fim da coluna em y=677). A coluna já usa `justify-center-safe` e rola quando não cabe; isso deve continuar valendo para alturas muito pequenas.

## Escopo

- Faz: o tamanho do canvas da cena passa a depender da altura disponível (por exemplo com `min()` e `dvh`, ou container query), com mínimo razoável (cerca de 160 px) e máximo atual; em 1280x720 e 1024x600 o conteúdo inteiro cabe sem rolagem; em alturas ainda menores a coluna rola como hoje; mobile (375x812, aba Núcleo) e telas altas seguem iguais; o canvas continua nítido e redimensiona sem reiniciar a cena.
- Não faz: mexer em `src/render/` (a cena em si), no núcleo, em textos ou na loja.

## Critério de pronto

- [ ] Medido no navegador (`getBoundingClientRect`, `scrollHeight`/`clientHeight`) com o save de teste em estágio avançado (edite `bytesEarned` no IndexedDB e recarregue): 1280x720 e 1024x600 sem rolagem vertical na coluna, botão e legenda inteiros visíveis; 1280x900 e 375x812 sem regressão; sem rolagem horizontal. A tela só redesenha com a pane visível ou após uma captura de tela. Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação (medidas), suposições, não testado, próximo passo**. Não commitar.
