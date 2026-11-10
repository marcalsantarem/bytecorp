# Backlog

Mantido pelo AG00. Status: a fazer, pronta para briefing, em andamento, em validação, feita, bloqueada.

## Marco atual: M0 Fundação (fechamento)

| ID | Task | Dono | Depende de | Status |
|---|---|---|---|---|
| T-001 | Implementação do M0 (núcleo, i18n, catálogos, save) | AG00, antes do acordo de processo | — | feita |
| T-002 | Expor a versão do `package.json` para o app e definir a versão do M0 | AG03 | A-03 | bloqueada |
| T-003 | Mostrar a versão no título da aba e no cabeçalho | AG04 | T-002 | bloqueada |
| T-004 | `netlify.toml` com build e publicação de `dist/` | AG03 | — | pronta para briefing |
| T-005 | PR `dev` → `main` e tag do M0 | AG00 | T-003, T-004, pedido do usuário | a fazer |

## Depois

| Task | Marco | Dono provável |
|---|---|---|
| Salvar após compras e ações importantes (perda observada ao recarregar logo após clicar) | M1 | AG03 |
| Dividir os dicionários de i18n por domínio (interface e conteúdo) para separar a posse entre AG04 e AG07 | M1 | AG03 |
| Parar o relógio e salvar ao trocar de jogo pela tela de save corrompido (sessão nova não é encerrada no desmonte) | M1 | AG03 |
| Testes de componentes React | M1 | AG04 |
