# BYTE CORP IDLE
## Especificação Mestre do Jogo — GDD e Documento de Requisitos

**Versão:** 1.0 — Consolidação das seis partes de definição  
**Nome oficial:** Byte Corp Idle  
**Gênero:** Incremental / Idle Tycoon / Simulação  
**Ambientação:** Cyberpunk tecnológico  
**Plataforma inicial:** Web  
**Modelo de distribuição inicial:** Beta aberto gratuito

---

# 1. VISÃO GERAL DO PROJETO

## 1.1. Conceito

Byte Corp Idle é um jogo incremental de gerenciamento no qual o jogador começa como um hacker independente, trabalhando em um pequeno ambiente doméstico, e evolui até administrar uma megacorporação tecnológica com infraestrutura avançada, redes de processamento, inteligência artificial e instalações quânticas.

O jogador acumula Bytes por meio de cliques manuais e produção automatizada. Esses recursos são utilizados para adquirir equipamentos, contratar agentes especializados e comprar melhorias que aceleram a expansão da empresa.

A progressão permite alcançar novos estágios corporativos e, posteriormente, executar um Reboot: um reinício estratégico da infraestrutura em troca de Quantum Cores, uma moeda de prestígio utilizada para adquirir melhorias permanentes.

A experiência deve combinar:

- Progressão econômica satisfatória.
- Sensação visual de crescimento da infraestrutura.
- Decisões estratégicas sobre investimentos e melhorias.
- Sistemas incrementais e automatizados.
- Evolução tecnológica de longo prazo.
- Desempenho estável em diferentes dispositivos.

## 1.2. Fantasia do jogador

O jogador assume o papel de fundador e CEO de uma empresa de tecnologia que começa como uma operação individual.

A evolução ocorre por estágios:

1. Solo Hacker.
2. Garage Company.
3. Startup Lab.
4. Data Center.
5. Corporate Network.
6. Quantum Facility.
7. Mega Corporation.

A progressão deve transmitir a transformação de uma pequena operação improvisada em uma estrutura tecnológica gigantesca.

## 1.3. Pilares do jogo

**Economia e progressão:** crescimento contínuo, investimentos, custos exponenciais e decisões sobre o momento ideal de executar um Reboot.

**Evolução visual:** a infraestrutura deve mudar conforme os equipamentos são adquiridos e os estágios corporativos são alcançados.

**Estratégia:** equipamentos, agentes, melhorias comuns e upgrades quânticos devem oferecer diferentes formas de acelerar a produção.

**Automação:** a produção passiva e a contratação de agentes são fundamentais para a experiência idle.

**Acessibilidade:** interface responsiva, idioma português e inglês, configurações acessíveis e funcionamento em diferentes plataformas.

**Equilíbrio:** nenhum dos pilares anteriores deve ser sacrificado desnecessariamente em favor dos demais.

## 1.4. Identidade visual

O jogo terá estética pseudo-3D, low-poly estilizada e cyberpunk.

Características principais:

- Ambientes escuros em tons de grafite e preto.
- Iluminação neon azul, ciano e magenta.
- Elementos holográficos.
- Servidores, computadores, racks, painéis e estruturas tecnológicas.
- Partículas, fluxos de dados e efeitos de energia.
- Tipografia futurista, mas legível.
- Interface tecnológica com hierarquia visual clara.

O visual deverá ser estilizado, não fotorrealista.

---

# 2. PLATAFORMAS E DISTRIBUIÇÃO

## 2.1. Ordem de lançamento

A ordem de desenvolvimento e disponibilização definida é:

1. Web.
2. PWA.
3. Android.
4. Steam.
5. iOS.

A Web será a primeira plataforma pública.

## 2.2. Estratégia multiplataforma

O jogo deverá ser desenvolvido desde o início com arquitetura preparada para expansão.

A primeira versão será executada no navegador, com interface responsiva para desktop e dispositivos móveis.

A arquitetura deverá permitir posteriormente:

- Instalação como PWA.
- Empacotamento para Android, considerando tecnologias como Capacitor.
- Distribuição desktop, considerando Electron ou Tauri.
- Publicação na Steam.
- Adaptação para iOS.

A implementação inicial deve evitar dependências exclusivas de uma plataforma.

## 2.3. Modelo de lançamento

A primeira disponibilização pública será um **beta aberto gratuito na Web**.

O beta deverá ser disponibilizado quando todos os sistemas e conteúdos previstos na especificação estiverem implementados e finalizados.

Versões internas de desenvolvimento poderão ser incompletas e utilizadas para testes durante a implementação.

## 2.4. Feedback

O jogo não terá um sistema interno de votação ou pesquisas.

Será disponibilizado um canal externo para:

- Relatos de erros.
- Sugestões.
- Comentários dos jogadores.

A estratégia de frequência e organização das atualizações será definida posteriormente.

---

# 3. CICLO PRINCIPAL DE JOGO

## 3.1. Loop central

O ciclo principal será:

1. Executar cliques manuais para acumular Bytes.
2. Comprar equipamentos.
3. Aumentar a produção passiva.
4. Contratar agentes especializados.
5. Adquirir melhorias comuns.
6. Expandir a infraestrutura.
7. Desbloquear novos estágios corporativos.
8. Acumular progresso suficiente para executar um Reboot.
9. Receber Quantum Cores.
10. Investir em melhorias permanentes na árvore Quantum.
11. Reiniciar a infraestrutura com vantagens permanentes.
12. Repetir o ciclo com maior eficiência.

## 3.2. Moedas

O jogo terá somente duas moedas:

### Bytes

Moeda principal.

Utilizada para:

- Comprar equipamentos.
- Contratar agentes.
- Evoluir agentes.
- Comprar melhorias comuns.

### Quantum Cores

Moeda de prestígio.

Obtida por meio do Reboot e utilizada na árvore Quantum.

Os Fragmentos de Singularidade serão uma representação visual dos Quantum Cores, não uma terceira moeda.

## 3.3. Ausência de Threat Level

O sistema Threat Level foi removido completamente do projeto.

Não haverá:

- Indicador de ameaça.
- Ataques ou invasões contra a empresa.
- Sistemas defensivos.
- Upgrades de defesa.
- Penalidades relacionadas a ameaças.
- Variáveis econômicas associadas a ameaças.
- Eventos de ameaça.

O crescimento do jogador não será interrompido por um sistema de defesa ou deterioração da infraestrutura.

---

# 4. ECONOMIA E PRODUÇÃO

## 4.1. Produção passiva

A produção passiva será apresentada em Bytes por segundo (B/s).

A produção terá origem em:

- Equipamentos.
- Agentes.
- Melhorias que afetam a produção.
- Melhorias quânticas.
- Outros bônus aplicáveis.

