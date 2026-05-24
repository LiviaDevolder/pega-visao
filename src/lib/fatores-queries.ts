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
  const rows = await sql(
    `
    WITH area_risk AS (
      SELECT
        a.id,
        a.geom,
        CASE
          WHEN (SELECT COUNT(*) FROM ocorrencias o WHERE ST_Contains(a.geom, o.geom))::float /
               GREATEST(1, ST_Area(a.geom::geography) / 1000000.0) >
               (SELECT AVG(cnt / GREATEST(1, ar))
                FROM (SELECT COUNT(*) as cnt, ST_Area(geom::geography)/1000000.0 as ar
                      FROM areas_fm a2
                      JOIN ocorrencias o ON ST_Contains(a2.geom, o.geom)
                      GROUP BY a2.id, a2.geom) sub)
          THEN 'alto'
          ELSE 'medio'
        END as risk_level
      FROM areas_fm a
      WHERE a.id = $1
    )
    SELECT
      f.id,
      f.tipo_ocorrencia_descricao,
      f.orgao_responsavel,
      f.logradouro,
      f.observacao,
      f.bairro_nome,
      f.latitude,
      f.longitude,
      ar.risk_level
    FROM fatores_urbanos f
    JOIN area_risk ar ON ST_Contains(ar.geom, f.geom)
    WHERE f.geom IS NOT NULL
    ORDER BY
      CASE ar.risk_level WHEN 'alto' THEN 0 ELSE 1 END,
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
      risk_level: row.risk_level as string,
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
