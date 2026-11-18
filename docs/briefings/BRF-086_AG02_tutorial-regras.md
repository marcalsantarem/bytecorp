# BRF-086 · AG02 · Tutorial contextual: regras

- **Task:** T-087 (marco M5)
- **Dono:** AG02
- **Depende de:** T-079 (feita; progresso do tutorial no save)
- **Pode escrever em:** `src/core/progression/`, `src/core/catalog/` (passos do tutorial), `src/core/engine.ts`, eventos, `src/i18n/tutorial/` (arquivos novos `pt-BR.ts` e `en.ts` com as chaves `tutorial.<id>.title|text`, ligados com uma linha em `src/i18n/pt-BR.ts` e `en.ts`; outras tasks editam o i18n em paralelo). Não editar `src/ui/` nem `src/core/save/` (se faltar campo no save, pedir ao AG00).

## Objetivo

Tutorial contextual (Bíblia 16.1): passos que aparecem quando o jogador chega a cada marco, um por vez, dispensáveis.

## Escopo

- Passos orientados a dados, em ordem: clicar, primeiro equipamento, produção passiva, primeiro agente, melhorias, conquistas, Reboot (quando habilitar), árvore Quantum (após o primeiro Reboot). Passo de eventos fica para o M7.
- Cada passo com condição de ativação, condição de conclusão (ação feita) e alvo de interface (id de elemento que a UI vai destacar).
- Um passo ativo por vez; concluir ou dispensar avança; dispensar o tutorial inteiro; progresso no campo criado pela T-079. Sobrevive ao Reboot; Novo jogo zera.
- API: passo atual, concluir, dispensar passo, dispensar tudo; evento de mudança.
- Textos pt-BR e en curtos.
- Testes: ordem, ativação por marco, conclusão, dispensa, Reboot, recarga.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, mais a lista de alvos de interface para o AG04. Não commitar.