A produção deverá ser calculada de maneira consistente, independentemente da taxa de quadros da interface.

A lógica econômica não poderá depender da quantidade de frames renderizados.

## 4.2. Fórmula global

A decisão mais recente estabelece uma fórmula global unificada para a geração de Bytes.

Equipamentos, agentes e cliques contribuem para uma única produção total. Os bônus aplicáveis são incorporados sobre essa produção consolidada.

Não haverá multiplicadores independentes por origem na fórmula final de produção.

A implementação deverá preservar a possibilidade de identificar a origem dos valores para fins de estatísticas, mas a aplicação dos bônus seguirá o modelo global unificado.

**Observação:** essa decisão substitui a proposta anterior de manter multiplicadores separados para equipamentos, agentes e cliques. Os detalhes matemáticos exatos da fórmula ainda precisam ser formalizados.

## 4.3. Custos de equipamentos

Os equipamentos utilizarão crescimento exponencial de custos.

Modelo conceitual:

`C(N) = C_base × k^N`

Onde:

- `C(N)` é o custo da próxima unidade.
- `C_base` é o custo inicial.
- `k` é o fator de crescimento.
- `N` representa a quantidade adquirida.

Foram discutidos valores ilustrativos de crescimento:

- Hardware comum: aproximadamente 1,15.
- Data centers e tecnologias avançadas: aproximadamente 1,25.

Esses valores são referências iniciais, não parâmetros finais aprovados.

## 4.4. Produção dos equipamentos

A produção total de cada equipamento será determinada pela produção unitária e pela quantidade adquirida, considerando os bônus aplicáveis.

A loja exibirá a produção unitária do equipamento, já considerando os bônus ativos.

A produção total da categoria será consultável nas estatísticas.

## 4.5. Custos de agentes

Os agentes também terão custos crescentes.

Cada tipo de agente terá seus próprios parâmetros:

- Custo inicial.
- Crescimento de custo.
- Bônus principal.
- Bônus secundários.
- Crescimento dos bônus por nível.

Os custos de agentes serão afetados pelos descontos aplicáveis.

## 4.6. Descontos

As melhorias de redução de custo afetarão:

- Equipamentos.
- Agentes.

Não afetarão o custo das melhorias comuns.

Os descontos serão aditivos e não terão limite máximo percentual definido.

Entretanto, o custo final de qualquer aquisição nunca poderá ser inferior a 1 Byte.

O cálculo deverá considerar o desconto antes de determinar a quantidade máxima comprável.

Os custos serão valores inteiros, aplicando arredondamento para baixo após o desconto e respeitando o custo mínimo de 1 Byte.

## 4.7. Formatação dos números

A progressão utilizará o sistema decimal de unidades, com base 1000.

Sequência:

- Byte.
- Kilobyte (kB).
- Megabyte (MB).
- Gigabyte (GB).
- Terabyte (TB).
- Petabyte (PB).
- Exabyte (EB).
- Zettabyte (ZB).
- Yottabyte (YB).
- Unidades fictícias posteriores a Yotta.

A relação entre Byte e bit deverá ser respeitada: 1 Byte = 8 bits.

Regras de apresentação:

- Até duas casas decimais.
- Remover zeros decimais desnecessários.
- Utilizar vírgula decimal em português brasileiro.
- Utilizar ponto decimal em inglês.
- Utilizar notação científica em valores extremamente grandes.

Os nomes e fatores das unidades fictícias posteriores a Yotta deverão ser definidos antes da implementação final da formatação.

---

# 5. CLIQUES MANUAIS

## 5.1. Sistema de cliques

O jogador poderá gerar Bytes manualmente por meio de um botão de clique.

O botão ficará abaixo do núcleo visual central, na região inferior da área principal.

O clique será independente da representação visual do núcleo.

## 5.2. Núcleo central

O núcleo central será um elemento visual.

Características:

- Aparência circular.
- Anéis concêntricos.
- Brilho neon.
- Efeitos de impacto.
- Partículas.
- Ondas de energia.
- Elementos holográficos.

O núcleo não será diretamente interativo e não exibirá o valor de B/s.

## 5.3. Botão de clique

O botão terá animação curta de compressão quando pressionado.

O jogador poderá clicar continuamente, sem limite artificial de velocidade imposto pelo jogo.

Todos os cliques válidos serão contabilizados.

Não haverá sistema de combo.

A produção por clique poderá ser aumentada por melhorias e bônus.

## 5.4. Cliques críticos

Haverá possibilidade de cliques críticos.

O clique crítico utilizará a mesma identidade visual e sonora do clique normal, porém com efeitos intensificados.

O multiplicador crítico será aplicado ao ganho final do clique, incluindo os bônus aplicáveis.

Não haverá limite máximo de ganho por clique definido nesta etapa.

## 5.5. Cálculo dos cliques

O modelo conceitual estabelecido é:

1. Aplicar os acréscimos fixos ao valor base.
2. Aplicar os multiplicadores percentuais.
3. Aplicar o multiplicador crítico quando ocorrer um clique crítico.

Os bônus de clique fazem parte do sistema global de geração de Bytes.

---

# 6. EQUIPAMENTOS E INFRAESTRUTURA

## 6.1. Categorias

A loja será dividida em categorias tecnológicas.

Categorias estabelecidas:

- Networking.
- Processing.
- Storage.
- Cooling.
- Infrastructure.

A progressão das categorias será independente.

Não haverá exigência de adquirir equipamentos de uma categoria para liberar outra categoria.

## 6.2. Catálogo

O catálogo inicial será intermediário, com quantidade suficiente para oferecer progressão significativa em todos os estágios.

O catálogo será expandido futuramente.

As categorias poderão receber novos equipamentos sem exigir alterações estruturais no sistema.

## 6.3. Desbloqueios

Os equipamentos serão liberados conforme a progressão tecnológica e econômica.

Equipamentos próximos do desbloqueio poderão aparecer na loja com:

- Nome.
- Ícone.
- Requisito de desbloqueio.

Equipamentos muito avançados permanecerão ocultos.

Um equipamento bloqueado não poderá ser selecionado ou comprado.

Quando for desbloqueado, ficará disponível normalmente, sem notificação, destaque ou efeito especial obrigatório.

## 6.4. Organização da loja

No desktop, a loja utilizará abas por categoria.

No mobile, a navegação será compacta e adaptada à tela.

Os equipamentos serão organizados em uma grade no desktop e em uma lista compacta no mobile.

A ordem dos equipamentos será fixa e baseada no custo crescente.

Não haverá reordenação automática por disponibilidade, quantidade comprada ou capacidade de aquisição.

Não haverá pesquisa ou filtros.

## 6.5. Cartões de equipamentos

Cada cartão deverá apresentar:

