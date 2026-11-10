# BRF-015 · AG07 · Executar o roteiro manual do M1

- **Task:** T-048 (marco M1)
- **Dono:** AG07
- **Depende de:** T-047 (feita)
- **Pode escrever em:** `docs/AG07/`

## Objetivo

Executar de verdade o roteiro `docs/AG07/roteiro-qa-m1.md` no navegador e registrar o resultado de cada passo.

## Contexto

Servidor: `.claude/launch.json` (configuração `dev`, porta 5173). Navegador embutido (`mcp__Claude_Browser__*`): a pane pode estar oculta, então `requestAnimationFrame` não dispara e a tela pode não redesenhar; nesse caso confirme pelo estado salvo em IndexedDB (`byte-corp-idle` / `kv` / `save`) e por `read_page`/`get_page_text`. Use `resize_window` para 1280 px e 375 px. Passos 16 (item oculto some) e 28 (aba em segundo plano): o comportamento atual é o esperado do M1; registre o que acontece, sem tratar como defeito.

## Escopo

- Faz: iniciar o servidor, partir de estado limpo quando o passo exigir (apagar o banco `byte-corp-idle` pelo console), executar todos os 29 passos nas duas larguras, escrever `docs/AG07/resultado-qa-m1.md` com tabela passo, resultado (passou, falhou, não executável e por quê) e evidência curta; listar defeitos com passos para reproduzir.
- Ao terminar: encerrar o servidor e restaurar o tamanho da janela (preset desktop).
- Não faz: corrigir código, alterar qualquer arquivo fora de `docs/AG07/`.

## Critério de pronto

- [ ] Todos os passos têm resultado registrado; passos que não puderem ser executados têm o motivo.
- [ ] Defeitos listados (ou "nenhum") na entrega.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, e a lista de defeitos. Não commitar.
