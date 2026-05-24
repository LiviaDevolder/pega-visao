import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateAnalysis } from "@/lib/ai/anthropic-client";
import {
  buildFmAllocationPrompt,
  type FmAreaMetrics,
  type FmAllocation,
} from "@/lib/ai/prompts/fm-allocation";

export const maxDuration = 30;

export async function POST() {
  try {
    // Agregar metricas por area FM
    const areas = await sql(`
      WITH area_metrics AS (
        SELECT
          a.id,
          a.nome_area_fm,
          (SELECT COUNT(*) FROM ocorrencias o WHERE ST_Contains(a.geom, o.geom))::int as total_ocorrencias,
          (SELECT COUNT(*) FROM fatores_urbanos f WHERE f.geom IS NOT NULL AND ST_Contains(a.geom, f.geom))::int as total_fatores,
          ST_Area(a.geom::geography) / 1000000.0 as area_km2
        FROM areas_fm a
      ),
      scored AS (
        SELECT *,
          CASE WHEN area_km2 > 0
            THEN (total_ocorrencias::float / area_km2) * (1 + total_fatores::float / GREATEST(1, (SELECT MAX(total_fatores) FROM area_metrics)))
            ELSE 0
          END as raw_score
        FROM area_metrics
      )
      SELECT
        id, nome_area_fm, total_ocorrencias, total_fatores,
        ROUND((raw_score / GREATEST(1, (SELECT MAX(raw_score) FROM scored)))::numeric, 4) as risk_score,
        CASE
          WHEN raw_score / GREATEST(1, (SELECT MAX(raw_score) FROM scored)) >= 0.66 THEN 'alto'
          WHEN raw_score / GREATEST(1, (SELECT MAX(raw_score) FROM scored)) >= 0.33 THEN 'medio'
          ELSE 'baixo'
        END as risk_level
      FROM scored
      ORDER BY risk_score DESC
    `);

    // Buscar top delitos e horarios pico por area
    const areaMetrics: FmAreaMetrics[] = await Promise.all(
      (areas as Array<Record<string, unknown>>).map(async (a) => {
        const delitos = await sql(
          `SELECT desc_delito FROM ocorrencias o
           JOIN areas_fm af ON ST_Contains(af.geom, o.geom)
           WHERE af.id = $1
           GROUP BY desc_delito ORDER BY COUNT(*) DESC LIMIT 3`,
          [a.id]
        );

        const horarios = await sql(
          `SELECT EXTRACT(HOUR FROM hora)::int as hora
           FROM ocorrencias o
           JOIN areas_fm af ON ST_Contains(af.geom, o.geom)
           WHERE af.id = $1 AND hora IS NOT NULL
           GROUP BY EXTRACT(HOUR FROM hora)
           ORDER BY COUNT(*) DESC LIMIT 3`,
          [a.id]
        );

        return {
          id: Number(a.id),
          nome_area_fm: a.nome_area_fm as string,
          total_ocorrencias: Number(a.total_ocorrencias),
          total_fatores: Number(a.total_fatores),
          risk_score: Number(a.risk_score),
          risk_level: a.risk_level as string,
          top_delitos: delitos.map(
            (d: Record<string, unknown>) => d.desc_delito as string
          ),
          horarios_pico: horarios.map(
            (h: Record<string, unknown>) => Number(h.hora)
          ),
        };
      })
    );

    // Gerar sugestao com Claude
    const prompt = buildFmAllocationPrompt(areaMetrics);
    const response = await generateAnalysis(prompt);

    let allocation: FmAllocation[];
    try {
      allocation = JSON.parse(response);
    } catch {
      return NextResponse.json(
        { error: "Erro ao processar resposta da IA" },
        { status: 500 }
      );
    }

    // Validar soma = 600
    const total = allocation.reduce((sum, a) => sum + a.agentes, 0);
    if (total !== 600) {
      // Ajustar proporcionalmente
      const factor = 600 / total;
      let adjusted = allocation.map((a) => ({
        ...a,
        agentes: Math.max(10, Math.round(a.agentes * factor)),
      }));
      const newTotal = adjusted.reduce((sum, a) => sum + a.agentes, 0);
      const diff = 600 - newTotal;
      if (diff !== 0) {
        adjusted[0].agentes += diff;
      }
      allocation = adjusted;
    }

    return NextResponse.json({ allocation, metrics: areaMetrics });
  } catch (error) {
    console.error("Erro na sugestao FM:", error);
    return NextResponse.json(
      { error: "Erro ao gerar sugestao de cobertura" },
      { status: 500 }
    );
  }
}
