# Inteligência de Redes Sociais via Twitter

## História de Usuário

Como **analista do CompStat Municipal do Rio de Janeiro**,
eu quero **monitorar automaticamente relatos de crimes e menções à Força Municipal no Twitter das 22 áreas FM**,
para que **eu tenha inteligência em tempo real sobre incidentes criminais reportados pela população e possa antecipar ações operacionais**.

## Critérios de Aceitação

- [ ] O sistema captura tweets contendo termos de crimes (assalto, roubado, roubo, furto, arrastão, tiroteio, bala perdida) combinados com localidades das 22 áreas FM
- [ ] O sistema captura tweets contendo menções à Guarda Municipal ou Força Municipal nas áreas FM
- [ ] Cada tweet é salvo na tabela `social_mentions` com: texto original, autor, data/hora, URL e timestamp de captura
- [ ] Cada tweet é classificado via Claude API extraindo: área FM, tipo de crime, local específico, horário relatado, relevância (1-5) e sentimento
- [ ] O dashboard exibe feed de tweets classificados com texto, classificação, área FM, tipo de crime e relevância
- [ ] O usuário pode filtrar por área FM, tipo de crime, período e relevância mínima
- [ ] Tweets em idioma diferente de português são ignorados
- [ ] Quando a classificação via Claude API falha, o tweet é salvo com status "pendente de classificação" e permanece visível

## Notas

- **Dependências:** Story #1 (banco com tabela `social_mentions`), Claude API key, Apify API key e Twitter Scraper actor configurados
- **Fora do escopo:** Gerenciamento de termos de busca via interface, alertas por email/SMS, análise de tendências históricas, outras redes sociais, reclassificação manual, integração com despacho operacional
- **Contexto:** Polling periódico via API Route `/api/social` dispara Apify Twitter Scraper. Query exemplo: `(assalto OR roubado OR furto OR arrastão OR tiroteio) AND (Copacabana OR Botafogo OR Uruguaiana OR "Campo Grande" OR Madureira) lang:pt`. Perfis prioritários: ABOR, G1 Rio, O Globo, COR Rio. 22 áreas FM monitoradas com keywords de localização específicas.
