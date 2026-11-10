# Backlog

Mantido pelo AG00. Status: a fazer, pronta para briefing, em andamento, em validação, feita, bloqueada.

## Marco atual: M1 Loop básico (v0.2.0)

| ID | Task | Dono | Depende de | Status |
|---|---|---|---|---|
| T-006 | Dividir os dicionários de i18n em interface (posse do AG04) e conteúdo (posse do AG07), sem mudar o uso de `MessageKey` | AG03 | — | feita (BRF-004) |
| T-007 | Clique com crítico (Bíblia 5.4 e 5.5): fixos, percentuais, chance e multiplicador crítico, sorteio injetável para testes, evento `click` com `critical`, estatística de críticos | AG01 | — | feita (BRF-005) |
| T-008 | Equipamentos (Bíblia 4.3, 4.6, 6.3, 6.6): custo `C_base × k^N` inteiro com desconto e mínimo de 1 Byte, compra x1/x10/MAX, estado oculto/revelado/desbloqueado, evento de compra e dados prontos para a loja | AG01 | T-007 (mesmos arquivos do engine) | feita (BRF-007) |
| T-009 | Salvar logo após compras, além do autosave (Bíblia 21.2) | AG03 | T-008 | a fazer |
| T-010 | Layout responsivo (Bíblia 15.1 a 15.3 e 15.6): três colunas no desktop, abas inferiores no mobile, rodapé com Reboot, Árvore Quantum e Conquistas desabilitados; corrigir o encerramento da sessão aberta pela tela de save corrompido | AG04 | T-006 | feita (BRF-008) |
| T-011 | Loja de equipamentos (Bíblia 6.4 a 6.6): abas por categoria no desktop, lista compacta no mobile, cartões completos, seletor x1/x10/MAX por cartão só na sessão | AG04 | T-008, T-010 | a fazer |
| T-012 | Botão de clique abaixo do núcleo, com animação de compressão, valor por clique e montagem da cena do núcleo | AG04 | T-007, T-010, T-013 | a fazer |
| T-013 | Cena provisória do núcleo em Canvas 2D (Bíblia 5.2): anéis, brilho neon, pulso no clique e efeito intensificado no crítico, exposta como `mountCoreScene(canvas, events)` | AG05 | — | feita (BRF-006) |
| T-014 | Catálogo do M1: 3 equipamentos por categoria (15), textos pt-BR e en, valores provisórios com fator 1,15 | AG07 | T-006 | feita (BRF-009) |
| T-015 | QA do M1: testes de integração (MAX respeita o saldo, custos inteiros ≥ 1, crítico com sorteio fixo, save após compra) e roteiro manual desktop e mobile | AG07 | T-009, T-011, T-012, T-014 | a fazer |
| T-016 | Versão 0.2.0 no `package.json` e no `package-lock.json` | AG03 | T-015 | a fazer |
| T-017 | PR `dev` → `main` e tag `v0.2.0` | AG00 | T-016, pedido do usuário | a fazer |

Ondas possíveis em paralelo (arquivos diferentes):

1. T-006, T-007, T-013
2. T-008, T-010, T-014
3. T-009, T-011, T-012
4. T-015, depois T-016 e T-017

## Marcos fechados

| Marco | Versão | Tasks |
|---|---|---|
| M0 Fundação | v0.1.0 | T-001 a T-005 |

## Depois

| Item | Marco | Dono provável |
|---|---|---|
| Testes de componentes React (exige ambiente DOM no Vitest) | M2 | AG03 e AG04 |
