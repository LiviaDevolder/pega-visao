-- Materialized view pre-calculando os counts por area FM.
-- Resolve timeouts em /api/geo/risk-scoring: a query original cruzava
-- 22 areas x ~115k ocorrencias x fatores x denuncias dentro de
-- subqueries correlatas e nao cabia em 60s de serverless.
-- Esta MV reduz o trabalho de runtime a um SELECT sobre 22 linhas.

CREATE MATERIALIZED VIEW IF NOT EXISTS area_stats_mv AS
WITH
ocorrencias_por_area AS (
  SELECT a.id, COUNT(o.*)::int AS total
  FROM areas_fm a
  LEFT JOIN ocorrencias o ON ST_Intersects(a.geom, o.geom)
  GROUP BY a.id
),
fatores_por_area AS (
  SELECT a.id, COUNT(f.*)::int AS total
  FROM areas_fm a
  LEFT JOIN fatores_urbanos f
    ON f.geom IS NOT NULL AND ST_Intersects(a.geom, f.geom)
  GROUP BY a.id
),
denuncias_por_area AS (
  SELECT a.id, COUNT(d.*)::int AS total
  FROM areas_fm a
  LEFT JOIN denuncias d
    ON d.geom IS NOT NULL AND ST_Intersects(a.geom, d.geom)
  GROUP BY a.id
)
SELECT
  a.id,
  a.nome_area_fm,
  ST_AsGeoJSON(a.geom) AS geojson,
  ST_Area(a.geom::geography) / 1000000.0 AS area_km2,
  COALESCE(oa.total, 0) AS ocorrencias_count,
  COALESCE(fa.total, 0) AS fatores_count,
  COALESCE(da.total, 0) AS denuncias_count
FROM areas_fm a
LEFT JOIN ocorrencias_por_area oa ON oa.id = a.id
LEFT JOIN fatores_por_area fa ON fa.id = a.id
LEFT JOIN denuncias_por_area da ON da.id = a.id;

CREATE UNIQUE INDEX IF NOT EXISTS area_stats_mv_id_idx ON area_stats_mv(id);

-- Para atualizar apos novos dados (ou execute manualmente via psql):
--   REFRESH MATERIALIZED VIEW CONCURRENTLY area_stats_mv;
