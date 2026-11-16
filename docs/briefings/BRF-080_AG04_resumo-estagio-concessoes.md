# BRF-080 · AG04 · Resumo de retorno: estágio alcançado e concessões

- **Task:** T-074e (D2 da QA do M4)
- **Dono:** AG04
- **Depende de:** T-074d (feita)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` nem `src/app`.

## Objetivo

O resumo de retorno (`src/ui/offline/`) não mostra o estágio alcançado nem os aceleradores recebidos na ausência. O AG03 agora entrega os dados.

## Contexto

`session.offline` (`src/app/offlineSession.ts`) ganhou `peekDetail()` e `consumeDetail()`, que devolvem `PendingOfflineDetail | null` = `{ result: OfflineResult; stageBefore?: StageId; grants: number }` (tipo exportado). `peek()` e `consume()` antigos continuam. `grants` é a contagem de aceleradores concedidos durante o crédito. O adaptador `src/ui/offline/sessionSource.ts` hoje usa `peek`/`consume` e devolve `{ result }` sem `stageBefore`; o tipo `PendingOffline` da UI está em `src/ui/offline/useOfflineSummary.ts`.

## Escopo

- Trocar o adaptador para `peekDetail`/`consumeDetail`, devolver `{ result, stageBefore, grants }` e acrescentar `grants` ao tipo `PendingOffline` da UI; remover o comentário "stageBefore não é guardado pela sessão".
- No `OfflineSummary`: a seção "Ganhos" mostra "Novo estágio: X" quando o estágio atual difere de `stageBefore` (se vários estágios, mostrar o atual) e "Aceleradores recebidos: N" quando `grants > 0`; seção omitida se não houver nenhum. Textos pt-BR e en em `src/i18n/ui/` (plural simples).
- Testes de componente e de integração (`sessionSource.test.tsx`): mudança de estágio, concessões, nenhuma, créditos somados.
- Verificar no navegador em 1280x720 e 375x812 com save semeado (3 h e 20 h atrás, `savedAt`, `run` com poucos Bytes para cruzar estágio) por uma página estática da mesma origem (por exemplo `/favicon.svg`) e só depois navegar para `/`; relatar. Ao terminar: apagar o banco de teste, restaurar a janela e encerrar o servidor.
- Não faz: regras, save.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
