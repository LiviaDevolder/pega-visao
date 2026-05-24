import { sql } from "./db";
import type { AreaAnalysisData } from "./ai/prompts/area-analysis";

export async function aggregateAreaData(
  areaFmId: number
): Promise<AreaAnalysisData> {
  const [
    areaInfo,
    topDelitos,
    distribuicaoDia,
    distribuicaoHora,
    fatoresPorOrgao,
    denunciasPorClasse,
    dominios,
  ] = await Promise.all([
    sql(
      `
      SELECT
        a.nome_area_fm,
        (SELECT COUNT(*) FROM ocorrencias o WHERE ST_Contains(a.geom, o.geom)) as total_ocorrencias,
        (SELECT COUNT(*) FROM denuncias d WHERE d.geom IS NOT NULL AND ST_Contains(a.geom, d.geom)) as total_denuncias,
        (SELECT COUNT(*) FROM fatores_urbanos f WHERE f.geom IS NOT NULL AND ST_Contains(a.geom, f.geom)) as total_fatores
      FROM areas_fm a WHERE a.id = $1
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT desc_delito, COUNT(*)::int as total
      FROM ocorrencias o
      JOIN areas_fm a ON ST_Contains(a.geom, o.geom)
      WHERE a.id = $1
      GROUP BY desc_delito ORDER BY total DESC LIMIT 10
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT dia_semana, COUNT(*)::int as total
      FROM ocorrencias o
      JOIN areas_fm a ON ST_Contains(a.geom, o.geom)
      WHERE a.id = $1 AND dia_semana IS NOT NULL
      GROUP BY dia_semana ORDER BY total DESC
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT EXTRACT(HOUR FROM hora)::int as hora, COUNT(*)::int as total
      FROM ocorrencias o
      JOIN areas_fm a ON ST_Contains(a.geom, o.geom)
      WHERE a.id = $1 AND hora IS NOT NULL
      GROUP BY EXTRACT(HOUR FROM hora) ORDER BY total DESC
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT orgao_responsavel, tipo_ocorrencia_descricao as tipo, COUNT(*)::int as total
      FROM fatores_urbanos f
      JOIN areas_fm a ON ST_Contains(a.geom, f.geom)
      WHERE a.id = $1 AND f.geom IS NOT NULL
      GROUP BY orgao_responsavel, tipo_ocorrencia_descricao ORDER BY total DESC
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT assuntos_classe as classe, COUNT(*)::int as total
      FROM denuncias d
      JOIN areas_fm a ON ST_Contains(a.geom, d.geom)
      WHERE a.id = $1 AND d.geom IS NOT NULL
      GROUP BY assuntos_classe ORDER BY total DESC LIMIT 10
    `,
      [areaFmId]
    ),
    sql(
      `
      SELECT DISTINCT dt.nome_territorio as nome, dt.dominio_orcrim as sigla
      FROM dominios_territoriais dt
      JOIN areas_fm a ON ST_Intersects(a.geom, dt.geom)
      WHERE a.id = $1
    `,
      [areaFmId]
    ),
  ]);

  const info = areaInfo[0] as Record<string, unknown>;

  return {
    nome_area_fm: info.nome_area_fm as string,
    total_ocorrencias: Number(info.total_ocorrencias),
    total_denuncias: Number(info.total_denuncias),
    total_fatores: Number(info.total_fatores),
    top_delitos: topDelitos as Array<{ desc_delito: string; total: number }>,
    distribuicao_dia_semana: distribuicaoDia as Array<{
      dia_semana: string;
      total: number;
    }>,
    distribuicao_horaria: distribuicaoHora as Array<{
      hora: number;
      total: number;
    }>,
    fatores_por_orgao: fatoresPorOrgao as Array<{
      orgao_responsavel: string;
      tipo: string;
      total: number;
    }>,
    denuncias_por_classe: denunciasPorClasse as Array<{
      classe: string;
      total: number;
    }>,
    dominios_presentes: dominios as Array<{ nome: string; sigla: string }>,
  };
}
