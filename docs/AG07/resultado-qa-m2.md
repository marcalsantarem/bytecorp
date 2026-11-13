# Resultado do QA manual do M2 (BRF-047 / T-060)

Execução: navegador embutido, `npm run dev` (porta 5173), versão exibida v0.3.0, 1280x720 e 375x812 (alturas baixas: 1280x500 e 375x600). Estados criados editando o save (`byte-corp-idle` / `kv` / `save`) e recarregando; banco apagado no início, no meio e no fim. Com a pane oculta o DOM só redesenha após uma captura de tela; a leitura foi feita por DOM, `get_page_text` e pelo save.

Legenda: P = passou, F = falhou, N = não executável (motivo), P* = passou com observação.

Números esperados vêm do catálogo atual (`src/core/catalog/`), não do texto do roteiro: ECHO_AI custo 1.500, fator 2, nível 6.000 (x3), +3 pp de clique, crescimento 0,25; KAI_VER_3 60 kB, fator 1,5, +0,2 pp global; ATLAS_CORE 40 MB, fator 1,5, -0,35 pp de custo.

| # | 1280 px | 375 px | Evidência |
|---|---|---|---|
| 1 | P | P | Jogo novo: "Nenhum agente disponível ainda." com Estatísticas; scrollWidth 1280 e 375. |
| 2 | P* | P* | ECHO_AI revelado com 3 kB gerados, "Desbloqueio: alcance o estágio Garage Company", sem botão. Mostra só nome e requisito; a especialidade não aparece (ver D1). |
| 3 | P | P | Com 10 kB gerados: ECHO_AI desbloqueado, "Contratar 1,5 kB"; desabilitado com 1.499 B e habilitado com saldo. Estágio mudou para Garage Company. |
| 4 | P | P | Bytes 10.000 -> 8.500; contratados 1; Nível 1; "+3% de ganho por clique"; próximo custo 3 kB (fator 2 do catálogo, não 1,25 do roteiro). |
| 5 | P | P | Evoluir 6 kB (10.000 -> 2.500 no total); nível 2; bônus 3 x 1,25 = +3,75%; próximo nível 18 kB (x3); barra 14% = 2.500/18.000; Evoluir desabilitado sem saldo. |
| 6 | P | P | Clique "+1 B" -> "+1,03 B" (nível 2 sem melhorias: 1 x 1,0375, exibido truncado). Com macro + ECHO nível 2: 2 x 1,0375 = 2,07 (truncado). |
| 7 | P | P | Ordem ECHO_AI, KAI_VER_3, ATLAS_CORE, NEO_GEN_5 (custo crescente). Com 100 roteadores (50 B/s): KAI -> 50,1 B/s (+0,2%), próximo 90 kB (x1,5). ATLAS: roteador 17,61 MB -> 17,55 MB (-0,35%), KAI 90 kB -> 89,68 kB, ATLAS 60 MB -> 59,79 MB; custos das melhorias inalterados (50 B, 400 B...). |
| 8 | N/A | P | Contratar e Evoluir 150x44 px, sem rolagem horizontal. |
| 9 | P | P | Melhorias por custo crescente, todas "Bloqueada" com "Desbloqueio: gere N B nesta rodada". |
| 10 | P | P | 5 kB de saldo com 24 B gerados: macro continua bloqueada. Com 25 B gerados: só Script de macro disponível, as demais bloqueadas. |
| 11 | P | P | Custo 50 B debitado sem desconto; "Comprada" e botão inativo; clique +1 -> +2 B; segunda tentativa não debita. Em 375 px botão 307x44. |
| 12 | P | P | Com 30 B: Comprar desabilitado; clicar não altera nada. |
| 13 | P | P | Overclock básico (400 B): 5 -> 5,5 B/s (+10%, valor novo do catálogo; o roteiro dizia 5%). Saldo -400. |
| 14 | P | P | "Solo Hacker / Próximo: Garage Company (gere 10 kB nesta rodada)". Em Mega Corporation (2 EB gerados) só o nome, sem "Próximo". |
| 15 | P | P | Com 9.990 B gerados e 5 B/s: após ~3 s indicador passou a Garage Company sem recarregar (tempo de página contínuo) e ECHO_AI passou de revelado a desbloqueado. |
| 16 | P | P | 1280: 5 abas com ícone e nome. 375: 5 abas 62x44 px numa linha (x de 25 a 350), só ícone com `aria-label` traduzido e nome da ativa abaixo; scrollWidth 375. |
| 17 | P* | P* | Com 10 kB: pontos "novo equipamento disponível" (10 px) em Processamento e Armazenamento; Refrigeração e Infraestrutura sem ponto (não compráveis). Comprar o único item novo de uma categoria (Rede) removeu o ponto. O ponto não some ao apenas abrir a aba, só ao comprar (ver divergência 4). |
| 18 | P | P | Toque em Reset mostra "Confirmar reset" (aria "Confirmar: apaga todo o progresso e reinicia o jogo"), sem apagar. Cancela por timeout de 4 s e por toque fora (blur). |
| 19 | P | P | Confirmar zera: 0 B, sem equipamentos, agentes e melhorias, Solo Hacker; o save e as estatísticas foram zerados; F5 mantém. Idioma: N/A (só pt-BR, D-11). |
| 20 | P | P* | 1280x500: canvas y 162-322, botão y 346-424, sem sobreposição, scrollHeight = 500. 375x600: botão y 399-477, núcleo acima, scrollWidth 375, mas a legenda "+N B por clique" fica sob a barra de navegação (ver D2). |
| 21 | P | N/A | Servidor de desenvolvimento, sem build/preview. `/manifest.webmanifest` 200 (`application/manifest+json`), nome "Byte Corp Idle", display standalone, background e theme `#050811`; ícones 192, 512 e maskable 512 respondem 200 como PNG com o tamanho declarado. `<head>`: viewport, theme-color, manifest, icon svg e png 32, apple-touch-icon, metas apple/mobile web app. Mesmo resultado nas duas larguras (não depende do viewport). |
| 22 | N | N | O navegador embutido não registra service worker (`getRegistrations()` = 0 no dev). Instalabilidade e abertura offline não verificadas. |
| 23 | P | P | Contratar, evoluir e comprar melhoria; após ~1,2 s e F5 o save e a tela ficaram idênticos (agentes, nível, melhoria, estágio, Bytes). Bytes batem com 1.500 + 6.000 + 50 de débito. Gravação após cada compra em ~70 ms. |
| 24 | N* | N* | Alternância de idioma N/A (só pt-BR). Verifiquei que não há chaves cruas nas telas Agentes, Loja, Melhorias e Núcleo, nem em `aria-label`, e que `html lang` é pt-BR. Console sem erros. |

