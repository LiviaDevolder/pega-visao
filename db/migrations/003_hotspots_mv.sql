-- Materialized view pre-calculando hotspots por celula de grid (~200m).
-- Substitui a query de N+1 spatial joins (500 candidates x 3 ST_DWithin)
-- que demorava 144s no banco e timeoutava no serverless.
--
-- Abordagem: agrega cada tabela (ocorrencias, fatores_urbanos, denuncias)
-- por celula de grid usando ST_SnapToGrid(0.002 graus ~ 200m no Rio),
-- depois LEFT JOIN das tres agregacoes. Score multiplicativo igual ao
-- da query original.

CREATE MATERIALIZED VIEW IF NOT EXISTS hotspots_mv AS
WITH grid_ocorr AS (
  SELECT
    ST_SnapToGrid(geom, 0.002) AS cell,
    COUNT(*)::int AS cnt,
    (array_agg(locf) FILTER (WHERE locf IS NOT NULL))[1] AS logradouro
  FROM ocorrencias
  WHERE geom IS NOT NULL
  GROUP BY ST_SnapToGrid(geom, 0.002)
),
grid_fatores AS (
  SELECT ST_SnapToGrid(geom, 0.002) AS cell, COUNT(*)::int AS cnt
  FROM fatores_urbanos
  WHERE geom IS NOT NULL
  GROUP BY ST_SnapToGrid(geom, 0.002)
),
grid_denun AS (
  SELECT ST_SnapToGrid(geom, 0.002) AS cell, COUNT(*)::int AS cnt
  FROM denuncias
  WHERE geom IS NOT NULL
  GROUP BY ST_SnapToGrid(geom, 0.002)
)
SELECT
  ST_Y(go.cell) AS latitude,
  ST_X(go.cell) AS longitude,
  go.logradouro,
  go.cnt AS ocorrencias_no_raio,
  COALESCE(gf.cnt, 0) AS fatores_no_raio,
  COALESCE(gd.cnt, 0) AS denuncias_no_raio,
  (go.cnt::float * (1 + COALESCE(gf.cnt, 0)) * (1 + COALESCE(gd.cnt, 0))) AS score
FROM grid_ocorr go
LEFT JOIN grid_fatores gf ON ST_Equals(gf.cell, go.cell)
LEFT JOIN grid_denun gd ON ST_Equals(gd.cell, go.cell)
WHERE COALESCE(gf.cnt, 0) > 0 OR COALESCE(gd.cnt, 0) > 0;

CREATE INDEX IF NOT EXISTS hotspots_mv_score_idx ON hotspots_mv (score DESC);

-- Para atualizar apos novos dados:
--   REFRESH MATERIALIZED VIEW hotspots_mv;
