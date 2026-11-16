# BRF-074 · AG04 · Verificar visualmente o inventário e o indicador

- **Task:** T-072b (fecho da T-072 e da T-071)
- **Dono:** AG04
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`.

## Objetivo

A T-072 foi entregue sem verificação no navegador, e a T-071 ficou sem a conferência em 375 px. Conferir e corrigir.

## Escopo

- Semear o save no IndexedDB (`byte-corp-idle` / `kv` / `save`, `meta.accelerators`, SAVE_VERSION 2) com um acelerador ativo e 3 itens no inventário (2x e 5x, tempos diferentes); recarregar.
- 1280x720 e 375x812: o rodapé com três botões (Reboot, Árvore, Aceleradores) cabe sem rolagem horizontal e com alvos de pelo menos 44 px; o indicador do acelerador cabe sem cobrir o botão de clique; abrir o inventário, ativar com e sem ativo (confirmação com Perder/Guardar/Cancelar), ver o toast ao receber um acelerador (por exemplo mudando de estágio no save semeado); a mensagem "Acelerador encerrado" aparece ao expirar (semear com poucos segundos restantes). `prefers-reduced-motion` se for fácil de emular.
- Corrigir os defeitos encontrados (largura do rodapé, alturas, truncamentos). Relatar medidas (`getBoundingClientRect`) antes e depois.
- Ao terminar: apagar o banco de teste, restaurar a janela (preset desktop) e encerrar o servidor de dev.
- Não faz: regras, catálogo.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
