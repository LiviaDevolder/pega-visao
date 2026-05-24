import { sql } from "./db";

export interface RiskScore {
  id: number;
  nome_area_fm: string;
  geojson: string;
  ocorrencias_count: number;
  fatores_count: number;
  denuncias_count: number;
  area_km2: number;
  risk_score: number;
  risk_level: "baixo" | "medio" | "alto";
}

export interface RiskHotspot {
  latitude: number;
  longitude: number;
  logradouro: string | null;
  ocorrencias_no_raio: number;
  fatores_no_raio: number;
  denuncias_no_raio: number;
  score: number;
}

function mapRiskRow(r: Record<string, unknown>): RiskScore {
  return {
    id: Number(r.id),
    nome_area_fm: r.nome_area_fm as string,
    geojson: r.geojson as string,
    ocorrencias_count: Number(r.ocorrencias_count),
    fatores_count: Number(r.fatores_count),
    denuncias_count: Number(r.denuncias_count),
    area_km2: Number(r.area_km2),
    risk_score: Number(r.risk_score),
    risk_level: r.risk_level as "baixo" | "medio" | "alto",
  };
}

const SCORED_AND_RANKED = `
  scored AS (
    SELECT
      *,
      CASE WHEN area_km2 > 0
        THEN (ocorrencias_count::float / area_km2) *
             (1 + fatores_count::float / GREATEST(1, (SELECT MAX(fatores_count) FROM area_stats))) *
             (1 + denuncias_count::float / GREATEST(1, (SELECT MAX(denuncias_count) FROM area_stats)))
        ELSE 0
      END as raw_score
    FROM area_stats
  ),
  normalized AS (
    SELECT
      *,
      CASE WHEN (SELECT MAX(raw_score) FROM scored) > 0
        THEN raw_score / (SELECT MAX(raw_score) FROM scored)
        ELSE 0
      END as risk_score
    FROM scored
  )
  SELECT
    id, nome_area_fm, geojson, area_km2,
    ocorrencias_count::int, fatores_count::int, denuncias_count::int,
    ROUND(risk_score::numeric, 4) as risk_score,
    CASE
      WHEN risk_score >= 0.66 THEN 'alto'
      WHEN risk_score >= 0.33 THEN 'medio'
      ELSE 'baixo'
    END as risk_level
  FROM normalized
  ORDER BY risk_score DESC
`;

async function getRiskScoringFast(): Promise<RiskScore[]> {
  const rows = await sql(`
    WITH area_stats AS (SELECT * FROM area_stats_mv),
    ${SCORED_AND_RANKED}
  `);
  return rows.map(mapRiskRow);
}

async function getRiskScoringSlow(): Promise<RiskScore[]> {
  const rows = await sql(`
    WITH ocorrencias_por_area AS (
      SELECT a.id, COUNT(o.*)::int as total
      FROM areas_fm a
      LEFT JOIN ocorrencias o ON ST_Intersects(a.geom, o.geom)
      GROUP BY a.id
    ),
    fatores_por_area AS (
      SELECT a.id, COUNT(f.*)::int as total
      FROM areas_fm a
      LEFT JOIN fatores_urbanos f
        ON f.geom IS NOT NULL AND ST_Intersects(a.geom, f.geom)
      GROUP BY a.id
    ),
    denuncias_por_area AS (
      SELECT a.id, COUNT(d.*)::int as total
      FROM areas_fm a
      LEFT JOIN denuncias d
        ON d.geom IS NOT NULL AND ST_Intersects(a.geom, d.geom)
      GROUP BY a.id
    ),
    area_stats AS (
      SELECT
        a.id,
        a.nome_area_fm,
        ST_AsGeoJSON(a.geom) as geojson,
        ST_Area(a.geom::geography) / 1000000.0 as area_km2,
        COALESCE(oa.total, 0) as ocorrencias_count,
        COALESCE(fa.total, 0) as fatores_count,
        COALESCE(da.total, 0) as denuncias_count
      FROM areas_fm a
      LEFT JOIN ocorrencias_por_area oa ON oa.id = a.id
      LEFT JOIN fatores_por_area fa ON fa.id = a.id
      LEFT JOIN denuncias_por_area da ON da.id = a.id
    ),
    ${SCORED_AND_RANKED}
  `);
  return rows.map(mapRiskRow);
}