- Ícone.
- Nome.
- Descrição curta.
- Custo.
- Produção unitária em Bytes/s.
- Quantidade adquirida.
- Controle de compra.

A produção apresentada já deverá considerar os bônus ativos.

Apenas a produção unitária será exibida no cartão. A produção total da categoria ficará nas estatísticas.

## 6.6. Compra de equipamentos

Cada equipamento terá seu próprio seletor:

- x1.
- x10.
- MAX.

Não haverá seletor global.

Cada seletor será independente e armazenará sua escolha apenas durante a sessão.

Ao reiniciar o jogo, todos os seletores voltarão para x1.

A compra será imediata, sem confirmação.

O modo MAX comprará a maior quantidade possível com os Bytes disponíveis, considerando todos os descontos.

Não haverá reserva de saldo para compras futuras.

Se o jogador não tiver Bytes suficientes, o botão ficará desabilitado, mas o custo continuará visível.

Não haverá indicação adicional de quanto falta para a compra.

A compra não terá animação especial obrigatória. A quantidade e a representação da infraestrutura serão atualizadas imediatamente.

## 6.7. Representação visual

Os equipamentos serão representados individualmente inicialmente.

Quando houver grandes quantidades, o sistema poderá agrupá-los visualmente.

O agrupamento não terá efeito econômico.

A infraestrutura evoluirá visualmente de acordo com os equipamentos adquiridos e o estágio corporativo.

Os equipamentos serão estáticos. A sensação de atividade será transmitida por:

- Iluminação.
- Partículas.
- Fluxos de dados.
- Pacotes animados.
- Efeitos de energia.

Não haverá posicionamento manual, seleção de objetos, rotação de equipamentos ou interação direta com elementos da infraestrutura.

---

# 7. AGENTES ESPECIALIZADOS

## 7.1. Conceito

Os agentes representam colaboradores e inteligências artificiais especializadas que aumentam a eficiência da empresa.

Cada agente terá identidade e especialidade próprias.

Exemplos conceituais:

- KAI_VER_3: produção global.
- NEO_GEN_5: operações com GPUs.
- ECHO_AI: ganhos por cliques manuais.
- ATLAS_CORE: redução de custos.

Os nomes e valores são exemplos de referência e poderão ser ajustados na implementação.

## 7.2. Catálogo

O catálogo inicial será pequeno, mas suficiente para demonstrar diferentes especialidades.

Novos agentes poderão ser adicionados em atualizações futuras.

Agentes antigos continuarão disponíveis conforme a progressão, mantendo suas identidades e especialidades.

## 7.3. Contratação

Os agentes serão contratados individualmente.

Não haverá compra x10 ou MAX para agentes.

Cada agente terá custo próprio e crescimento de custo próprio.

A lista será única, sem categorias por especialidade, ordenada pelo próximo custo de contratação.

## 7.4. Níveis

Cada tipo de agente terá níveis coletivos.

Todas as unidades do mesmo tipo compartilharão o nível.

Quantidade e nível serão parâmetros separados.

A evolução de nível será feita uma unidade por vez.

Os níveis não terão limite máximo definido nesta etapa.

O custo de evolução será em Bytes.

## 7.5. Bônus

Cada agente terá:

- Bônus principal.
- Bônus secundários.
- Parâmetros individuais de crescimento.
- Especialidade própria.

Os bônus secundários terão escopo definido individualmente.

Agentes especializados em produção poderão afetar equipamentos, outros agentes e cliques, conforme a decisão específica sobre agentes de produção.

Um agente especializado em equipamentos beneficiará todos os equipamentos igualmente, sem restrição a uma categoria específica.

A combinação dos bônus deverá respeitar a fórmula global unificada definida posteriormente no questionário.

## 7.6. Cartões de agentes

Cada cartão deverá apresentar:

- Nome.
- Ícone.
- Descrição.
- Especialidade.
- Próximo custo de contratação.
- Quantidade contratada.
- Nível atual.
- Progresso do nível, quando aplicável.
- Bônus atual.

Agentes próximos do desbloqueio poderão ser exibidos com suas informações.

Agentes muito avançados permanecerão ocultos.

## 7.7. Reboot

Todos os agentes e seus níveis serão perdidos no Reboot.

O jogador precisará contratá-los e evoluí-los novamente.

Melhorias quânticas poderão fortalecer permanentemente as habilidades dos agentes.

---

# 8. MELHORIAS COMUNS

## 8.1. Conceito

As melhorias comuns são aprimoramentos adquiridos com Bytes durante uma execução.

Elas serão perdidas no Reboot e precisarão ser desbloqueadas e compradas novamente.

## 8.2. Tipos de melhorias

Existirão três tipos principais:

1. Aumento global da produção de Bytes.
2. Aumento dos ganhos por cliques manuais.
3. Redução de custos.

Não haverá melhorias comuns específicas para um único equipamento ou agente.

## 8.3. Organização

As melhorias serão apresentadas em uma lista única.

A ordem será baseada no custo crescente.

Cada cartão apresentará:

- Nome.
- Ícone.
- Descrição.
- Custo.
- Benefício.
- Requisito de desbloqueio.
- Estado atual.

Melhorias já adquiridas permanecerão visíveis, com o botão desabilitado.

Não haverá selo ou badge especial de aquisição.

## 8.4. Desbloqueio

Todas as melhorias comuns serão desbloqueadas com base no total de Bytes gerados durante a execução atual.

O requisito não dependerá do saldo atual.

O progresso será baseado no total acumulado, independentemente de o jogador ter gasto os Bytes.

O cartão exibirá o requisito, mas não terá barra de progresso.

Melhorias que atingirem o requisito poderão ser liberadas simultaneamente.

Não haverá notificação de desbloqueio.

## 8.5. Compra

A compra será imediata e não exigirá confirmação.

Cada melhoria poderá ser comprada uma única vez por execução.

Os custos serão fixos por melhoria.

As melhorias terão efeitos permanentes durante a execução, sem duração temporária.

## 8.6. Progressão por estágio

O catálogo terá uma quantidade inicial intermediária e poderá ser expandido.

A distribuição das melhorias será progressiva entre os estágios corporativos.

Melhorias desbloqueadas continuarão disponíveis nos estágios seguintes.

Após o Reboot, todas as melhorias comuns serão bloqueadas novamente.

---

# 9. SISTEMA DE REBOOT E PRESTÍGIO

## 9.1. Conceito

O Reboot representa o reinício estratégico da empresa.

O jogador abre mão da infraestrutura atual para obter Quantum Cores e evoluir permanentemente por meio da árvore Quantum.

## 9.2. Elementos reiniciados

O Reboot deverá zerar:

- Bytes disponíveis.
- Equipamentos adquiridos.
- Agentes contratados.
- Níveis dos agentes.
- Melhorias comuns.
- Desbloqueios temporários e de execução.

