# Sugestão de Cobertura da Força Municipal

## História de Usuário

Como **gestor de segurança pública do CompStat Municipal**,
eu quero **receber sugestões de distribuição dos 600 agentes da Força Municipal nas 22 áreas prioritárias**,
para que **eu possa tomar decisões táticas embasadas em dados sobre alocação de efetivo e modelo de emprego**.

## Critérios de Aceitação

- [ ] O sistema apresenta distribuição numérica dos 600 agentes pelas 22 áreas, respeitando o limite total de efetivo
- [ ] Para cada área, indica modelo de emprego recomendado (a pé, moto ou viatura) com justificativa baseada nas características da área
- [ ] Para cada área, indica horários prioritários de patrulhamento (turnos) alinhados aos picos de incidência criminal
- [ ] A justificativa referencia os fatores considerados: densidade criminal, tipo de delito, horários críticos, dinâmica criminal, fatores urbanos e circulação de pessoas
- [ ] A distribuição é visível em formato tabular com colunas: área, agentes, modelo de emprego, horários e justificativa
- [ ] A distribuição é visualizada no mapa com indicadores visuais por área
- [ ] Quando não há dados suficientes para uma área, informa a ausência e sugere coleta adicional
- [ ] A sugestão aloca proporcionalmente maior efetivo em áreas de maior criticidade

## Notas

- **Dependências:** Dados de ocorrências criminais disponíveis, Claude API funcional, 22 áreas FM delimitadas no PostGIS
- **Fora do escopo:** Alteração automática da alocação real, integração com sistemas de RH, histórico de sugestões, validação de disponibilidade real de agentes, edição manual da sugestão
- **Contexto:** 600 agentes para 22 áreas. Exemplo: "FM deve atuar na R. Presidente Vargas, priorizando emprego a pé em torno da Uruguaiana, considerando alta circulação de pessoas no passeio". A diferenciação furto (oportunístico) vs roubo (violento) impacta a estratégia. API route `/api/suggest-fm`.
