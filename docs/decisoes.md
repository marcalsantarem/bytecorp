# Decisões

Registro do AG00. Vale abaixo do usuário e da Bíblia, acima dos documentos dos agentes.

## Tomadas

| ID | Data | Decisão | Origem |
|---|---|---|---|
| D-01 | 2026-11-10 | Stack de ferramentas: Vite, TypeScript estrito, Vitest, ESLint, Tailwind 4 configurado por CSS. | M0 |
| D-02 | 2026-11-10 | Números grandes com `break_infinity.js` (`Decimal`). Grandezas econômicas em `Decimal`; contagens e níveis em `number`. | M0 |
| D-03 | 2026-11-10 | Protótipo `cyber_corp_node_tycoon.html` é só referência; o projeto começou do zero. | Usuário |
| D-04 | 2026-11-10 | Eventos ficam no M7, depois da primeira versão jogável e antes do beta. | AG00, assumida |
| D-05 | 2026-11-10 | Processo de trabalho, time e Git conforme [00_processo.md](00_processo.md). | Usuário |
| D-06 | 2026-11-10 | Configurações (idioma) salvas fora do save do jogo; sobrevivem a "Novo jogo". | M0 |
| D-08 | 2026-11-10 | Referência visual em `docs/referencias/` (só inspiração). O acabamento neon (painéis chanfrados, barra colorida nos cartões) entra já nas tasks T-011 e T-012 do M1; onde diverge da Bíblia, vale a Bíblia. | Usuário |
| D-11 | 2026-11-12 | Idioma único pt-BR até a janela de configurações (M5): o seletor de idioma sai da interface e o idioma do navegador e o salvo são ignorados; a infraestrutura de i18n e os textos em inglês continuam no código. No lugar do seletor entra um botão Reset (com confirmação em dois passos) que reinicia o save por completo, para testar a evolução do jogo. | Usuário |
| D-10 | 2026-11-11 | Fórmula global de produção em três camadas: `P0 × (1 + Σ melhorias e agentes) × (1 + Σ quântico) × Π temporários`. P0 = soma dos equipamentos. Dentro da camada os bônus somam; entre camadas multiplicam. O mesmo multiplicador global vale para produção passiva e clique. Clique: `(base + fixos) × (1 + % de clique) × multiplicador global`, crítico sobre o resultado. Bônus de agente = `quantidade × bônus base × (1 + crescimento por nível × (nível − 1))`, na camada de melhorias e agentes, com parâmetros por agente no catálogo. Agente que afeta outros agentes fica fora do catálogo do M2. Interação de aceleradores com bônus temporários fica para o M4. | Usuário |
| D-09 | 2026-11-10 | Categorias de equipamento em pt-BR traduzidas: Rede, Processamento, Armazenamento, Refrigeração, Infraestrutura; o idioma en mantém os nomes em inglês. | Usuário |
| D-07 | 2026-11-10 | Versões: marco Mn fecha como `v0.(n+1).0`. M0 = v0.1.0, beta (M8) = v0.9.0, 1.0 fica para o lançamento. | Usuário |

## Provisórias

| ID | Decisão | Trocar quando |
|---|---|---|
| P-01 | Unidades depois de YB: RB e QB (SI ronna e quetta), depois notação científica. | Usuário definir as unidades fictícias (Bíblia 4.7). |
| P-05 | 12 melhorias comuns (5 de produção global, 4 de clique, 3 de desconto) com custo igual a 2x o desbloqueio, de 50 a 1e13 Bytes, até Quantum Facility; descontos das melhorias somam no máximo 4,5 pontos percentuais. Detalhes em `docs/AG07/melhorias-m2.md`. Ainda sem melhorias para Mega Corporation. | Balanceamento do AG07 (T-031 e M8). |
| P-04 | Efeitos de crítico: a chance efetiva é a base mais a soma de `criticalChancePercent` em pontos percentuais, limitada a 0 a 1; o multiplicador crítico é a base mais a soma de `criticalMultiplier` (adição). Efeitos secundários dos agentes somam nas mesmas camadas das melhorias. | Teto e interação com a árvore Quantum em A-06 e M3. |
| P-03 | 5 agentes (ECHO_AI, KAI_VER_3, ATLAS_CORE, NEO_GEN_5, SPECTRE_X), custo de contratação com fator 1,25 e de nível com 1,8, valores de bônus e desbloqueio em `docs/AG07/agentes-m2.md`. | Balanceamento do AG07 (T-031 e M8). |
| P-02 | 25 equipamentos (5 por categoria) cobrindo até Corporate Network, com fatores de 1,15 a 1,25 e desbloqueio igual à metade do custo base; limites de Bytes dos estágios (1e4 a 1e18) mantidos e documentados em `docs/AG07/equipamentos-m2.md`. Pendente: equipamentos de Quantum Facility e Mega Corporation (a simulação mostra 64,6 min até Quantum Facility e 85,5 h até Mega Corporation) e revisão do limite de 1e18. | Balanceamento do AG07 (M2 e M8). |

## A definir

Tasks que dependem destes itens ficam bloqueadas.

| ID | Questão | Bloqueia |
|---|---|---|
| A-06 | Teto para o desconto de custo acumulado (agentes, melhorias e árvore Quantum) e para a chance de crítico acumulada (hoje a soma é sem limite; a base do crítico depende de A-04). | M4 (decidir antes dele); o M2 segue sem teto |
| A-07 | Relevância do ganho fixo por clique (`clickFlat`): perde peso depois de cerca de 10 min de jogo e todas as melhorias de clique ficam disponíveis até 7 min. Decidir se `clickFlat` escala com a produção ou se fica como está. | Nada; revisar no balanceamento do M8 |
| A-04 | Valores iniciais de chance e multiplicador do clique crítico (Bíblia 28.1). | Nada: T-007 usa valores provisórios configuráveis até a definição |
| A-02 | Fórmula de Quantum Cores e condição para habilitar o Reboot (Bíblia 9.4, 9.6, 28.2). | M3 |