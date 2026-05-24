# Pega Visão — Decisões Técnicas

Resumo das principais decisões de arquitetura e engenharia, com o **trade-off** que cada uma resolveu. Pensado para responder perguntas do júri técnico e para onboarding rápido.

---

## 1. Stack monolítica em Next.js 15 (App Router)

**Decisão.** Frontend (React 19 + Chakra UI v3 + react-leaflet) e backend (API Routes) no mesmo repositório, mesmo runtime.

**Por quê.**
- Hackathon de 48h: zero overhead de orquestrar deploy separado, CORS, contratos de API.
- O App Router permite componentes server-side que falam direto com o banco — corta uma camada inteira de adapter.
- Vercel-ready: deploy é `git push`. O time consumiu o tempo em produto, não em infra.

**Trade-off aceito.** Acoplamento. Se a plataforma crescer e exigir um backend dedicado (ex.: jobs longos, workers), vai precisar de refatoração — mas o caminho é conhecido (extrair `src/lib/*` para um serviço).

---

## 2. Postgres + PostGIS no Neon — toda inteligência geoespacial roda no banco

**Decisão.** Neon serverless (`@neondatabase/serverless`) + PostGIS. Todas as agregações espaciais (`ST_Contains`, `ST_Intersects`, `ST_DWithin`, `ST_SnapToGrid`) executam no SGBD, não na aplicação.

**Por quê.**
- Cruzar 115k ocorrências × 22 polígonos × 2k fatores × 83k denúncias em JavaScript seria inviável (memória + latência).
- PostGIS tem índices GIST — uma operação de point-in-polygon em 115k registros vira O(log n) com o índice certo.
- Neon serverless escala a zero — sem custo ocioso durante o hackathon.

**Como isso aparece no código.**
- `db/migrations/001_create_tables.sql`: toda tabela georreferenciada tem `geom geometry(..., 4326)` + `CREATE INDEX ... USING GIST (geom)`.
- `src/lib/db.ts`: cliente serverless único, exportado como `sql`.

**Trade-off aceito.** SQL bruto em vez de ORM. Ganhamos performance e legibilidade geoespacial; perdemos a ergonomia de migrations automáticas e tipos derivados do schema.

---

## 3. Materialized Views para colapsar queries pesadas (`area_stats_mv` e `hotspots_mv`)

**Decisão.** Pré-computar dois agregados críticos em materialized views, com fallback gracioso para a query original.

**O que isso resolveu — específico, documentado nos próprios SQLs:**

> *"Resolve timeouts em `/api/geo/risk-scoring`: a query original cruzava 22 áreas × ~115k ocorrências × fatores × denúncias dentro de subqueries correlatas e **não cabia em 60s de serverless**."* — `db/migrations/002_area_stats_mv.sql:2`

> *"Substitui a query de N+1 spatial joins (500 candidates × 3 ST_DWithin) que **demorava 144s no banco** e timeoutava no serverless."* — `db/migrations/003_hotspots_mv.sql:2`

**Estratégia de fallback (`src/lib/risk-queries.ts:122-135`).**

```ts
try {
  return await getRiskScoringFast();   // SELECT em 22 linhas da MV
} catch (err) {
  if (msg.includes("does not exist")) {
    return getRiskScoringSlow();       // SQL completo, ~60s, ainda funciona
  }
  throw err;
}
```

Banco novo sem MV ainda funciona — só lento. **Nenhum ambiente fica quebrado pela ausência da otimização.**

**Trade-off aceito.** Staleness. As MVs precisam de `REFRESH MATERIALIZED VIEW` após nova carga de dados. Documentado nos comentários do SQL.

---

## 4. Scoring de risco multiplicativo e normalizado (não aditivo)

**Decisão.** O score de risco por área FM é **multiplicativo**:
```
raw = (ocorrencias/km²) × (1 + fatores_norm) × (1 + denuncias_norm)
risk_score = raw / max(raw)
```
Depois disso, 3 faixas qualitativas: `alto` (≥0.66), `medio` (≥0.33), `baixo`.

