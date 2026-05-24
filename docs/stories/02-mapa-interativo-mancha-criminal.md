# Mapa Interativo com Mancha Criminal

## História de Usuário

Como **analista do CompStat Municipal**,
eu quero **visualizar um mapa interativo com a mancha criminal e fatores urbanos do Rio de Janeiro**,
para que **eu possa identificar padrões espaciais entre ocorrências de furto/roubo e características do ambiente urbano**.

## Critérios de Aceitação

- [ ] O mapa exibe o Rio de Janeiro centralizado com zoom adequado ao carregar a página
- [ ] A camada de heatmap das ocorrências de furto/roubo representa visualmente a densidade dos 115K pontos georreferenciados
- [ ] A camada de fatores urbanos exibe os 2.085 pontos com marcadores diferenciados por tipo (vegetação, iluminação, obstrução, etc.)
- [ ] A camada de polígonos das 22 áreas FM está visível com bordas delimitadas e preenchimento semitransparente
- [ ] A camada de câmeras de vigilância exibe os 985 pontos com marcador específico
- [ ] O painel de controle permite ativar/desativar cada camada individualmente com efeito imediato no mapa
- [ ] Filtros de período, tipo de delito, dia da semana e faixa horária atualizam o heatmap conforme seleção
- [ ] Ao clicar em um polígono de área FM, um painel exibe nome da área, total de ocorrências e total de fatores urbanos

## Notas

- **Dependências:** Story #1 (tabelas `ocorrencias`, `fatores_urbanos`, `areas_fm`, `cameras` populadas)
- **Fora do escopo:** Análises estatísticas avançadas, geração de relatórios, edição de registros, autenticação
- **Contexto:** react-leaflet para mapa, leaflet.heat para heatmap. Dataset de ~115K pontos georreferenciados. 22 áreas FM representam a divisão operacional do policiamento.
