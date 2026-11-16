# BRF-057 · AG04 · Árvore Quantum na interface (1): visual

- **Task:** T-042 (marco M3)
- **Dono:** AG04
- **Depende de:** T-036, T-039, T-041 (feitas)
- **Pode escrever em:** `src/ui/`, `src/i18n/ui/`. Não editar `src/core`.

## Objetivo

Tela da árvore Quantum (Bíblia 10): mapa com linhas neon entre nós, pan e zoom, seleção de nó. Painel e compra ficam para a T-043.

## Contexto

Dados: `QUANTUM_NODES` em `src/core/catalog/quantum.ts` (`id`, `path` alpha/beta/gamma, `position` x/y em grade, pré-requisitos, `icon`; textos `quantum.<id>.name|desc`), 13 nós, ícones Lucide (confirmar que todos estão no `iconMap`; adicionar os que faltarem). Estado: `engine.state.meta.quantumNodes` (níveis), `engine.quantumNodeInfo(id)` (status), `meta.quantumCores`. O botão "Quantum Tree" do rodapé (`src/ui/layout/Panels.tsx`) está desabilitado: habilitar e abrir a tela (modal grande ou painel de tela cheia; escolher o mais simples e coerente com o layout).

## Escopo

- Mapa em SVG/HTML: nós por posição, cor por caminho (alpha ciano, beta magenta, gamma outra cor do tema), estado visual (bloqueado, disponível, comprado em parte, máximo), linhas entre pré-requisito e nó com brilho neon quando o pré-requisito está cumprido, nível atual "n/máx" no nó, saldo de cores no topo.
- Pan (arrastar com mouse e toque) e zoom (roda, pinça e botões + e −), com limites; enquadramento inicial centralizado.
- Selecionar nó destaca e guarda o id selecionado (o painel de detalhes é a T-043; aqui só um espaço reservado simples).
- Fechar com botão e Esc; acessível por teclado (nós focáveis, Enter seleciona).
- Textos em `src/i18n/ui/` (pt-BR e en), estilo neon do projeto, mobile 375 px e desktop.
- Testes de componente (jsdom): renderiza os nós do catálogo, seleção, estados bloqueado/disponível, zoom por botões.
- **Também:** verificar no navegador (1280x720 e 375) a janela de Reboot da T-041 e a nova tela, com um save semeado em IndexedDB (`byte-corp-idle` / `kv` / `save`) com Bytes altos; relatar com capturas descritas. Corrigir defeitos visuais da janela de Reboot.
- Não faz: compra, painel de detalhes, reset (T-043).

## Critério de pronto

- [ ] lint, typecheck, test e build passam; verificação visual relatada.

## Entrega

Responder ao AG00 com: **entregue, validação, suposições, não testado, próximo passo**. Não commitar.