**Por quê.**
- **Multiplicação amplifica coincidência:** uma área com muita ocorrência **E** muito fator urbano **E** muita denúncia salta no ranking — que é exatamente o sinal que o analista busca.
- **Densidade (`/km²`) corrige viés de área grande.** Sem isso, qualquer área grande venceria por volume bruto.
- **Normalização pelo máximo** dá uma escala 0–1 estável, comparável entre semanas.
- **Faixas qualitativas** evitam pseudo-precisão (`0.6478` não significa nada para o analista — `alto` significa).

**Arquivo.** `src/lib/risk-queries.ts:39-71`.

---

## 5. Cache em memória com deduplicação de inflight

**Decisão.** Wrapper `getOrSet(key, ttl, loader)` com TTL configurável e **dedupe de promessas concorrentes** (`src/lib/cache.ts`).

**Por quê.**
- Análise de área por IA custa ~30s e ~10k tokens. Sem cache, dois cliques rápidos do analista = duas chamadas pagas.
- O dedupe (`inflight Map`) garante que, mesmo com 3 cliques em 1 segundo, **só 1 request à Claude é feito**. Os outros 2 esperam a mesma promessa.
- TTL de 10 minutos é suficiente para a reunião e curto o bastante para dados frescos no dia seguinte.

**Trade-off aceito.** Cache in-memory é por instância. Em produção com múltiplas réplicas, isso vira Redis. Para o hackathon (1 instância Vercel), funciona.

---

## 6. IA com saída JSON estruturada + validador + fallback

**Decisão.** Toda chamada Claude tem 3 camadas de defesa.

**Camada 1 — Prompt estruturado.** `src/lib/ai/prompts/area-analysis.ts` define explicitamente o JSON esperado: `resumo_executivo`, `dinamica_criminal`, e 4 `perguntas_norteadoras` (cada uma com `diagnostico` + `sugestao`). Essas 4 perguntas **espelham a estrutura real da reunião do CompStat**: rota da FM, QMD, modelo de emprego, fatores por órgão. O prompt não é genérico — é o ritual da reunião transposto em JSON.

**Camada 2 — Parser tolerante.** `extractJson()` em `src/lib/analysis-service.ts:42` tenta `JSON.parse` direto; se falhar, extrai o primeiro `{...}` por regex. Cobre o caso comum da IA adicionar prosa antes/depois do JSON.

**Camada 3 — Validador estrutural.** `isValidAnalysis()` checa **cada campo obrigatório** antes de aceitar a resposta. Se a IA omitiu uma `pergunta_norteadora`, o resultado é rejeitado.

**Camada 4 — Fallback.** Se qualquer das camadas acima falhar, `getFallbackByAreaId()` retorna uma análise pré-gerada para aquela área. **O produto nunca quebra na demo.** Flag `DEMO_MODE=true` força fallback (modo palco sem internet).

**Por quê.** "IA não enfeita — IA trabalha." Mas trabalho de IA em segurança pública não pode crashar a tela. As 4 camadas + a flag são o que separa um protótipo de algo que a prefeitura realmente abriria numa terça-feira.

---

## 7. Modelo Claude: Sonnet 4 (não Opus, não Haiku)

**Decisão.** `claude-sonnet-4-20250514` para todas as análises e classificações.

**Por quê.**
- Análise de área pede raciocínio sobre dados quantitativos + síntese executiva — Haiku ficaria raso.
- Mas o custo de Opus para 22 áreas × N analistas × semana inteira não fecha. Sonnet é o equilíbrio.
- `max_tokens: 4096` é suficiente para o JSON completo sem desperdício.

**Arquivo.** `src/lib/ai/anthropic-client.ts:18`.

---

## 8. Plano de Ação por órgão: **determinístico, não IA**

**Decisão.** O mapeamento `tipo de fator urbano → ação sugerida` é um **dicionário estático** em código (`src/lib/action-plan-builder.ts:1-36`), não uma chamada à IA.