A infraestrutura física retornará ao estágio Solo Hacker.

As melhorias comuns precisarão ser desbloqueadas novamente.

## 9.3. Elementos preservados

O Reboot preservará:

- Quantum Cores.
- Melhorias adquiridas na árvore Quantum.
- Conquistas.
- Estatísticas históricas.
- Desbloqueios permanentes.

Bônus temporários provenientes de conquistas também deverão sobreviver ao Reboot, com seus temporizadores continuando conforme as regras definidas para esses bônus.

Eventos ativos serão encerrados pelo Reboot sem recompensa.

## 9.4. Quantum Cores

A recompensa será calculada por uma fórmula híbrida que considera:

- Total de Bytes gerados na execução.
- Estágio corporativo alcançado.
- Progresso tecnológico.

O saldo atual não será o fator principal.

Gastar Bytes não deverá reduzir a recompensa acumulada.

A fórmula exata, seus pesos e os limites ainda precisarão ser definidos por balanceamento.

## 9.5. Reboots flexíveis

O sistema permitirá Reboots em diferentes momentos.

Quanto maior o progresso, maior deverá ser a recompensa.

Entretanto, executar um Reboot antecipado continuará sendo uma escolha viável.

O sistema não deverá forçar o jogador a alcançar obrigatoriamente o último estágio antes de reiniciar.

## 9.6. Interface

O botão de Reboot permanecerá visível.

Quando o jogador não tiver Quantum Cores suficientes para executar a ação, ficará desabilitado.

Ao abrir a janela de Reboot, o jogador verá uma estimativa da recompensa em Quantum Cores.

A confirmação será obrigatória.

A confirmação deverá apresentar claramente o que será perdido e o que será preservado.

A animação de Reboot durará aproximadamente 2 a 3 segundos e poderá ser ignorada imediatamente.

A produção e os cliques deverão continuar normalmente durante animações que não representem uma interrupção efetiva da execução.

---

# 10. ÁRVORE QUANTUM

## 10.1. Conceito

A árvore Quantum será o sistema de progressão permanente.

Ela será organizada em três caminhos tecnológicos.

O catálogo inicial terá poucas melhorias, mas será expansível.

## 10.2. Interface

A árvore será apresentada visualmente.

Características:

- Três caminhos.
- Nós conectados por linhas neon.
- Navegação livre.
- Zoom.
- Movimento panorâmico.
- Painel de detalhes lateral no desktop.
- Painel de detalhes inferior no mobile.

A identidade visual será consistente entre os três caminhos.

## 10.3. Seleção de nós

Um nó que não possua Quantum Cores suficientes continuará selecionável.

O jogador poderá consultar seus detalhes, mas o botão de compra não será exibido quando não houver saldo suficiente.

Um nó que dependa de um pré-requisito ainda não adquirido será visível, mas não poderá ser selecionado.

Nesse caso, não haverá painel de detalhes ou exibição dos requisitos.

As conexões entre nós serão linhas estáticas com identidade neon.

## 10.4. Compra e níveis

As melhorias serão compradas um nível por vez.

Não haverá compra múltipla.

Os níveis poderão ser ilimitados.

Os custos aumentarão exponencialmente.

Os benefícios serão progressivos, podendo variar conforme a melhoria.

Um modelo ilustrativo de crescimento de custo foi discutido entre 1,75 e 2, mas o fator definitivo ainda não está aprovado.

## 10.5. Reset da árvore

O jogador poderá reiniciar completamente a árvore Quantum.

O reset devolverá todos os Quantum Cores investidos.

O custo do reset aumentará conforme os resets anteriores.

A confirmação será obrigatória.

---

# 11. CONQUISTAS

## 11.1. Conceito

O sistema de conquistas reconhecerá diferentes tipos de progresso.

O catálogo inicial será intermediário e poderá ser expandido.

## 11.2. Categorias

Categorias definidas:

- Production.
- Clicks.
- Equipment.
- Agents.
- Reboots.
- Quantum.
- Corporate Milestones.

## 11.3. Raridades

As conquistas terão quatro níveis:

- Bronze.
- Silver.
- Gold.
- Diamond.

Os níveis terão progressão de dificuldade.

Conquistas Diamond deverão ser extremamente difíceis e poderão conceder recompensas especiais.

## 11.4. Conquistas secretas

Conquistas secretas poderão permanecer ocultas ou apresentar pistas.

Os requisitos específicos serão definidos durante a implementação.

## 11.5. Requisitos

Exemplos de requisitos previstos:

**Produção**
- Alcançar determinadas taxas de Bytes/s.
- Gerar quantidades acumuladas de Bytes.
- Alcançar marcos de produção por execução.

**Cliques**
- Atingir quantidades progressivas de cliques.
- Alcançar marcos de cliques críticos.

**Equipamentos**
- Adquirir quantidades totais.
- Alcançar produção por categoria.
- Adquirir equipamentos avançados.

**Agentes**
- Contratar quantidades específicas.
- Contratar agentes diferentes.
- Evoluir habilidades.
- Alcançar níveis de eficiência.

**Reboots**
- Executar determinada quantidade de Reboots.
- Obter Quantum Cores em uma única execução.
- Acumular evolução permanente.

**Quantum**
- Acumular Quantum Cores.
- Comprar níveis na árvore.
- Desenvolver caminhos.
- Reiniciar a árvore.

**Estágios corporativos**
- Alcançar cada estágio.
- Atingir marcos tecnológicos e econômicos.

**Tempo de jogo**
- 24 horas.
- 7 dias.
- 30 dias.
- 365 dias.

O contador de tempo será acumulativo e considerará somente o período em que o jogo estiver aberto.

## 11.6. Recompensas

As recompensas poderão incluir:

- Bytes.
- Bônus temporários de produção.
- Desbloqueios especiais.
- Elementos visuais ou funcionais.

Conquistas Quantum concederão Quantum Cores.

As recompensas temporárias comuns poderão ter durações de 15, 30 ou 60 minutos.

Bônus temporários provenientes de conquistas poderão acumular multiplicativamente entre si.

Seus temporizadores continuarão durante o Reboot.

## 11.7. Notificações

Ao desbloquear uma conquista, será apresentada uma notificação central e destacada.

A notificação permanecerá até o jogador fechá-la manualmente.

Somente uma notificação será exibida por vez.

Outras conquistas desbloqueadas serão colocadas em fila.

Não haverá histórico de notificações.

O progresso das conquistas será atualizado imediatamente.

---

# 12. EVENTOS

## 12.1. Escopo

O sistema de eventos não fará parte do MVP inicial.

Será implementado em uma atualização futura.

## 12.2. Tipos de eventos

Poderão existir:

- Oportunidades positivas.
- Desafios.
- Eventos corporativos especiais.

