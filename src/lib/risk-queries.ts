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

export async function getRiskScoring(): Promise<RiskScore[]> {
  const rows = await sql(`
    WITH ocorrencias_por_area AS (
      SELECT a.id, COUNT(o.*)::int as total
      FROM areas_fm a
      LEFT JOIN ocorrencias o ON ST_Contains(a.geom, o.geom)
      GROUP BY a.id
    ),
    fatores_por_area AS (
      SELECT a.id, COUNT(f.*)::int as total
      FROM areas_fm a
      LEFT JOIN fatores_urbanos f
        ON f.geom IS NOT NULL AND ST_Contains(a.geom, f.geom)
      GROUP BY a.id
    ),
    denuncias_por_area AS (
      SELECT a.id, COUNT(d.*)::int as total
      FROM areas_fm a
      LEFT JOIN denuncias d
        ON d.geom IS NOT NULL AND ST_Contains(a.geom, d.geom)
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
  `);

  return rows.map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    nome_area_fm: r.nome_area_fm as string,
    geojson: r.geojson as string,
    ocorrencias_count: Number(r.ocorrencias_count),
    fatores_count: Number(r.fatores_count),
    denuncias_count: Number(r.denuncias_count),
    area_km2: Number(r.area_km2),
    risk_score: Number(r.risk_score),
    risk_level: r.risk_level as "baixo" | "medio" | "alto",
  }));
}

export async function getRiskHotspots(
  radiusMeters: number
): Promise<RiskHotspot[]> {
  const rows = await sql(
    `
    WITH hotspot_candidates AS (
      SELECT DISTINCT ON (ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3))
        latitude, longitude, locf as logradouro, geom
      FROM ocorrencias
      WHERE geom IS NOT NULL
      ORDER BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3), id
    ),
    scored_points AS (
      SELECT
        hc.latitude,
        hc.longitude,
        hc.logradouro,
        (SELECT COUNT(*) FROM ocorrencias o2
         WHERE ST_DWithin(hc.geom::geography, o2.geom::geography, $1)) as ocorrencias_no_raio,
        (SELECT COUNT(*) FROM fatores_urbanos f
         WHERE f.geom IS NOT NULL AND ST_DWithin(hc.geom::geography, f.geom::geography, $1)) as fatores_no_raio,
        (SELECT COUNT(*) FROM denuncias d
         WHERE d.geom IS NOT NULL AND ST_DWithin(hc.geom::geography, d.geom::geography, $1)) as denuncias_no_raio
      FROM hotspot_candidates hc
    )
    SELECT
      latitude, longitude, logradouro,
      ocorrencias_no_raio::int,
      fatores_no_raio::int,
      denuncias_no_raio::int,
      (ocorrencias_no_raio * (1 + fatores_no_raio) * (1 + denuncias_no_raio))::float as score
    FROM scored_points
    WHERE fatores_no_raio > 0 OR denuncias_no_raio > 0
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
