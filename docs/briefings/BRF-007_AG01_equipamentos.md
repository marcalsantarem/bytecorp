# BRF-007 · AG01 · Equipamentos: custo, compra e desbloqueio

- **Task:** T-008 (marco M1)
- **Dono:** AG01
- **Depende de:** T-007 (feita)
- **Pode escrever em:** arquivos na raiz de `src/core/`, `src/core/economy/`, `src/core/catalog/types.ts` e seus testes

## Objetivo

Regras de equipamentos no núcleo: custo, compra x1/x10/MAX e estados de desbloqueio, prontos para a loja (T-011) consumir.

## Contexto

Bíblia 4.3, 4.4, 4.6, 6.3, 6.6.

- Custo da próxima unidade: `C_base × k^N` (N = quantidade já comprada).
- Desconto: soma aditiva de `costDiscountPercent` ativos, sem teto, aplicada ao custo de cada unidade antes de qualquer cálculo de quantidade. Custo por unidade = `floor(C × (1 − d/100))`, nunca menor que 1 Byte. Ainda não há fontes de desconto (M2): crie `costDiscountPercent(state, catalog)` devolvendo 0, como `clickFlatBonus`.
- Compra x1, x10 ou MAX. MAX compra o maior número possível com o saldo atual, considerando o desconto; sem reserva de saldo. Compra imediata, sem confirmação.
- Estado por equipamento: `hidden`, `revealed` (mostra nome, ícone e requisito, não compra) ou `unlocked`, a partir de `unlock` e `reveal` do catálogo (`Requirement`: `always`, `bytesEarnedInRun`, `stageReached`, `equipmentOwned`). Equipamento não desbloqueado não pode ser comprado.
- Produção unitária exibida = `baseProduction × globalMultiplier` (já com bônus).
- Valores de custo em `Decimal`; quantidades em `number`.

## Escopo

- Faz: funções puras em `src/core/economy/` (custo unitário, custo e quantidade para x1/x10/MAX com soma exata e checagem final, avaliação de `Requirement`, estado do equipamento); no `GameEngine`: `buyEquipment(id, mode)` que debita, atualiza `run.equipment`, chama `invalidate()` e emite o evento `purchase` (id, quantidade, custo total; novo em `events.ts`); consulta `equipmentInfo(id)` e `equipmentList()` na ordem do catálogo, com estado, quantidade, custo e quantidade comprável por modo, produção unitária. Testes.
- Não faz: dados do catálogo (AG07), interface, salvar após compra (T-009), estágios corporativos (M2).
- Os testes usam um catálogo pequeno definido no próprio arquivo de teste, não o `CATALOG`, porque o AG07 está alterando os dados em paralelo.

## Critério de pronto

- [ ] Testes: custo cresce com N; custo inteiro e nunca abaixo de 1 mesmo com desconto de 150%; MAX nunca gasta mais que o saldo e uma unidade a mais não caberia; x10 recusa se não houver saldo para todas as dez (ou define e documenta o comportamento); equipamento não desbloqueado não compra; estado hidden, revealed e unlocked mudam com `bytesEarnedInRun`.
- [ ] Nada em `src/core` importa interface (o lint garante); o formato do save não muda.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
