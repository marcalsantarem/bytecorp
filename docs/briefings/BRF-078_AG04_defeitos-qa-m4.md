# BRF-078 · AG04 · Defeitos D1 e D4 da QA do M4

- **Task:** T-074c
- **Dono:** AG04
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` nem `src/app`.

## Escopo

- **D1:** o conteúdo central desloca 25 px (539 → 564 em 1280x720) quando o indicador do acelerador aparece ou some. Reservar a altura do indicador (faixa fixa ou posicionamento que não empurre o layout), sem ocupar espaço do botão de clique nem rolagem em 1280x720 e 375x812.
- **D4:** o aviso "Acelerador recebido" cobre o painel de estágio por 5 s em 1280x720. Reposicionar para uma área livre (sem cobrir o botão de clique, o indicador, o painel de estágio nem o rodapé) em desktop e mobile; continua discreto, `role=status` e sem ativar nada.
- Testes de componente ajustados; verificar no navegador as duas larguras com `getBoundingClientRect` antes e depois (semear o save por uma página estática da mesma origem, por exemplo `/favicon.svg`, e só depois navegar para `/`, pois o `pagehide` sobrescreve o save). Ao terminar: apagar o banco de teste, restaurar a janela e encerrar o servidor.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; medidas relatadas.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
