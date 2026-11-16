# BRF-071 · AG04 · Indicador do acelerador ativo

- **Task:** T-071 (marco M4)
- **Dono:** AG04
- **Depende de:** T-065 (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Indicador persistente do acelerador ativo (Bíblia 13.6): multiplicador, tempo restante e aviso discreto próximo do encerramento.

## Contexto

Estado: `engine.state.meta.accelerators.active` (`{ id, multiplier, remainingMs }` ou null) e `inventory`. Eventos: `acceleratorActivated`, `acceleratorStored`, `acceleratorEnding {item, remainingMs}` (dispara uma vez quando falta o limiar, 30 s por padrão), `acceleratorExpired`, `acceleratorGranted`. `useEngineRevision` re-renderiza por eventos; adicionar os novos eventos às assinaturas. O tempo restante na tela deve contar em tempo decorrido (mostrar atualizado a cada 1 s a partir de `remainingMs`, sem depender de quadros).

## Escopo

- Componente `AcceleratorIndicator` (barra de recursos ou perto dela, visível em desktop e mobile, sem tirar espaço do botão de clique): ícone, "2x" ou "5x", tempo restante `mm:ss` (ou `h:mm:ss`), barra fina de progresso. Só aparece com acelerador ativo.
- Aviso discreto ao `acceleratorEnding`: o indicador pisca ou muda de cor por alguns segundos (respeita `prefers-reduced-motion`), mais um texto curto para leitor de tela (`aria-live="polite"`) e, ao expirar, uma mensagem breve ("Acelerador encerrado") por alguns segundos. Sem som.
- Textos pt-BR e en em `src/i18n/ui/`; estilo neon; mobile 375 e desktop 1280x720.
- Testes de componente: oculto sem ativo, mostra multiplicador e tempo, aviso ao evento, mensagem ao expirar.
- Verificar no navegador semeando um acelerador ativo no save (IndexedDB `byte-corp-idle` / `kv` / `save`, `meta.accelerators.active`; SAVE_VERSION 2) e ativando por console (`engine` não é global; semear o save e recarregar é o caminho), e relatar.
- Não faz: inventário e ativação (T-072), regras.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
