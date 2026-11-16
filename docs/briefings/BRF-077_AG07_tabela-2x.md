# BRF-077 · AG07 · Tabela de aceleradores 2x, sem Reboot

- **Task:** T-074b (ajuste decidido na D-18)
- **Dono:** AG07
- **Pode escrever em:** `src/core/catalog/accelerators.ts` e seu teste, `src/i18n/content/` (se preciso), `docs/AG07/`, `tests/tempo-m4.test.ts`. Mínimo em `src/core/progression/` só se a remoção da concessão de Reboot exigir (AG02; relatar).

## Escopo

- Aplicar a D-18 (`docs/decisoes.md`): concessões por estágio todas 2x (Garage 15, Startup 15, Data Center 30, Corporate 15, Quantum 15, Mega 30 min) e **nenhuma** concessão no Reboot (tabela de Reboot vazia; o mecanismo de concessão por `reboot` continua existindo para eventos futuros). Os itens 5x e de 60 min permanecem no catálogo, sem concessão por marco. Ajustar `validateAccelerators` (hoje exige que... verificar se bloqueia Reboot vazio) e os testes de catálogo e de progressão que assumiam a tabela antiga.
- Atualizar `docs/AG07/aceleradores-m4.md` com a nova tabela e a justificativa.
- Medir com o motor real (`tests/tempo-m4.test.ts`, `TEMPO_REPORT=1` para o relatório longo): run 1 ao receber e encadeando, árvore completa em Reboots e horas ao receber e encadeando; meta: árvore em cerca de 2,4 h (-45%) ao receber. Atualizar as faixas protegidas do teste sem afrouxar além do necessário e relatar os números. Se ficar fora de ±15% da meta, propor ajuste de durações com números, sem aplicar.
- Atualizar o resultado em `docs/AG07/resultado-qa-m4.md` com uma seção curta "Ajuste D-18".
- Não faz: regras, interface.

## Critério de pronto

- [ ] lint, typecheck, test e build passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