```ts
const ACTION_MAP = {
  "iluminacao": "Instalar/reparar iluminacao publica...",
  "lampada":    "Substituir lampadas queimadas...",
  "vegetacao":  "Realizar poda de arvores...",
  "calcada":    "Reparar calcada danificada...",
  ...
};
```

**Por quê.**
- Ação operacional precisa ser **previsível e auditável** — não pode mudar a cada chamada.
- O analista da prefeitura precisa saber que "lâmpada queimada" sempre gera "ofício para a RioLuz" — não uma sugestão diferente toda vez.
- Latência zero, custo zero, 100% testável.

**Onde IA entra mesmo assim.** A análise de área cita os fatores e prioriza; o agrupamento por órgão é regra fixa. **IA decide o quê. Regra decide para quem.**

---

## 9. Geração de RELINT em `.docx` no servidor

**Decisão.** Biblioteca `docx` no Node (server-side), template em `src/lib/report/relint-template.ts`, exportação binária via API route.

**Por quê.**
- O formato `.docx` é exigência do CompStat — não dá para entregar PDF/markdown.
- Server-side evita carregar 1MB+ de biblioteca no browser do analista.
- Template tipado em TypeScript: campos do RELINT são contratos (`ReportData`, `PerguntaNorteadoraReport`) — se a estrutura mudar, o compilador acusa.

**Arquivo.** `src/lib/report/report-generator.ts`.

---

## 10. Schema com idempotência de import (`UNIQUE` em chaves naturais)

**Decisão.** Toda tabela importada de CSV tem uma chave natural `UNIQUE`:
- `ocorrencias.id_criptografado UNIQUE`
- `denuncias.id_denuncia UNIQUE`
- `fatores_urbanos.id_resposta_ocorrencia UNIQUE`
- `cameras.id_ponto UUID UNIQUE`
- `areas_fm.nome_area_fm UNIQUE`

**Por quê.** O CompStat **vai resubir a base toda semana**. O pipeline de ingestão (`scripts/import_data.py`) precisa ser idempotente — rodar duas vezes não duplica dado. Com `ON CONFLICT DO NOTHING/UPDATE`, isso é uma linha.

**Trade-off aceito.** Schema tem campos que vieram do CSV sem normalização (ex.: `denuncias` tem dezenas de colunas duplicadas top-level). Decisão consciente: **espelhar a fonte é mais auditável** do que normalizar e perder rastreabilidade.

---

## 11. Coordenadas: documentar a sujeira da fonte, não esconder

**Decisão.** Os SQLs e o schema têm `COMMENT ON COLUMN` documentando as **anomalias dos CSVs originais**:

```sql
COMMENT ON COLUMN fatores_urbanos.latitude IS
  'Latitude; no CSV fonte esta na coluna coordenada_x (invertido)';

COMMENT ON COLUMN denuncias.latitude IS
  'Latitude; fonte CSV usa virgula como separador decimal';
```

**Por quê.** Dado público brasileiro é sujo. Esconder isso quebra o próximo dev. Documentar onde está a sujeira **no schema** é o lugar certo — vive junto do dado.

---

## 12. Twitter via Apify (scraping desacoplado)

**Decisão.** Scraping do Twitter feito por **actor da Apify** (`apidojo~tweet-scraper`), não no nosso processo. Nós só disparamos o run, esperamos, e ingerimos o JSON resultante.

**Por quê.**
- Scraping de Twitter sem API oficial é guerra constante (mudanças de DOM, rate limit, captchas). Terceirizar isso para um actor mantido elimina o problema.
- O nosso código fica focado em **classificação por IA** e **georreferenciamento por keyword** (`src/lib/social/keywords-areas-fm.ts`), que é onde o valor está.
- Custo previsível por run, sem proxies para gerenciar.

**Arquivo.** `src/lib/social/apify-client.ts`.

---

## 13. Mapa em camadas controláveis (separação por componente)

