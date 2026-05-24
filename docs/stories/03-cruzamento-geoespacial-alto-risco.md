# Cruzamento Geoespacial de Alto Risco

## História de Usuário

Como **analista do CompStat Municipal**,
eu quero **visualizar áreas onde ocorrências criminais, fatores urbanos e denúncias se sobrepõem espacialmente**,
para que **eu possa identificar zonas de alto risco que demandam priorização de recursos e operações táticas**.

## Critérios de Aceitação

- [ ] O mapa exibe zonas de coincidência com gradiente de cores (verde = baixo risco, amarelo = médio, vermelho = alto risco) baseado no scoring calculado
- [ ] O scoring de risco considera densidade de ocorrências x quantidade de fatores urbanos x volume de denúncias, normalizados por área FM
- [ ] Apresento lista ordenada dos pontos de coincidência mais críticos (top 10) onde crime + fator urbano + denúncia coexistem no mesmo raio, com endereço aproximado
- [ ] Permito ajustar o raio de sobreposição com opções pré-definidas (100m, 200m, 500m, 1km) e o mapa atualiza automaticamente
- [ ] Ao selecionar uma zona de coincidência no mapa, exibo painel com detalhamento: quantidade de ocorrências, fatores urbanos presentes e volume de denúncias no raio
- [ ] Quando nenhuma sobreposição é encontrada no raio configurado, exibo mensagem informativa
- [ ] Quando dados de uma das três camadas não estão disponíveis para determinada área, essa área é excluída do cálculo
- [ ] O cálculo de sobreposição utiliza buffer geoespacial do raio configurado para cada ponto

## Notas

- **Dependências:** Story #1 (dados importados), Story #2 (mapa interativo)
- **Fora do escopo:** Análise temporal (evolução do risco), predição de crime, geração de alertas automáticos, exportação de relatórios
- **Contexto:** Conceito central: mancha criminal (quantitativa) cruzada com fatores urbanos e dinâmica criminal (qualitativa) revela onde crime, ambiente e dinâmica se sobrepõem. Exemplo: R. Uruguaiana com alta concentração de furtos + calçada estreita + denúncias de arrastão = coincidência de alto risco.