Não haverá eventos destrutivos com penalidades permanentes.

## 12.3. Frequência e duração

A frequência poderá variar conforme o estágio corporativo.

Os eventos somente começarão enquanto o jogo estiver aberto.

Não haverá início de eventos durante o período offline.

A duração inicial prevista será de 15 a 30 minutos, com eventos especiais podendo chegar a até 60 minutos.

## 12.4. Funcionamento

Somente um evento poderá estar ativo por vez.

Os eventos exigirão uma decisão do jogador, mas poderão ser ignorados.

Eventos ignorados expirarão sem recompensa e sem penalidade permanente.

Os prazos continuarão avançando enquanto o jogo estiver offline.

As decisões serão definitivas, sem possibilidade de desfazer.

Os eventos poderão se repetir.

## 12.5. Recompensas

As recompensas poderão incluir:

- Bytes.
- Aceleradores.
- Bônus temporários.
- Quantum Cores em eventos especiais.
- Desbloqueios.

## 12.6. Reboot e eventos

Executar um Reboot durante um evento encerrará o evento sem recompensa.

Não haverá conquistas específicas de eventos.

As estatísticas poderão registrar apenas o total de eventos realizados ou outras métricas gerais.

## 12.7. Interface

Eventos simples serão apresentados discretamente.

Eventos especiais terão painéis próprios e poderão exigir interação.

O encerramento poderá utilizar uma animação curta e uma tela de resultado que deverá ser fechada manualmente.

Eventos ignorados apresentarão encerramento sem recompensa.

Não haverá histórico de eventos.

---

# 13. ACELERADORES E VELOCIDADE

## 13.1. Velocidade padrão

A velocidade padrão do jogo será 1x.

Aceleradores poderão aumentar temporariamente a velocidade para 2x ou 5x.

O controle manual de velocidade poderá ser desbloqueado por melhorias.

## 13.2. Origens

Aceleradores poderão ser obtidos por:

- Progressão.
- Melhorias.
- Conquistas.
- Marcos.
- Eventos futuros.
- Anúncios recompensados.
- Compras opcionais.

Nenhum acelerador essencial deverá ser exclusivo de pagamento.

## 13.3. Duração

Durações previstas:

- 15 minutos.
- 30 minutos.
- 60 minutos.

O temporizador continuará avançando durante o período offline.

Os aceleradores armazenados no inventário não expirarão.

Não haverá ativação automática.

## 13.4. Ativação

Somente um acelerador poderá estar ativo por vez.

Se nenhum estiver ativo, a ativação será imediata.

Se outro estiver ativo, será exigida confirmação, apresentando a comparação entre multiplicador e duração.

O jogador poderá cancelar sem alterar o acelerador atual.

O multiplicador mais alto prevalecerá; aceleradores não acumularão seus multiplicadores entre si.

## 13.5. Substituição

A decisão mais recente define que, ao substituir um acelerador ativo, o jogador poderá escolher:

- Perder o tempo restante do acelerador anterior.
- Armazenar o acelerador anterior no inventário, preservando o tempo restante.

Essa escolha deverá ser apresentada antes da substituição.

A mesma lógica de decisão deverá ser considerada quando um evento conceder um acelerador enquanto outro estiver ativo.

## 13.6. Indicador

Um indicador persistente mostrará:

- Multiplicador ativo.
- Tempo restante.

Um aviso discreto será apresentado próximo do encerramento.

---

# 14. PRODUÇÃO OFFLINE

## 14.1. Conceito

A produção offline será completa.

Quando o jogador retornar, o jogo calculará os recursos produzidos durante sua ausência.

O cálculo utilizará o tempo decorrido desde o último registro válido.

## 14.2. Limite inicial

O limite inicial de produção offline será de 8 horas.

Melhorias permanentes da árvore Quantum poderão aumentar esse limite.

## 14.3. Resumo de retorno

Ao retornar, o jogador verá um resumo contendo:

- Tempo de ausência.
- Bytes produzidos.
- Ganhos relevantes durante o período.

## 14.4. Cálculo

A produção offline não deverá utilizar somente o último valor de Bytes/s.

O sistema deverá considerar mudanças de produção durante o intervalo, como:

- Alterações permanentes aplicáveis.
- Bônus temporários.
- Aceleradores.
- Expiração de efeitos temporários.

O cálculo será feito por intervalos ou eventos relevantes, não por simulação de cada segundo.

Não serão simuladas compras, decisões ou escolhas do jogador enquanto ele estiver ausente.

## 14.5. Eventos offline

Eventos não começarão durante o período offline.

Eventos já ativos poderão expirar enquanto o jogador estiver ausente.

## 14.6. Bônus de retorno

Poderão existir bônus ocasionais relacionados ao tempo de ausência e marcos de retorno.

Não haverá penalidade por ausência.

Não haverá sistema de sequência diária obrigatória ou punição por perder dias.

---

# 15. INTERFACE E EXPERIÊNCIA DO USUÁRIO

## 15.1. Princípio

A interface será única e totalmente responsiva.

O layout será adaptado automaticamente conforme a dimensão e orientação do dispositivo.

A mesma base de componentes será compartilhada entre desktop e mobile sempre que possível.

## 15.2. Desktop

A interface desktop utilizará três colunas:

**Topo**
- Recursos.
- Indicadores principais.

**Esquerda**
- Estatísticas resumidas.
- Agentes.

**Centro**
- Infraestrutura.
- Núcleo visual.
- Botão de clique.

**Direita**
- Loja.
- Equipamentos.
- Melhorias.

**Rodapé**
- Ações permanentes e navegação principal.

A loja terá rolagem independente.

## 15.3. Mobile

O layout mobile utilizará:

- Cabeçalho compacto de recursos.
- Cena central.
- Botão de clique.
- Abas inferiores.
- Painéis compactos.

A página terá rolagem adequada ao dispositivo.

## 15.4. Estatísticas visíveis

Sempre visíveis:

- Bytes disponíveis.
- Produção atual em Bytes/s.
- Quantum Cores no cabeçalho.

O valor de Bytes por clique será apresentado somente junto ao elemento de clique.

O multiplicador de velocidade ficará no indicador persistente de acelerador.

## 15.5. Estatísticas detalhadas

As estatísticas serão exibidas em uma janela modal.

A apresentação será uma lista vertical única, sem abas ou gráficos.

Serão exibidos totais acumulados.

Não haverá histórico de execuções ou histórico individual de Reboots.

## 15.6. Navegação

Botões permanentes:

- Reboot.
- Árvore Quantum.
- Conquistas.

O botão de Reboot permanecerá visível, mas desabilitado quando não houver condições para executá-lo.

## 15.7. Loja

A loja utilizará categorias por abas no desktop e navegação compacta no mobile.

