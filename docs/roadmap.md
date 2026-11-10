# Roadmap

Cada marco entrega um incremento jogável e integrado (Bíblia 25.3) e fecha com PR `dev` → `main`, tag e versão no título do jogo. Tasks só são criadas quando o marco começa ([backlog.md](backlog.md)).

Versões: marco Mn → `v0.(n+1).0` (D-07 em [decisoes.md](decisoes.md)).

| Marco | Versão | Status | Agentes |
|---|---|---|---|
| M0 Fundação | v0.1.0 | Fechado | AG01, AG03, AG04 |
| M1 Loop básico | v0.2.0 | Pronto para PR e tag | AG01, AG03, AG04, AG05, AG07 |
| M2 Expansão da execução | v0.3.0 | — | AG01, AG04, AG07 |
| M3 Prestígio (primeira versão jogável) | v0.4.0 | — | AG02, AG04, AG07 |
| M4 Tempo | v0.5.0 | — | AG02, AG04 |
| M5 Metajogo e fluxo | v0.6.0 | — | AG02, AG03, AG04 |
| M6 Apresentação | v0.7.0 | — | AG05 |
| M7 Eventos | v0.8.0 | — | AG02, AG04 |
| M8 Beta | v0.9.0 | — | todos |

## M0 Fundação

Bíblia 4.1, 4.7, 16.2, 24.

- Projeto Vite, React, TypeScript, Tailwind, Vitest e ESLint.
- Game Core: estado (run, meta, stats), ciclo por delta time, barramento de eventos.
- Números grandes (`Decimal`) e formatação base 1000 por idioma.
- i18n pt-BR e en.
- Esquema dos catálogos com validação; estágios e equipamentos provisórios.
- Save versionado em IndexedDB, autosave, tela de save corrompido.
- Fechamento: deploy da `dev` no Netlify, versão no título, PR e tag.

## M1 Loop básico

Bíblia 5, 6, 15.1 a 15.4, 21.

- Clique com crítico (fixos, percentuais, multiplicador crítico).
- Equipamentos: custo exponencial, descontos, compra x1/x10/MAX por cartão, desbloqueio e visibilidade.
- Produção passiva pela soma dos equipamentos. Os bônus, e portanto a fórmula global (A-01), entram no M2.
- Layout responsivo: três colunas no desktop, abas no mobile; loja por categoria.
- Cena provisória com o núcleo visual.
- Save em momentos importantes (compras), além do autosave.

## M2 Expansão da execução

Bíblia 7, 8, 1.2, 6.3.

- Agentes: contratação individual, nível coletivo, bônus principal e secundários.
- Melhorias comuns: desbloqueio por Bytes gerados na execução, compra única.
- Estágios corporativos e transição entre eles.
- Catálogo intermediário de equipamentos, agentes e melhorias.

## M3 Prestígio

Bíblia 9, 10. Fecha a primeira versão jogável (25.1).

- Reboot com estimativa, confirmação (o que perde e o que preserva) e animação pulável.
- Quantum Cores (depende de A-02).
- Árvore Quantum com três caminhos, pan, zoom, painel de detalhes, compra por nível e reset com custo crescente.

## M4 Tempo

Bíblia 13, 14.

- Bônus temporários e aceleradores 2x e 5x, inventário, substituição com escolha de perder ou armazenar.
- Indicador persistente com aviso de encerramento.
- Produção offline por intervalos, limite de 8 h, resumo de retorno.

## M5 Metajogo e fluxo

Bíblia 11, 15.5 a 15.8, 16.1, 17, 22.

- Conquistas com raridades, secretas, recompensas e fila de notificações.
- Estatísticas em modal, tela inicial, configurações completas, tutorial contextual, notificações locais.

## M6 Apresentação

Bíblia 18, 19, 20. Pode correr em paralelo a M4 e M5.

- Cena Three.js isométrica por estágio, agrupamento visual, partículas e fluxos de dados.
- Transições de estágio e de Reboot, qualidade adaptativa.
- Música por estágio em camadas e efeitos sonoros.

## M7 Eventos

Bíblia 12.

- Eventos com decisão, expiração, recompensas, integração com aceleradores, Reboot e offline, etapa do tutorial.

## M8 Beta

Bíblia 2, 25.2, 28.

- Catálogo completo e balanceado, acabamento responsivo, preparação para PWA, canal externo de feedback.

## Depois do beta

- Monetização (Bíblia 23); até lá, só os pontos de extensão.
- PWA instalável, Android, Steam, iOS.