## Divergências do roteiro (registradas, não são defeitos do jogo)

1. Idioma: não há seletor; botão Reset com confirmação em dois passos, passos 18, 19 e 24 adaptados (D-11).
2. Valores dos agentes e melhorias mudaram (D-13, D-14): ECHO_AI +3%, custo seguinte x2, nível 6.000 e x3 (roteiro: +5%, 1.875, x4); Overclock +10% (roteiro 5%); níveis de KAI e ATLAS com crescimento próprio.
3. Teto de desconto 50 pp e crítico 25% (D-13): não atingíveis nos estados testados.
4. Ponto de novidade (passo 17): não some ao abrir a aba; some quando o equipamento novo é comprado (ou deixa de ser comprável). Esse é o comportamento descrito na T-057/T-058; o texto do roteiro ("some ao abrir a aba") está desatualizado.
5. Abas de categoria em 375 px só com ícone (T-057); nome da ativa abaixo.
6. Passo 2: o roteiro espera "especialidade" no agente revelado; o cartão revelado mostra só nome e requisito.
7. Valores de clique exibidos truncados, não arredondados (1,0375 vira 1,03; 2,0775 vira 2,07).

## Defeitos

- **D1 (baixa). Agente revelado não mostra a especialidade.** Reproduzir: jogo novo, `run.bytes` e `run.bytesEarned` = 3000, recarregar, painel de agentes: ECHO_AI só tem nome e "Desbloqueio: alcance o estágio Garage Company". O roteiro (passo 2) pede nome, especialidade e requisito; `AgentCard.tsx` não renderiza `specialtyKey` no ramo `status !== 'unlocked'`. Decidir se é intencional (vira ajuste do roteiro).
- **D2 (baixa, visual). Em 375x600 a legenda "+N B por clique" fica escondida sob a barra de abas.** Reproduzir: viewport 375x600, aba Núcleo (qualquer estado): o botão "Processar dados" cabe (y 399-477), mas a legenda está em y=485, onde começa a barra Loja/Agentes/Núcleo; o contêiner do núcleo rola (scrollHeight 445 contra 416), então a legenda só aparece rolando. Sem rolagem horizontal.
- **D3 (baixa, observação). Janela de 4 s do Reset.** Com ferramenta lenta (cliques separados por mais de 4 s) a confirmação expira e o segundo toque só reabre a confirmação; com dois toques em sequência rápida o reset funciona. Apenas registrar se 4 s for curto para toque em celular.
- **D4 (baixa, texto). Descrições com número fixo divergem do valor formatado.** "Luvas hápticas": descrição "+30.000 Bytes por clique" e efeito "+30 kB por clique"; "Luvas quânticas": "+3 bilhões de Bytes" e "+3 GB". Não é erro de conta, mas mistura unidades.

Nenhum defeito de lógica (custos, bônus, descontos, desbloqueios, estágio, persistência, reset) encontrado. Os alvos de toque em 375 px agora têm 44 px (D2 do M1 resolvido); rótulos de categoria em pt-BR (D1 do M1 resolvido).

## Limpeza

Banco `byte-corp-idle` apagado, janela restaurada ao preset desktop, aba fechada e servidor de desenvolvimento encerrado.
