# Backlog

Mantido pelo AG00. Status: a fazer, pronta para briefing, em andamento, em validação, feita, bloqueada.

## Marco atual: M1 Loop básico (v0.2.0)

| ID | Task | Dono | Depende de | Status |
|---|---|---|---|---|
| T-006 | Dividir os dicionários de i18n em interface (posse do AG04) e conteúdo (posse do AG07), sem mudar o uso de `MessageKey` | AG03 | — | feita (BRF-004) |
| T-007 | Clique com crítico (Bíblia 5.4 e 5.5): fixos, percentuais, chance e multiplicador crítico, sorteio injetável para testes, evento `click` com `critical`, estatística de críticos | AG01 | — | feita (BRF-005) |
| T-008 | Equipamentos (Bíblia 4.3, 4.6, 6.3, 6.6): custo `C_base × k^N` inteiro com desconto e mínimo de 1 Byte, compra x1/x10/MAX, estado oculto/revelado/desbloqueado, evento de compra e dados prontos para a loja | AG01 | T-007 (mesmos arquivos do engine) | feita (BRF-007) |
| T-009 | Salvar logo após compras, além do autosave (Bíblia 21.2) | AG03 | T-008 | feita (BRF-010) |
| T-010 | Layout responsivo (Bíblia 15.1 a 15.3 e 15.6): três colunas no desktop, abas inferiores no mobile, rodapé com Reboot, Árvore Quantum e Conquistas desabilitados; corrigir o encerramento da sessão aberta pela tela de save corrompido | AG04 | T-006 | feita (BRF-008) |
| T-011 | Loja de equipamentos (Bíblia 6.4 a 6.6): abas por categoria no desktop, lista compacta no mobile, cartões completos, seletor x1/x10/MAX por cartão só na sessão | AG04 | T-008, T-010 | feita (BRF-011); inclui o acabamento neon da referência (D-08) |
| T-012 | Botão de clique abaixo do núcleo, com animação de compressão, valor por clique e montagem da cena do núcleo | AG04 | T-007, T-010, T-011, T-013 | feita (BRF-012) |
| T-013 | Cena provisória do núcleo em Canvas 2D (Bíblia 5.2): anéis, brilho neon, pulso no clique e efeito intensificado no crítico, exposta como `mountCoreScene(canvas, events)` | AG05 | — | feita (BRF-006) |
| T-014 | Catálogo do M1: 3 equipamentos por categoria (15), textos pt-BR e en, valores provisórios com fator 1,15 | AG07 | T-006 | feita (BRF-009) |
| T-015 | QA do M1: testes de integração (MAX respeita o saldo, custos inteiros ≥ 1, crítico com sorteio fixo, save após compra) e roteiro manual desktop e mobile | AG07 | T-009, T-011, T-012, T-014 | feita (BRF-013); achou o defeito D-1 (T-047) |
| T-047 | Corrigir o custo unitário para inteiro exato (defeito D-1 da QA) | AG01 | T-015 | feita (BRF-014) |
| T-048 | Executar o roteiro manual `docs/AG07/roteiro-qa-m1.md` em 1280 px e 375 px (a QA não o executou) | AG07 | T-047 | feita (BRF-015); achou D1 a D5 |
| T-049 | Ajustes no mobile: alvos de toque de 44 px, truncamentos e nome acessível do seletor de idioma (D2, D4, D5) | AG04 | T-048 | feita (BRF-016); conferida pelo AG00 em 375 px com Bytes grandes |
| T-050 | Rótulos das categorias de equipamento em pt-BR (D1) | AG07 | A-05 (resolvida) | feita (BRF-017) |
| T-016 | Versão 0.2.0 no `package.json` e no `package-lock.json` | AG03 | T-049, T-050 | feita (BRF-018) |
| T-017 | PR `dev` → `main` e tag `v0.2.0` | AG00 | T-016, pedido do usuário | feita (PR #2, tag v0.2.0) |

Ondas possíveis em paralelo (arquivos diferentes):

1. T-006, T-007, T-013
2. T-008, T-010, T-014
3. T-009, T-011, T-012
4. T-015, depois T-016 e T-017

## Próximos marcos (quebrados antecipadamente a pedido do usuário)

Um agente roda uma task por vez. Tasks do mesmo dono em arquivos em comum seguem em sequência. Tasks marcadas "bloqueada" esperam decisão em "A definir" ([decisoes.md](decisoes.md)).

### M2 Expansão da execução (v0.3.0)

| ID | Task | Dono | Depende de | Status |
|---|---|---|---|---|
| T-018 | Estágios corporativos: avanço de `run.stage` por requisito, evento `stageChanged` | AG01 | — | feita (BRF-019) |
| T-019 | Agentes (regras): contratação individual, custo com desconto, nível coletivo uma unidade por vez, eventos | AG01 | T-018 | feita (BRF-020) |
| T-020 | Melhorias comuns (regras): desbloqueio por Bytes da execução, compra única, eventos | AG01 | T-019 | feita (BRF-027) |
| T-021 | Fórmula global de produção: ligar bônus de agentes e melhorias, rastrear origem para estatísticas | AG01 | T-020 (fórmula em D-10) | feita (BRF-028) |
| T-022 | Save: revisar o formato e migrar se mudar (`SAVE_VERSION` 2), salvar após contratar, evoluir e comprar | AG03 | T-019, T-020 | feita (BRF-030) |
| T-023 | Catálogo de agentes (4 a 5) com textos nos dois idiomas | AG07 | T-019 | feita (BRF-022) |
| T-024 | Catálogo de melhorias comuns (cerca de 12) com textos | AG07 | T-020, T-023 | feita (BRF-029); ícones novos listados em `docs/AG07/melhorias-m2.md` para a T-027 |
| T-025 | Catálogo: equipamentos extras por estágio e revisão dos limites dos estágios | AG07 | T-018 (T-024 dispensada por ordem do usuário; revisar depois) | feita (BRF-021) |
| T-051 | Acrescentar ao mapa de ícones os 10 ícones dos equipamentos novos (`radio-tower`, `globe`, `brain-circuit`, `server-cog`, `database-zap`, `layers`, `thermometer-snowflake`, `sun`, `atom`, `orbit`); hoje cai no ícone padrão | AG04 | T-025 | feita (BRF-023); inclui os 3 ícones dos agentes |
| T-052 | Equipamentos de Quantum Facility e Mega Corporation e revisão do limite de 1e18 (salto de 64,6 min para 85,5 h na simulação) | AG07 | T-023, T-024 | feita (BRF-039) |
| T-059 | Melhorias comuns para Mega Corporation (as 12 atuais vão só até Quantum Facility): desbloqueios e efeitos de produção e clique para o último estágio | AG07 | T-052 | feita (BRF-041) |
| T-026 | Painel de agentes: cartões completos, contratar e evoluir | AG04 | T-019, T-023 | feita (BRF-024); botões corrigidos após defeito de custo cortado em 1024 px |
| T-027 | Painel de melhorias comuns: lista única por custo, comprada continua visível e desabilitada | AG04 | T-020, T-024, T-026 | feita (BRF-033) |
| T-028 | Indicador do estágio atual na interface; remover chave i18n sem uso | AG04 | T-018 | feita (BRF-031); corrigido o corte do topo na coluna central |
| T-055 | Compactar a cena do núcleo em telas baixas (1280x720): hoje o botão de clique fica 15 px cortado e a legenda do valor por clique exige rolagem | AG04 | T-028 | feita (BRF-032) |
| T-053 | `GameSession.reset()`: reiniciar o jogo e o save por completo, sem apagar as configurações | AG03 | — | feita (BRF-025) |
| T-054 | Botão Reset no lugar do seletor de idioma, idioma fixo em pt-BR (D-11) | AG04 | T-053 | feita (BRF-026) |
| T-056 | PWA: manifesto, ícone `>_` verde sobre preto, service worker com cache offline do shell, nome de atalho "ByteCorp Idle" (D-12) | AG03 | — | feita (BRF-034); teste de instalação em aparelho real pendente, com o usuário |
| T-057 | Categorias de equipamento em abas no mobile, com indicador de que há equipamento comprável | AG04 | — | feita (BRF-035 e BRF-036); no mobile as 5 abas ficam visíveis só com ícone, com o nome da ativa abaixo |
| T-058 | Ponto da aba de categoria só para equipamento novo (desbloqueado, comprável e sem nenhuma unidade comprada) | AG04 | T-057 | feita (BRF-037) |
| T-029 | Ambiente de teste de componentes React no Vitest | AG03 | — | feita (BRF-038) |
| T-030 | Testes de componentes: cartões da loja, de agentes e de melhorias | AG04 | T-027, T-029 | feita (BRF-040); 29 testes de componentes, nenhum defeito achado |
| T-031 | QA do M2: integração (descontos, MAX, agentes, melhorias, estágio, save e migração) e simulação da curva; escreve o roteiro manual do M2, sem executá-lo | AG07 | T-021, T-022, T-025, T-030 | feita (BRF-042): 32 testes de integração e simulação; achou a curva colapsando (Mega Corporation em 18,7 min contra 108 min sem bônus), em decisão A-08 |
| T-061 | Tetos de desconto de custo e de chance de crítico no núcleo (valores conforme A-06 e A-08), configuráveis, com testes | AG01 | A-06, A-08 | bloqueada |
| T-062 | Reequilibrar o catálogo (bônus dos agentes, custos, limites de estágio) para a curva-alvo e rodar a simulação de novo | AG07 | A-08, T-061 | bloqueada |
| T-060 | Executar o roteiro manual `docs/AG07/roteiro-qa-m2.md` em 1280 px e 375 px e registrar o resultado | AG07 | T-031, T-062 | a fazer |
| T-032 | Versão 0.3.0 | AG03 | T-031, T-060 | a fazer |
| T-033 | PR `dev` → `main` e tag `v0.3.0` | AG00 | T-032, pedido do usuário | a fazer |

### M3 Prestígio (v0.4.0), fecha a primeira versão jogável

| ID | Task | Dono | Depende de | Status |
|---|---|---|---|---|
| T-034 | Reboot (regras): reset da execução, preservação do permanente, contagem de reboots, evento; recompensa injetável | AG02 | M2 | a fazer |
| T-035 | Fórmula de Quantum Cores e condição para habilitar o Reboot | AG02 | T-034, A-02 | bloqueada |
| T-036 | Árvore Quantum (regras): nós, níveis um por vez, custo exponencial, pré-requisitos, reset com custo crescente | AG02 | T-034 | a fazer |
| T-037 | Aplicar os efeitos quânticos na fórmula de produção e no limite offline | AG01 | T-036, T-021 | bloqueada |
| T-038 | Save: revisar o formato, salvar logo após Reboot e reset da árvore | AG03 | T-034, T-036 | a fazer |
| T-039 | Catálogo da árvore Quantum: 3 caminhos, cerca de 12 nós, textos | AG07 | T-036 | a fazer |
| T-040 | Efeito de Reboot em Canvas 2D (2 a 3 s, pulável) | AG05 | T-034 | a fazer |
| T-041 | Janela de Reboot: estimativa, confirmação do que se perde e preserva, botão do rodapé | AG04 | T-035, T-040 | bloqueada |
| T-042 | Árvore Quantum na interface (1): visual com linhas neon, pan e zoom, seleção | AG04 | T-036, T-039, T-041 | a fazer |
| T-043 | Árvore Quantum na interface (2): painel lateral e inferior, compra, reset com confirmação | AG04 | T-042 | a fazer |
| T-044 | QA do M3: Reboot, árvore, save após Reboot e simulação de ciclos de prestígio | AG07 | T-037, T-038, T-043 | a fazer |
| T-045 | Versão 0.4.0 | AG03 | T-044 | a fazer |
| T-046 | PR `dev` → `main` e tag `v0.4.0` | AG00 | T-045, pedido do usuário | a fazer |

## Marcos fechados

| Marco | Versão | Tasks |
|---|---|---|
| M0 Fundação | v0.1.0 | T-001 a T-005 |

## Depois

| Item | Marco | Dono provável |
|---|---|---|
| `useEngineRevision` só re-renderiza em `tick`, `click` e `stateReplaced`; assinar também `purchase`, `agentHired`, `agentLeveled` e `upgradePurchased` para a tela atualizar na hora, sem depender do relógio | M3 | AG04 |
| A altura da cena do núcleo usa a constante `25rem` para o resto da coluna; se o indicador de estágio crescer (texto do próximo estágio em mais linhas), o botão de clique volta a cortar em telas baixas | M6 | AG04 |
| Remover a chave i18n sem uso `core.infraPlaceholder` | M2 | AG04 |
| Texto flutuante de ganho a cada clique e som do clique | M6 | AG04 e AG05 |
