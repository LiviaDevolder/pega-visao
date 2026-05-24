# Sugestão de Ações para Resolução de Fatores Urbanos

## História de Usuário

Como **analista do CompStat Municipal**,
eu quero **receber sugestões de ações para resolução de fatores urbanos em cada área FM, agrupadas por órgão responsável e priorizadas por impacto**,
para que **eu possa coordenar intervenções urbanas eficientes com os órgãos municipais e reduzir os fatores que contribuem para a criminalidade**.

## Critérios de Aceitação

- [ ] A plataforma lista todos os fatores urbanos presentes na área FM selecionada, exibindo tipo de ocorrência e logradouro
- [ ] Os fatores são agrupados por órgão responsável (CET-Rio, GM-Rio, SEOP, SMTR, Comlurb, RioLuz, Seconserva, SMAS)
- [ ] Para cada fator, exibe sugestão de ação com: órgão, local exato, tipo de intervenção e justificativa baseada no contexto de segurança
- [ ] As ações são priorizadas dentro de cada órgão, apresentando primeiro aquelas em zonas de alto risco
- [ ] O sistema gera um "Plano de Ação" consolidado por órgão que pode ser incluído no relatório analítico
- [ ] A visualização permite navegação por órgão, mostrando quantidade de ações pendentes
- [ ] Quando não houver fatores urbanos na área selecionada, exibe mensagem informativa
- [ ] A priorização considera presença de fatores urbanos e classificação de risco da área

## Notas

- **Dependências:** Story #1 (tabela `fatores_urbanos` com 2.085 registros), Story #3 (scoring de risco)
- **Fora do escopo:** Envio automático aos órgãos, controle de status de execução, modificação manual das sugestões, cadastro de novos tipos
- **Contexto:** Matriz de responsabilidades mapeada: CET-Rio (tráfego), GM-Rio (motos/bikes no passeio), SEOP (estacionamento/comércio irregular), SMTR (ônibus), Comlurb (vegetação/lixo), RioLuz (iluminação), Seconserva (mobiliário/calçadas), SMAS (PSR/drogas). Sugestões contextualizadas com perfil criminal. Plano de Ação integra o relatório (Story #5).
