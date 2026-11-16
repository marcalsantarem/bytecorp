# BRF-073 · AG04 · Inventário e ativação de aceleradores

- **Task:** T-072 (marco M4)
- **Dono:** AG04
- **Depende de:** T-065, T-070 e T-071 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` nem `src/app`.

## Objetivo

Inventário de aceleradores e ativação (Bíblia 13.3 a 13.5): lista dos guardados, ativação imediata se não houver ativo, e confirmação com comparação e escolha de perder ou armazenar se houver.

## Contexto

Estado: `engine.state.meta.accelerators` (`active`, `inventory` de `{ id, multiplier, remainingMs }`). Engine: `activateAccelerator(itemId, { replace?: 'discard'|'store' })` devolve `{ok:true, active, replaced, previous}`, `{ok:false, reason:'notFound'}` ou `{ok:false, needsDecision:true, current, incoming}` sem alterar nada. Eventos: `acceleratorGranted`, `Activated`, `Stored`, `Ending`, `Expired`. Catálogo `src/core/catalog/accelerators.ts` (nomes e ícones). Já existem `AcceleratorIndicator` e `useModal.ts`. O multiplicador maior prevalece; aceleradores não acumulam; os do inventário não expiram; nada ativa sozinho.

## Escopo

- Botão de aceleradores no rodapé (ou junto do indicador) com contador de itens no inventário (desabilitado e discreto se vazio), abrindo o inventário em modal acessível (`useModal`).
- Lista: cada item com ícone, multiplicador, duração restante e botão Ativar; ordenar por multiplicador e tempo; vazio mostra texto curto.
- Ativar sem ativo: ativa na hora. Com ativo: janela de confirmação mostrando a comparação (multiplicador e tempo restante do atual contra o novo), aviso de que o maior multiplicador prevalece e a escolha "Perder o atual" ou "Guardar o atual no inventário"; Cancelar não altera nada. Resultado `needsDecision` do engine alimenta a janela.
- Aviso discreto (toast simples) ao receber um acelerador (`acceleratorGranted`), sem interromper o jogo e sem ativar sozinho.
- Textos pt-BR e en em `src/i18n/ui/`; estilo neon; mobile 375 (alvos de 44 px) e desktop 1280x720.
- Testes de componente: inventário vazio, lista, ativação direta, confirmação com `discard` e com `store`, cancelar não altera, toast de concessão.
- Verificar no navegador semeando o save (IndexedDB `byte-corp-idle` / `kv` / `save`, `meta.accelerators`, SAVE_VERSION 2) com um ativo e itens no inventário; relatar, inclusive o mobile 375.
- Não faz: regras, catálogo, bootstrap.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
