# Análise de Área com IA

## História de Usuário

Como **analista do CompStat Municipal**,
eu quero **obter uma análise automatizada de uma área FM selecionada**,
para que **eu tenha uma síntese qualitativa e quantitativa pronta para as reuniões semanais de estratégia**.

## Critérios de Aceitação

- [ ] Ao selecionar uma área FM no mapa ou no painel, o sistema exibe uma opção para solicitar análise de IA
- [ ] Após solicitar a análise, o sistema exibe um indicador de carregamento enquanto processa os dados
- [ ] A análise apresenta resumo executivo contendo volume total de ocorrências, tendência geral e os três principais tipos de delito da área
- [ ] A análise apresenta seção temporal com horários de pico, dias da semana com mais incidentes e tendência mensal
- [ ] A análise apresenta dinâmica criminal incluindo padrões de modus operandi identificados nas denúncias e perfil predominante dos crimes
- [ ] A análise apresenta fatores urbanos agrupados por tipo e órgão responsável presentes na área
- [ ] A análise apresenta síntese qualitativa que conecta dados quantitativos com informações das denúncias
- [ ] Se não houver dados suficientes para uma área, o sistema exibe mensagem explicando a limitação

## Notas

- **Dependências:** Banco com dados de ocorrências, denúncias, fatores urbanos, domínios territoriais e câmeras. Claude API configurada. Mapa interativo com áreas FM implementado.
- **Fora do escopo:** Geração de relatórios PDF, comparação entre múltiplas áreas, histórico de análises, configuração de seções
- **Contexto:** 22 áreas FM no Rio de Janeiro. Reuniões semanais exigem sínteses rápidas. A análise processa dados estruturados pré-calculados, não dados brutos. Resposta formatada em painel lateral ou modal.
