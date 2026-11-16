# BRF-066 · AG04 · Resumo de retorno

- **Task:** T-073 (marco M4)
- **Dono:** AG04
- **Depende de:** T-068 (feita). A T-069 (AG03) roda ao mesmo tempo e entrega depois como a UI obtém o resultado pendente; nesta task, receber o resultado por uma prop/hook simples e testar com resultados montados à mão.
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core` nem `src/app`.

## Objetivo

Janela de resumo ao retornar (Bíblia 14.3, 14.6): tempo de ausência, Bytes produzidos e ganhos relevantes.

## Contexto

Tipo `OfflineResult` (`src/core/progression/offline.ts`): `{ awayMs, creditedMs, cappedMs, bytes: Decimal, segments }`. Evento `offlineApplied` no engine. Sem penalidade por ausência e sem sequência diária (14.6).

## Escopo

- Componente `OfflineSummary` (modal acessível como a janela de Reboot, usando o hook `src/ui/useModal.ts`): tempo de ausência formatado (h, min), tempo creditado, aviso discreto se passou do limite ("só as primeiras X h foram contadas"; sem tom de punição), Bytes produzidos com as unidades do jogo, ganhos relevantes que a UI consegue derivar do resultado e do estado (por exemplo novo estágio alcançado durante a ausência e novos itens comprávveis desbloqueados: só o que for simples e confiável; se nada relevante, omitir a seção).
- Botão Continuar; Esc fecha; não aparece se `creditedMs` for menor que o mínimo ou bytes forem 0.
- Ponto de integração: um hook `useOfflineSummary(source)` onde `source` é uma interface mínima (`peek()/consume()` do resultado pendente + assinatura do evento); a ligação real com o bootstrap é feita depois da T-069 (informar no relatório o que falta ligar).
- Textos pt-BR e en em `src/i18n/ui/`; estilo neon; mobile 375 e desktop 1280x720; alvos de toque de 44 px.
- Testes de componente: formatação de tempo, aviso de limite, sem ganho não abre, fechar com Esc e botão, trap de foco.
- Verificar visualmente no navegador montando um resultado de teste (descrever como).
- Não faz: cálculo, relógio, save.

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
