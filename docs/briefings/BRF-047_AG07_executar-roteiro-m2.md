# BRF-047 · AG07 · Executar o roteiro manual do M2

- **Task:** T-060 (marco M2)
- **Dono:** AG07
- **Depende de:** T-031 e T-064 (feitas)
- **Pode escrever em:** `docs/AG07/`

## Objetivo

Executar de verdade o roteiro `docs/AG07/roteiro-qa-m2.md` no navegador, em 1280 px e 375 px, e registrar o resultado de cada passo.

## Contexto

Servidor: `.claude/launch.json` (configuração `dev`, porta 5173). Navegador embutido (`mcp__Claude_Browser__*`): a pane pode estar oculta, então `requestAnimationFrame` não dispara e a tela só redesenha depois de uma captura de tela (que às vezes dá timeout e precisa de uma segunda tentativa); leia o estado também pelo DOM (`read_page`, `javascript_tool`) e pelo save no IndexedDB (`byte-corp-idle` / `kv` / `save`); crie estados de teste editando o save e recarregando. Use `resize_window` para 1280 px e 375 px (a pane "desktop" pode ter menos de 1024 px de largura e cair no layout de celular: para o layout de três colunas use 1280x720). Modelo de execução: `docs/AG07/resultado-qa-m1.md`.

O roteiro foi escrito **antes** de várias mudanças. Valem hoje, e prevalecem sobre o texto do roteiro quando divergirem (registre cada divergência no resultado):
- O seletor de idioma saiu; no lugar há o botão Reset com confirmação em dois passos, e o idioma é só pt-BR (D-11).
- No celular as cinco abas de categoria ficam numa linha só, apenas com ícone (o nome da categoria ativa aparece abaixo); o ponto na aba só marca equipamento novo: desbloqueado, comprável e sem nenhuma unidade comprada (T-057 e T-058).
- A cena do núcleo encolhe em telas baixas para o botão de clique caber sem rolar em 1280x720 (T-055).
- O desconto de custo tem teto de 50 pp e a chance de crítico de 25% (D-13).
- A curva foi reequilibrada (D-13 e D-14): valores de agentes e melhorias mudaram; confira os números esperados lendo o catálogo (`src/core/catalog/`) e a fórmula D-10, não pelos números antigos do roteiro.
- O PWA: o navegador embutido não registra service worker; confira só o manifesto (`/manifest.webmanifest`), os ícones declarados (200 e tamanho certo) e as tags do `<head>`.

## Escopo

- Faz: iniciar o servidor, partir de estado limpo quando o passo exigir (apagar o banco `byte-corp-idle` pelo console), executar todos os passos nas duas larguras, escrever `docs/AG07/resultado-qa-m2.md` com tabela por passo (passou, falhou, não executável e por quê), a evidência curta de cada um e as divergências do roteiro; listar defeitos com gravidade e passos para reproduzir.
- Ao terminar: apagar o banco de teste, restaurar o tamanho da janela (preset desktop) e encerrar o servidor.
- Não faz: corrigir código, alterar qualquer arquivo fora de `docs/AG07/`.

## Critério de pronto

- [ ] Todos os passos têm resultado registrado, com o motivo quando não executáveis.
- [ ] Defeitos listados (ou "nenhum") na entrega.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**, e a lista de defeitos. Não commitar.
