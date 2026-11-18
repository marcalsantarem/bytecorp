# BRF-096 · AG04 · Dica do tutorial cobrindo o alvo no mobile

- **Task:** T-090b (marco M5), defeito D1 de `docs/AG07/resultado-qa-m5.md`
- **Dono:** AG04
- **Pode escrever em:** `src/ui/`.

## Defeito

Em 375x812, a dica "Primeiro equipamento: Abra a aba Loja." (y 481 a 675) cobre por inteiro o botão Processar dados (y 566 a 644); `elementFromPoint` no botão cai na dica. Reproduzir: Novo jogo em 375, 20 cliques. Provavelmente igual no passo da aba Agentes.

## Escopo

- Quando o alvo está em aba oculta, a dica aponta para o botão da aba sem cobrir a área de jogo (ex.: presa logo acima da barra de abas, compacta) e nunca cobre o botão de clique.
- Em qualquer passo, a dica não cobre o alvo nem o botão de clique; se não couber, encolher ou ir para o lado oposto.
- Teste de componente para o posicionamento (ou função pura de posicionamento testada); verificar no navegador em 375x812 e 1280x720 (passos firstEquipment e firstAgent), copiando e restaurando o save fora da página do jogo.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