Os cartões seguirão ordem fixa de custo crescente.

Não haverá pesquisa ou filtros.

A loja deverá mostrar informações suficientes para decisões de compra sem sobrecarregar a interface.

## 15.8. Configurações

O painel de configurações terá:

- Volume de música.
- Volume de efeitos.
- Volume de interface.
- Qualidade gráfica.
- Idioma.
- Notificações.
- Velocidade de jogo.

O gerenciamento de salvamento será tratado por meio da tela inicial e dos fluxos de novo jogo/continuação, não como uma exigência adicional do painel de configurações.

---

# 16. TUTORIAL E IDIOMAS

## 16.1. Tutorial

O tutorial será contextual e guiado.

Não haverá apresentação de todas as mecânicas de uma só vez.

Os passos serão apresentados conforme o jogador alcançar os marcos necessários.

Etapas previstas:

1. Realizar os primeiros cliques.
2. Comprar o primeiro equipamento.
3. Entender a produção passiva.
4. Contratar o primeiro agente.
5. Comprar melhorias comuns.
6. Conhecer conquistas.
7. Conhecer eventos quando forem implementados.
8. Aprender sobre Reboot.
9. Aprender sobre a árvore Quantum.

O tutorial de eventos será implementado quando o sistema de eventos for desenvolvido.

## 16.2. Idiomas

Idiomas iniciais:

- Português brasileiro.
- Inglês.

A arquitetura deverá ser preparada para futuras traduções.

O jogador poderá alterar o idioma pelas configurações.

---

# 17. TELA INICIAL

A tela inicial terá:

- Logotipo Byte Corp Idle.
- Fundo animado com infraestrutura tecnológica.
- Continuar.
- Novo jogo.
- Configurações.
- Créditos.

A opção Novo jogo deverá solicitar confirmação antes de sobrescrever o salvamento existente.

A opção Continuar deverá carregar o estado salvo.

---

# 18. ARTE, CÂMERA E RENDERIZAÇÃO

## 18.1. Câmera

A câmera será isométrica e fixa.

Não haverá controles de rotação ou zoom da cena principal.

## 18.2. Renderização híbrida

Tecnologias definidas:

- Three.js para infraestrutura e ambientes 3D.
- Canvas 2D para partículas, efeitos e fluxos de dados.
- React para interface.
- Tailwind CSS para estilização.
- Lucide Icons para ícones.
- Web Audio API para áudio e efeitos dinâmicos.

## 18.3. Modelos

Modelos complexos serão carregados em GLB/GLTF.

Elementos simples poderão ser gerados proceduralmente.

A infraestrutura deverá permitir carregamento progressivo de modelos.

## 18.4. Iluminação

A iluminação será híbrida:

- Iluminação principal por presets.
- Luzes dinâmicas em elementos importantes.
- Destaques no núcleo, servidores, racks, energia e tecnologia especial.

## 18.5. Sombras

As sombras serão híbridas:

- Sombras simplificadas ou estáticas para estruturas comuns.
- Sombras dinâmicas para elementos importantes.

Os presets de qualidade poderão alterar a complexidade das sombras.

## 18.6. Partículas

O sistema utilizará partículas ambientes discretas e efeitos mais intensos durante ações específicas.

A quantidade de partículas poderá ser adaptada à capacidade do dispositivo.

## 18.7. Transições de estágio

As transições de estágio terão animação cinematográfica curta, de aproximadamente 2 a 3 segundos.

O jogador poderá ignorá-la imediatamente.

A produção e os cliques continuarão funcionando durante a animação.

## 18.8. Evolução visual

A infraestrutura mudará automaticamente conforme:

- Equipamentos adquiridos.
- Quantidades alcançadas.
- Marcos tecnológicos.
- Estágios corporativos.

Não haverá personalização visual manual, posicionamento de objetos ou seleção direta de equipamentos.

---

# 19. DESEMPENHO E QUALIDADE GRÁFICA

## 19.1. Meta

A meta de renderização será 60 FPS.

Essa meta não será garantida em todos os dispositivos.

A economia deverá funcionar independentemente da taxa de quadros.

## 19.2. Qualidade adaptativa

O sistema detectará automaticamente a capacidade do dispositivo e ajustará a qualidade inicial.

O jogador poderá selecionar manualmente:

- Baixa.
- Média.
- Alta.

## 19.3. Adaptação

Em situações de desempenho crítico, o jogo poderá reduzir efeitos não essenciais.

Exemplos:

- Quantidade de partículas.
- Efeitos de iluminação.
- Complexidade de sombras.
- Efeitos visuais secundários.

A redução de efeitos não poderá alterar a economia ou a produção.

---

# 20. ÁUDIO

## 20.1. Música

A trilha sonora será ambientada em cyberpunk.

Cada estágio poderá possuir uma identidade musical própria.

A música poderá receber camadas e variações dinâmicas conforme a infraestrutura evoluir.

O Reboot terá uma composição curta especial, seguida da música do estágio Solo Hacker com elementos sutis relacionados ao progresso Quantum.

## 20.2. Efeitos sonoros

Efeitos previstos para:

- Clique.
- Clique crítico.
- Compra.
- Contratação de agente.
- Evento.
- Conquista.
- Reboot.
- Notificações.

O clique utilizará um som mecânico, físico e tecnológico, lembrando um botão ou teclado.

O clique crítico utilizará a mesma identidade sonora, com volume e intensidade maiores.

Compras comuns compartilharão um som padrão.

Agentes utilizarão o mesmo som padrão de compra.

Eventos poderão ter sons específicos conforme o tipo.

Conquistas terão som próprio.

O Reboot terá um pulso quântico especial.

## 20.3. Controles

Controles separados:

- Volume da música.
- Volume dos efeitos.
- Volume dos sons de interface.
- Silenciar tudo.

## 20.4. Implementação

Arquivos de áudio serão utilizados para músicas e efeitos elaborados.

A Web Audio API será utilizada para:

- Controle de volume.
- Filtros.
- Camadas.
- Variações dinâmicas.
- Efeitos sonoros procedurais.

## 20.5. Carregamento

O áudio será carregado progressivamente.

Recursos essenciais serão carregados primeiro.

Músicas e efeitos adicionais poderão ser carregados conforme a progressão.

Quando o áudio estiver silenciado, recursos não essenciais de música e efeitos não precisarão ser carregados.

---

# 21. SALVAMENTO E INTEGRIDADE DOS DADOS

## 21.1. Tecnologia

O salvamento inicial utilizará IndexedDB.

A arquitetura deverá permitir sincronização em nuvem futuramente.

A sincronização em nuvem não fará parte da versão inicial.

## 21.2. Salvamento automático

O jogo utilizará autosave e salvamentos em momentos importantes.

O sistema deverá registrar:

