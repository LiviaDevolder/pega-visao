# Geração Automática de Relatório Analítico em .docx

## História de Usuário

Como **analista do CompStat Municipal do Rio de Janeiro**,
eu quero **gerar automaticamente o Relatório Analítico de Área em formato .docx**,
para que **eu possa reduzir de horas para minutos o tempo de preparação dos relatórios semanais de reunião**.

## Critérios de Aceitação

- [ ] A interface da área FM exibe um botão "Gerar Relatório" que inicia o download automático de um arquivo .docx
- [ ] O .docx contém cabeçalho com identificação da área FM e período de análise selecionado
- [ ] O .docx contém resumo executivo da situação criminal gerado pela Claude API
- [ ] O .docx contém análise temporal com dados tabulares organizados (variação percentual, totais por período)
- [ ] O .docx contém dinâmica criminal descrevendo modus operandi, perfil e rotas identificadas
- [ ] O .docx contém fatores urbanos identificados na área e plano de ação com órgão responsável e ações sugeridas
- [ ] A estrutura do documento segue o formato dos RELINTs de referência (RI_010 a RI_017)
- [ ] O arquivo gerado tem nome descritivo incluindo código da área FM e data (ex: "RELINT_FM010_2026-05-24.docx")

## Notas

- **Dependências:** Story #1 (dados), Story #4 (análise com IA), biblioteca `docx` (npm)
- **Fora do escopo:** Gráficos de tendência (dados tabulares suficientes), edição do relatório na plataforma, envio automático por email, histórico de relatórios
- **Contexto:** Analistas gastam 2-4 horas montando relatórios manualmente por semana. 8 RELINTs em `relints/` servem como referência de formato. API Route `/api/report` retorna .docx como blob para download.