**Decisão.** Cada tipo de overlay vira um componente isolado: `HeatmapLayer`, `FatoresUrbanosLayer`, `AreasFmLayer`, `CamerasLayer`, `RiskZonesLayer`, `FmAllocationLayer`.

**Por quê.**
- O analista alterna camadas o tempo todo (vê só crime, depois só fatores, depois sobreposto). React precisa rerender só a camada que mudou.
- Cada layer tem suas próprias regras de clusterização/normalização (ex.: heatmap normaliza por percentil 95 para evitar que um ponto outlier sature a escala — ver commit `7a3491a` no histórico).
- Filtros globais entram via hook (`useGlobalFilters`), não via prop drilling.

---

## 14. TypeScript estrito + tipos compartilhados

**Decisão.** `src/types/` centraliza `analysis.ts`, `geo.ts`, `leaflet-heat.d.ts`. Imports usam alias `@/types/...`.

**Por quê.** Em projeto de 48h com 4 devs em paralelo, o tipo compartilhado é a **única documentação que ninguém esquece de atualizar** — porque sem ela o build quebra.

---

## 15. Estrutura de rotas espelhando o fluxo do analista

**Decisão.** Rotas no App Router seguem o ritual da reunião, não a estrutura técnica:

```
/                    → Mapa (visão geral)
/coincidencias       → Top 10 hotspots
/cobertura-fm        → Alocação dos 600 agentes
/plano-acao          → Agrupamento por órgão
/relints             → RELINTs gerados
/redes-sociais       → Inteligência do Twitter
```

**Por quê.** O analista não pensa em "endpoint" — pensa em "qual etapa da reunião". URL é UX. Cada rota é uma decisão da reunião semanal materializada.

---

## 16. Pipeline de import em Python (não TypeScript)

**Decisão.** Importação dos CSVs/shapefiles fica em `scripts/import_data.py`, não em código Node.

**Por quê.**
- Python tem `geopandas`, `shapely`, `fiona` — toolkit geoespacial maduro, anos à frente do equivalente JS para parsing de shapefile.
- Import roda **uma vez** (ou semanalmente em batch) — não precisa estar no mesmo runtime da aplicação.
- Time já tinha familiaridade — não foi hora de aprender JS spatial.

**Trade-off aceito.** Dois runtimes no repo. Documentado, isolado em `scripts/`.

---

## Pontos que **não** ficaram prontos (honestidade técnica)

| Item | Status | Caminho conhecido |
|---|---|---|
| SSO da prefeitura | Não | NextAuth + OIDC contra IdP da prefeitura |
| Log de auditoria por usuário | Não | Tabela `audit_log` + middleware em API routes |
| Refresh automático das MVs | Manual | Cron job (`pg_cron` no Neon ou job da Vercel) |
| Cache distribuído | In-memory por instância | Redis (Upstash) — drop-in no `cache.ts` |
| Streaming da resposta da Claude | Não — retorna depois de pronta | `client.messages.stream()` já existe no SDK |
| Testes automatizados | Cobertura mínima | Vitest para `risk-queries.ts` e `analysis-service.ts` é prioridade 1 |

Esses não são desconhecidos — são **trabalho conhecido**, não pesquisa. Estimativa honesta: 30 dias com 2 devs para chegar em "produção da prefeitura".

---

## TL;DR para o júri técnico

1. **PostGIS faz o trabalho pesado** — não JavaScript, não Python rodando em loop.
2. **Materialized views resolveram o problema real** (timeout de 60s do serverless), e o sistema **degrada graciosamente** se elas não existirem.
3. **IA é auditável**: prompt estruturado → JSON validado → fallback determinístico. Nada de saída livre cega.
4. **Plano de ação é regra, não IA** — porque ofício para a RioLuz não pode mudar a cada clique.
5. **Schema espelha a sujeira do dado real** e documenta onde ela está. Não escondemos a fonte.
6. **Cache deduplicado** evita pagar 2x pela mesma análise.
7. **Arquitetura admite escala** sem reescrita: Redis no lugar do Map, Vercel cron pra MVs, NextAuth pro SSO. Caminhos conhecidos.