- Estado econômico.
- Equipamentos.
- Agentes.
- Melhorias.
- Quantum Cores.
- Árvore Quantum.
- Conquistas.
- Estatísticas.
- Efeitos temporários.
- Temporizadores relevantes.
- Estado de progressão.

## 21.3. Versionamento

Os dados de salvamento deverão possuir versão.

A estrutura deverá permitir futuras migrações de dados quando o formato do jogo mudar.

## 21.4. Salvamento corrompido

A decisão mais recente define que, quando um salvamento inválido ou corrompido for detectado:

1. O jogo deverá informar o problema.
2. O jogador poderá iniciar um novo jogo.

Não foi escolhida uma rotina de recuperação automática ou restauração de backups.

Essa decisão substitui a proposta anterior de recuperação por backup.

## 21.5. Slots

Haverá um único slot de salvamento por navegador ou dispositivo.

Novo jogo exigirá confirmação antes de sobrescrever o estado existente.

---

# 22. NOTIFICAÇÕES

O jogo poderá utilizar notificações locais enquanto estiver ativo, respeitando a permissão do navegador.

A arquitetura deverá ser compatível com PWA.

Notificações push com backend poderão ser consideradas em uma etapa futura.

O jogador poderá configurar as categorias de notificações.

O sistema deverá evitar excesso de notificações.

---

# 23. MONETIZAÇÃO

## 23.1. Princípio

A experiência completa será gratuita.

Anúncios e compras serão opcionais.

Não haverá anúncios obrigatórios ou intersticiais.

Não haverá bloqueio de progressão essencial atrás de pagamento.

## 23.2. Anúncios recompensados

Possibilidades definidas:

- Dobrar ganhos offline.
- Ativar multiplicadores temporários.
- Obter drones de glitch.
- Receber recompensas opcionais.

O jogador deverá escolher assistir ao anúncio.

Não haverá anúncios obrigatórios para continuar jogando.

## 23.3. Compras

As compras serão permanentes ou em pacotes.

Exemplos previstos:

- Ad-Blocker License.
- Quantum Starter Pack.
- Pacotes de recursos.

O Ad-Blocker License removerá os anúncios, mas manterá recompensas instantâneas gratuitas.

As compras deverão possuir validação, restauração e proteção contra concessão duplicada.

## 23.4. Equilíbrio

Nenhum sistema essencial deverá depender exclusivamente de compras.

A monetização não poderá tornar obrigatórios os aceleradores pagos.

A implementação da monetização poderá ocorrer depois dos sistemas principais, sem alterar a arquitetura necessária para suportá-la.

---

# 24. ARQUITETURA TÉCNICA

## 24.1. Stack

Tecnologias definidas:

- React.
- Tailwind CSS.
- Lucide Icons.
- Three.js.
- Canvas 2D.
- Web Audio API.
- IndexedDB.

## 24.2. Arquitetura híbrida

O jogo utilizará um núcleo independente de lógica e economia, separado da interface.

A interface será construída com React.

Os sistemas deverão ser modulares e comunicar-se por interfaces ou eventos internos.

A renderização não poderá controlar a lógica econômica.

## 24.3. Separação de responsabilidades

A arquitetura deverá separar, no mínimo:

**Game Core**
- Estado geral.
- Ciclo de atualização.
- Economia.
- Progressão.
- Cálculo de produção.

**Equipment System**
- Catálogo.
- Custos.
- Compras.
- Produção.
- Desbloqueios.

**Agent System**
- Catálogo.
- Contratações.
- Níveis.
- Bônus.

**Upgrade System**
- Melhorias comuns.
- Requisitos.
- Compra.
- Aplicação dos bônus.

**Reboot System**
- Cálculo de recompensa.
- Reset.
- Preservação de dados.

**Quantum System**
- Árvore.
- Nós.
- Custos.
- Níveis.
- Reset da árvore.

**Achievement System**
- Requisitos.
- Progresso.
- Recompensas.
- Notificações.

**Event System**
- Eventos.
- Temporizadores.
- Decisões.
- Recompensas.

**Offline System**
- Registro de tempo.
- Cálculo offline.
- Resumo de retorno.

**Save System**
- IndexedDB.
- Autosave.
- Versionamento.
- Validação.

**Audio System**
- Música.
- Efeitos.
- Camadas.
- Controles.

**Rendering System**
- Three.js.
- Canvas 2D.
- Modelos.
- Partículas.
- Iluminação.

**UI System**
- Componentes React.
- Loja.
- Modais.
- Estatísticas.
- Configurações.

## 24.4. Independência da renderização

A economia deverá funcionar mesmo que a renderização seja reduzida ou temporariamente interrompida.

A produção será baseada em tempo decorrido e delta time.

A taxa de quadros não poderá alterar os resultados econômicos.

## 24.5. Carregamento de recursos

Modelos e recursos serão carregados progressivamente.

Inicialmente, os modelos do estágio Solo Hacker terão prioridade.

Modelos avançados serão carregados conforme os estágios forem desbloqueados.

O carregamento de recursos não deverá bloquear desnecessariamente o jogo.

---

# 25. ESCOPO DO MVP E PRIMEIRA VERSÃO JOGÁVEL

## 25.1. Primeira versão jogável

A primeira versão jogável deverá conter o ciclo principal completo:

- Economia de Bytes.
- Cliques manuais.
- Equipamentos.
- Agentes.
- Melhorias comuns.
- Reboot.
- Quantum Cores.
- Árvore Quantum.
- Salvamento.
- Carregamento.

Essa versão deverá ser integrada e funcional, mas não precisará possuir todo o acabamento do beta público.

## 25.2. MVP final

O MVP deverá contemplar os sistemas e conteúdos definidos para a experiência completa prevista nesta especificação.

O beta aberto somente será considerado pronto quando todos os sistemas e conteúdos planejados estiverem implementados e finalizados.

## 25.3. Desenvolvimento incremental

O desenvolvimento será dividido em etapas modulares.

Cada etapa deverá entregar um incremento jogável e integrado.

Não se deve desenvolver todos os sistemas isoladamente e somente integrá-los no final.

A ordem de implementação deverá priorizar a construção progressiva do ciclo principal.

## 25.4. Eventos

O sistema de eventos está previsto para uma atualização futura e não fará parte da primeira versão jogável.

Sua inclusão no cronograma do beta deverá ser compatibilizada com a exigência de finalizar todos os conteúdos previstos para o beta.

---

# 26. REQUISITOS FUNCIONAIS

O jogo deverá:

