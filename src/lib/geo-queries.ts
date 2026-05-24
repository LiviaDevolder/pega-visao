import { sql } from "./db";

export async function getHeatmapPoints(filters: {
  ano?: number;
  mes?: number;
  delito?: string;
  dia_semana?: string;
  hora_inicio?: number;
  hora_fim?: number;
}) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.ano) {
    conditions.push(`ano = $${paramIndex++}`);
    params.push(filters.ano);
  }
  if (filters.mes) {
    conditions.push(`mes = $${paramIndex++}`);
    params.push(filters.mes);
  }
  if (filters.delito) {
    conditions.push(`desc_delito ILIKE $${paramIndex++}`);
    params.push(`%${filters.delito}%`);
  }
  if (filters.dia_semana) {
    conditions.push(`dia_semana = $${paramIndex++}`);
    params.push(filters.dia_semana);
  }
  if (filters.hora_inicio !== undefined && filters.hora_fim !== undefined) {
    conditions.push(
      `EXTRACT(HOUR FROM hora) BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    );
    params.push(filters.hora_inicio, filters.hora_fim);
    paramIndex += 2;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Agregar em grid para performance (~5K pontos em vez de 115K)
  const query = `
    SELECT
      ROUND(latitude::numeric, 3) as lat,
      ROUND(longitude::numeric, 3) as lng,
      COUNT(*)::int as weight
    FROM ocorrencias
    ${whereClause}
    GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3)
  `;

  const rows = await sql(query, params);
  return rows.map((r: Record<string, unknown>) => ({
    lat: Number(r.lat),
    lng: Number(r.lng),
    weight: Number(r.weight),
  }));
}

export async function getFatoresUrbanos() {
  const rows = await sql(`
    SELECT
      id, latitude, longitude,
      tipo_ocorrencia_descricao,
      orgao_responsavel,
      logradouro,
      observacao
    FROM fatores_urbanos
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `);
  return rows;
}

export async function getAreasFm() {
  const rows = await sql(`
    SELECT
      a.id,
      a.nome_area_fm,
      ST_AsGeoJSON(a.geom) as geojson,
      (SELECT COUNT(*) FROM ocorrencias o WHERE ST_Contains(a.geom, o.geom)) as total_ocorrencias,
      (SELECT COUNT(*) FROM fatores_urbanos f WHERE f.geom IS NOT NULL AND ST_Contains(a.geom, f.geom)) as total_fatores
    FROM areas_fm a
    ORDER BY a.nome_area_fm
  `);
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    nome_area_fm: r.nome_area_fm,
    geojson: JSON.parse(r.geojson as string),
    total_ocorrencias: Number(r.total_ocorrencias),
    total_fatores: Number(r.total_fatores),
  }));
}

export async function getCameras() {
  const rows = await sql(`
    SELECT
      id,
      id_ponto,
      nome_area_fm,
      ST_Y(geom) as latitude,
      ST_X(geom) as longitude
    FROM cameras
  `);
  return rows;
}

export async function getDelitos() {
  const rows = await sql(`
    SELECT DISTINCT desc_delito FROM ocorrencias ORDER BY desc_delito
  `);
  return rows.map((r: Record<string, unknown>) => r.desc_delito as string);
}

export async function getAnosDisponiveis() {
  const rows = await sql(`
    SELECT DISTINCT ano FROM ocorrencias ORDER BY ano
  `);
  return rows.map((r: Record<string, unknown>) => Number(r.ano));
}