export async function getRiskScoring(): Promise<RiskScore[]> {
  try {
    return await getRiskScoringFast();
  } catch (err) {
    const msg = String(err);
    if (msg.includes("does not exist") || msg.includes("area_stats_mv")) {
      console.warn(
        "area_stats_mv nao existe — usando query lenta. Rode db/migrations/002_area_stats_mv.sql para acelerar."
      );
      return getRiskScoringSlow();
    }
    throw err;
  }
}

export async function getRiskHotspots(
  radiusMeters: number
): Promise<RiskHotspot[]> {
  // Pré-agrega ocorrências em células de ~100m (ST_SnapToGrid 0.001°), pega as
  // 500 células mais densas como candidatas e só então faz 3 spatial joins
  // (LATERAL + ST_DWithin) usando o índice GIST. Substitui a varredura O(N²) de
  // subqueries correlatas sobre ~30k pontos distintos.
  const rows = await sql(
    `
    WITH cell_counts AS (
      SELECT
        ST_SnapToGrid(geom, 0.001) AS cell,
        COUNT(*) AS ocorrencias_cell_count,
        (array_agg(locf) FILTER (WHERE locf IS NOT NULL))[1] AS logradouro
      FROM ocorrencias
      WHERE geom IS NOT NULL
      GROUP BY ST_SnapToGrid(geom, 0.001)
      ORDER BY COUNT(*) DESC
      LIMIT 500
    ),
    candidates AS (
      SELECT
        cell::geography AS geog,
        ST_Y(cell) AS latitude,
        ST_X(cell) AS longitude,
        logradouro
      FROM cell_counts
    )
    SELECT
      c.latitude,
      c.longitude,
      c.logradouro,
      oc.cnt AS ocorrencias_no_raio,
      fc.cnt AS fatores_no_raio,
      dc.cnt AS denuncias_no_raio,
      (oc.cnt::float * (1 + fc.cnt) * (1 + dc.cnt)) AS score
    FROM candidates c
    CROSS JOIN LATERAL (
      SELECT COUNT(*)::int AS cnt FROM ocorrencias o
      WHERE o.geom IS NOT NULL AND ST_DWithin(c.geog, o.geom::geography, $1)
    ) oc
    CROSS JOIN LATERAL (
      SELECT COUNT(*)::int AS cnt FROM fatores_urbanos f
      WHERE f.geom IS NOT NULL AND ST_DWithin(c.geog, f.geom::geography, $1)
    ) fc
    CROSS JOIN LATERAL (
      SELECT COUNT(*)::int AS cnt FROM denuncias d
      WHERE d.geom IS NOT NULL AND ST_DWithin(c.geog, d.geom::geography, $1)
    ) dc
    WHERE fc.cnt > 0 OR dc.cnt > 0
    ORDER BY score DESC
    LIMIT 10
  `,
    [radiusMeters]
  );

  return rows.map((r: Record<string, unknown>) => ({
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    logradouro: r.logradouro as string | null,
    ocorrencias_no_raio: Number(r.ocorrencias_no_raio),
    fatores_no_raio: Number(r.fatores_no_raio),
    denuncias_no_raio: Number(r.denuncias_no_raio),
    score: Number(r.score),
  }));
}

export async function getRiskDetail(areaFmId: number) {
  const [ocorrencias, fatores, denuncias] = await Promise.all([
    sql(
      `
      SELECT desc_delito, COUNT(*)::int as total
      FROM ocorrencias o
      JOIN areas_fm a ON ST_Contains(a.geom, o.geom)
      WHERE a.id = $1
      GROUP BY desc_delito
      ORDER BY total DESC
      LIMIT 10
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT orgao_responsavel, tipo_ocorrencia_descricao, COUNT(*)::int as total
      FROM fatores_urbanos f
      JOIN areas_fm a ON ST_Contains(a.geom, f.geom)
      WHERE a.id = $1 AND f.geom IS NOT NULL
      GROUP BY orgao_responsavel, tipo_ocorrencia_descricao
      ORDER BY total DESC
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT assuntos_classe, COUNT(*)::int as total
      FROM denuncias d
      JOIN areas_fm a ON ST_Contains(a.geom, d.geom)
      WHERE a.id = $1 AND d.geom IS NOT NULL
      GROUP BY assuntos_classe
      ORDER BY total DESC
      LIMIT 10
    `,
      [areaFmId]
    ),
  ]);

  return { ocorrencias, fatores, denuncias };
}
