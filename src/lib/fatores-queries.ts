import { sql } from "./db";
import { getOrSet } from "./cache";

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

const FATORES_TTL_MS = 10 * 60 * 1000; // 10 min por area
const DENSITY_TTL_MS = 30 * 60 * 1000; // 30 min — base raramente muda

interface DensityStats {
  byArea: Map<number, number>;
  avgDensity: number;
}

async function getDensityStats(): Promise<DensityStats> {
  return getOrSet("fatores:density:all", DENSITY_TTL_MS, async () => {
    const rows = await sql(`
      SELECT
        a.id,
        COUNT(o.*)::float / GREATEST(1, ST_Area(a.geom::geography) / 1000000.0) as density
      FROM areas_fm a
      LEFT JOIN ocorrencias o ON ST_Contains(a.geom, o.geom)
      GROUP BY a.id, a.geom
    `);

    const byArea = new Map<number, number>();
    let sum = 0;
    for (const r of rows as Array<Record<string, unknown>>) {
      const id = Number(r.id);
      const density = Number(r.density ?? 0);
      byArea.set(id, density);
      sum += density;
    }
    const avgDensity = byArea.size > 0 ? sum / byArea.size : 0;
    return { byArea, avgDensity };
  });
}

export async function getFatoresByAreaFm(
  areaFmId: number
): Promise<FatoresPorOrgao[]> {
  return getOrSet(
    `fatores:area:${areaFmId}`,
    FATORES_TTL_MS,
    async () => {
      const stats = await getDensityStats();
      const targetDensity = stats.byArea.get(areaFmId) ?? 0;
      const riskLevel = targetDensity > stats.avgDensity ? "alto" : "medio";

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
  );
}
