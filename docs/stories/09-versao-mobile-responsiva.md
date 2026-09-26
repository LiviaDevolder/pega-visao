# Versão Mobile Responsiva da Plataforma

## História de Usuário

Como **analista ou gestor do CompStat Municipal que precisa consultar a plataforma fora da mesa**,
eu quero **acessar o mapa operacional e as demais telas pelo navegador do celular, com layout adaptado a telas pequenas**,
para que **eu possa consultar hotspots, áreas FM, fatores urbanos e planos de ação em campo, sem depender de um computador**.

## Critérios de Aceitação

### Navegação e estrutura

- [ ] Em telas menores que 768px, a sidebar fixa de 240px deixa de ocupar a tela e a navegação passa a ser acessada por um botão de menu que abre uma gaveta com as 6 seções (Mapa Operacional, Coincidências, Cobertura FM, Plano de Ação, RELINTs, Redes Sociais)
- [ ] Em telas menores que 768px, o cabeçalho exibe a marca "Pega Visão" e o botão de menu, e os filtros globais (ano, mês, delito) ficam recolhidos em um painel que abre sob demanda, sem estourar a largura da tela
- [ ] Nenhuma tela apresenta rolagem horizontal da página em larguras a partir de 360px
- [ ] Em telas a partir de 768px o layout atual permanece igual (sem regressão no desktop)

### Mapa operacional

- [ ] O mapa ocupa toda a altura útil da tela do celular, respeitando a barra de endereço do navegador (sem cortar nem gerar rolagem extra)
- [ ] Os controles de camadas e os filtros do mapa iniciam recolhidos no celular, sem cobrir a maior parte do mapa, e podem ser abertos com um toque
- [ ] Os painéis de detalhe (área FM, análise da área, fatores urbanos, detalhe de risco, sugestão de alocação) abrem como painel inferior (bottom sheet) no celular, ocupando a largura da tela, com rolagem interna e botão de fechar
- [ ] O mapa continua utilizável por toque: arrastar, zoom por pinça, e toque em área FM abre o detalhe da área

### Demais telas

- [ ] Em Coincidências, a lista de hotspots e o mapa não ficam lado a lado no celular: o usuário alterna entre "Lista" e "Mapa", ou vê a lista empilhada acima do mapa
- [ ] Nas telas Cobertura FM, Plano de Ação, RELINTs e Redes Sociais, cabeçalhos e ações quebram em linhas e os botões principais ocupam a largura disponível
- [ ] Tabelas e o mapa de calor dia/hora podem ser rolados horizontalmente dentro do próprio componente, sem quebrar o layout da página
- [ ] Botões, links e itens de menu têm área de toque de pelo menos 44px

### Desempenho

- [ ] O mapa abre e responde ao toque em um celular de mercado comum em rede 4G, sem travar ao ativar o mapa de calor

## Notas

- **Dependências:** Stories #2 (mapa interativo), #3, #4, #6, #7 e #8, já implementadas (as telas que serão adaptadas)
- **Fora do escopo:** PWA (instalação na tela inicial, ícone e cache offline), app nativo (React Native/Expo), modo offline, notificações push, novas funcionalidades específicas do celular (GPS do usuário, câmera), redesenho visual do desktop
- **Decisão do usuário:** a versão mobile será o mesmo app web, responsivo, sem loja de aplicativos. A abordagem PWA pode virar uma story futura e reaproveita este trabalho
- **Contexto técnico:** o app usa Next.js 15, Chakra UI v3 e Leaflet. O layout atual é orientado a desktop: sidebar fixa de 240px, cabeçalho fixo com `left: 240px`, painéis flutuantes de 320 a 460px e altura do mapa em `calc(100vh - 56px)`
- **A confirmar:** o perfil de quem usará o celular (analista, gestor ou agente em campo) não foi definido. A história assume analista ou gestor consultando em campo, e isso pode mudar a prioridade das telas
