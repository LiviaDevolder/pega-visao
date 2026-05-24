import { sql } from "./db";

export interface FatorComAcao {
  id: number;
  tipo_ocorrencia_descricao: string;
  orgao_responsavel: string;
  logradouro: string | null;
  observacao: string | null;
  bairro_nome: string | null;
  latitude: number;
  longitude: number;
  risk_level: string;
}

export interface FatoresPorOrgao {
  orgao: string;
  total: number;
  fatores: FatorComAcao[];
}

export async function getFatoresByAreaFm(
  areaFmId: number
): Promise<FatoresPorOrgao[]> {
  // Densidade media de ocorrencias por km2 (todas as 22 areas) — single scan
  // com indice GIST. Evita subqueries correlatas dentro do CASE, que causavam
  // timeout em produção (mesmo padrao do bug do BINGO, ver commit 832ef1e).
  const densityRows = await sql(
    `
    WITH areas_density AS (
      SELECT
        a.id,
        COUNT(o.*)::float / GREATEST(1, ST_Area(a.geom::geography) / 1000000.0) as density
      FROM areas_fm a
      LEFT JOIN ocorrencias o ON ST_Contains(a.geom, o.geom)
      GROUP BY a.id, a.geom
    )
    SELECT
      (SELECT density FROM areas_density WHERE id = $1) as target_density,
      (SELECT AVG(density) FROM areas_density) as avg_density
  `,
    [areaFmId]
  );

  const dRow = (densityRows[0] || {}) as Record<string, unknown>;
  const targetDensity = Number(dRow.target_density ?? 0);
  const avgDensity = Number(dRow.avg_density ?? 0);
  const riskLevel = targetDensity > avgDensity ? "alto" : "medio";

  const rows = await sql(
    `
    SELECT
      f.id,
      f.tipo_ocorrencia_descricao,
      f.orgao_responsavel,
      f.logradouro,
      f.observacao,
      f.bairro_nome,
      f.latitude,
      f.longitude
    FROM fatores_urbanos f
    JOIN areas_fm a ON ST_Contains(a.geom, f.geom)
    WHERE a.id = $1 AND f.geom IS NOT NULL
    ORDER BY
      f.orgao_responsavel,
      f.tipo_ocorrencia_descricao
  `,
    [areaFmId]
  );

  // Agrupar por orgao
  const orgaoMap = new Map<string, FatorComAcao[]>();

  for (const row of rows as Array<Record<string, unknown>>) {
    const orgao = (row.orgao_responsavel as string) || "Nao definido";
    const fatores = orgaoMap.get(orgao) || [];
    fatores.push({
      id: Number(row.id),
      tipo_ocorrencia_descricao: row.tipo_ocorrencia_descricao as string,
      orgao_responsavel: orgao,
      logradouro: row.logradouro as string | null,
      observacao: row.observacao as string | null,
      bairro_nome: row.bairro_nome as string | null,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      risk_level: riskLevel,
    });
    orgaoMap.set(orgao, fatores);
  }

  return Array.from(orgaoMap.entries())
    .map(([orgao, fatores]) => ({
      orgao,
      total: fatores.length,
      fatores,
    }))
    .sort((a, b) => b.total - a.total);
}