1. Permitir gerar Bytes manualmente.
2. Permitir gerar Bytes passivamente.
3. Comprar equipamentos.
4. Contratar agentes.
5. Evoluir agentes.
6. Comprar melhorias comuns.
7. Desbloquear novos equipamentos e agentes.
8. Avançar entre estágios corporativos.
9. Executar Reboot.
10. Calcular Quantum Cores.
11. Comprar melhorias Quantum.
12. Reiniciar a árvore Quantum.
13. Registrar conquistas.
14. Conceder recompensas.
15. Calcular produção offline.
16. Aplicar aceleradores.
17. Salvar automaticamente.
18. Carregar o progresso.
19. Detectar salvamentos inválidos.
20. Permitir configurar gráficos.
21. Permitir configurar áudio.
22. Permitir alterar idioma.
23. Permitir configurar notificações.
24. Adaptar a interface a desktop e mobile.
25. Manter a economia independente da renderização.

---

# 27. REQUISITOS NÃO FUNCIONAIS

**Desempenho**
- Meta de 60 FPS.
- Adaptação gráfica.
- Redução de efeitos não essenciais.
- Economia independente da taxa de quadros.

**Compatibilidade**
- Navegadores modernos.
- Desktop.
- Mobile.
- Preparação para PWA.

**Persistência**
- IndexedDB.
- Autosave.
- Versionamento.
- Validação de dados.

**Usabilidade**
- Interface responsiva.
- Navegação clara.
- Tutorial contextual.
- Português e inglês.
- Controles de áudio e gráficos.

**Manutenibilidade**
- Arquitetura modular.
- Separação entre lógica e interface.
- Sistemas independentes.
- Catálogos expansíveis.

**Escalabilidade**
- Suporte a novos equipamentos.
- Novos agentes.
- Novas melhorias.
- Novas conquistas.
- Novos estágios.
- Novos idiomas.
- Novas plataformas.

---

# 28. PONTOS QUE PRECISAM SER DEFINIDOS NA IMPLEMENTAÇÃO

As decisões conceituais estão estabelecidas, mas diversos valores e detalhes ainda precisam de testes e balanceamento.

## 28.1. Economia

- Custo inicial de cada equipamento.
- Produção inicial de cada equipamento.
- Fator de crescimento de custos.
- Valores de produção por estágio.
- Custo e crescimento de agentes.
- Quantidade de Bytes por clique.
- Chance de clique crítico.
- Multiplicador de clique crítico.
- Valores de bônus globais.
- Fórmula matemática definitiva de produção.
- Arredondamentos e precisão interna.

## 28.2. Reboot

- Fórmula exata de Quantum Cores.
- Pesos de Bytes gerados, estágio e progresso tecnológico.
- Quantidade mínima necessária para habilitar o Reboot.
- Regras para recompensas antecipadas.
- Limites e arredondamentos.

## 28.3. Quantum

- Quantidade de nós iniciais.
- Distribuição entre os três caminhos.
- Custos iniciais.
- Fatores de crescimento.
- Benefícios de cada nível.
- Custo de reset da árvore.

## 28.4. Conteúdo

- Quantidade exata de equipamentos por categoria.
- Quantidade inicial de agentes.
- Quantidade de melhorias comuns.
- Requisitos de desbloqueio.
- Nomes finais e descrições.
- Valores de cada estágio corporativo.

## 28.5. Conquistas

- Quantidades exatas dos requisitos.
- Recompensas de cada nível.
- Multiplicadores temporários.
- Frequência e regras de notificações.

## 28.6. Offline

- Fórmula de produção em cada intervalo.
- Como tratar efeitos que começam ou terminam durante a ausência.
- Como tratar aceleradores e bônus simultâneos.
- Como ampliar o limite de 8 horas.

## 28.7. Aceleradores

- Regra exata de armazenamento após substituição.
- Interface de escolha entre perder ou armazenar.
- Comportamento ao receber aceleradores por eventos ou anúncios.
- Interação com bônus temporários de outras fontes.

## 28.8. Infraestrutura

- Quantidade de modelos 3D.
- Modelos por estágio.
- Regras visuais de agrupamento.
- Limites de partículas.
- Critérios de adaptação de qualidade.

## 28.9. Plataformas e monetização

- Ferramentas finais de empacotamento.
- Serviços de anúncios.
- Provedores de pagamento.
- Restauração de compras.
- Estratégia de publicação nas lojas.

---

# 29. DECISÕES CONSOLIDADAS E ALTERAÇÕES IMPORTANTES

As decisões abaixo devem prevalecer sobre propostas anteriores quando houver conflito.

1. **Nome:** Bit Corp Idle foi renomeado para Byte Corp Idle.
2. **Threat Level:** removido completamente.
3. **Reboot:** reinicia Bytes, equipamentos, agentes e melhorias comuns; preserva Quantum Cores, melhorias Quantum, conquistas, estatísticas e desbloqueios permanentes.
4. **Prestígio:** recompensa baseada em total de Bytes gerados, estágio e progresso tecnológico, não no saldo atual.
5. **Fórmula de produção:** decisão mais recente estabelece uma produção global unificada, sem multiplicadores separados por origem.
6. **Eventos:** não fazem parte da primeira versão jogável; serão implementados posteriormente.
7. **Monetização:** experiência completa gratuita, anúncios recompensados opcionais e compras permanentes opcionais.
8. **Salvamento:** IndexedDB, autosave e versionamento; sem recuperação automática de backups quando o salvamento estiver corrompido.
9. **Plataformas:** Web, PWA, Android, Steam e iOS, nessa ordem.
10. **Interface:** única e responsiva, com adaptações automáticas para desktop e mobile.
11. **Qualidade gráfica:** detecção automática e presets manuais Baixa, Média e Alta.
12. **Aceleradores:** somente um ativo; substituição exige confirmação e permite perder ou armazenar o tempo restante.
13. **Beta:** beta aberto gratuito na Web, com canal externo de feedback.
14. **Conclusão do beta:** todos os sistemas e conteúdos previstos deverão estar implementados e finalizados.

---

# 30. DIRETRIZ FINAL DE DESENVOLVIMENTO

Byte Corp Idle deverá ser construído como um jogo incremental modular, com uma economia consistente e independente da apresentação visual.

A experiência deve começar simples, mas possuir uma estrutura capaz de sustentar progressão prolongada, novos equipamentos, agentes, melhorias, estágios e sistemas adicionais.

A prioridade não é simplesmente acumular recursos ou exibir números cada vez maiores. O jogador deve perceber que está construindo uma empresa tecnológica, que cada investimento contribui para sua evolução e que cada Reboot representa um avanço permanente.

O resultado final deverá equilibrar:

- Progressão econômica.
- Estratégia.
- Automação.
- Evolução visual.
- Identidade sonora.
- Desempenho.
- Usabilidade.
- Expansibilidade técnica.

Este documento é a referência central do projeto. Alterações futuras deverão atualizar esta especificação, preservando as decisões já confirmadas e registrando explicitamente qualquer mudança de escopo.