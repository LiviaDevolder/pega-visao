import { NextRequest, NextResponse } from "next/server";
import {
  aggregateAreaData,
  getHeatmapDiaHora,
} from "@/lib/area-data-aggregator";
import { buildAreaAnalysisPrompt } from "@/lib/ai/prompts/area-analysis";
import { generateAnalysis } from "@/lib/ai/anthropic-client";
import {
  buildGenericFallback,
  getFallbackByAreaId,
} from "@/lib/ai/demo-fallbacks";
import type { AreaAnalysis } from "@/types/analysis";

export const maxDuration = 30;

function isValidAnalysis(value: unknown): value is AreaAnalysis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.resumo_executivo !== "string") return false;
  if (typeof v.dinamica_criminal !== "string") return false;
  const pn = v.perguntas_norteadoras as Record<string, unknown> | undefined;
  if (!pn || typeof pn !== "object") return false;
  for (const key of [
    "rota_fm",
    "horario_qmd",
    "modelo_emprego",
    "fatores_orgaos",
  ]) {
    const p = pn[key] as Record<string, unknown> | undefined;
    if (
      !p ||
      typeof p.diagnostico !== "string" ||
      typeof p.sugestao !== "string"
    ) {
      return false;
    }
  }
  return true;
}

function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { area_fm_id } = body;

    if (!area_fm_id) {
      return NextResponse.json(
        { error: "Parametro area_fm_id obrigatorio" },
        { status: 400 }
      );
    }

    const [data, heatmap] = await Promise.all([
      aggregateAreaData(area_fm_id),
      getHeatmapDiaHora(area_fm_id),
    ]);

    if (data.total_ocorrencias === 0) {
      return NextResponse.json(
        {
          error:
            "Dados insuficientes para gerar analise desta area. Nenhuma ocorrencia encontrada.",
        },
        { status: 404 }
      );
    }

    const demoMode = process.env.DEMO_MODE === "true";
    let analysis: AreaAnalysis | null = null;
    let fonte: "ia" | "fallback" = "ia";

    if (demoMode) {
      analysis =
        getFallbackByAreaId(area_fm_id) ?? buildGenericFallback(data);
      fonte = "fallback";
    } else {
      try {
        const prompt = buildAreaAnalysisPrompt(data);
        const response = await generateAnalysis(prompt);
        const parsed = extractJson(response);
        if (isValidAnalysis(parsed)) {
          analysis = parsed;
        }
      } catch (err) {
        console.error("Falha na chamada da IA, usando fallback:", err);
      }

      if (!analysis) {
        analysis =
          getFallbackByAreaId(area_fm_id) ?? buildGenericFallback(data);
        fonte = "fallback";
      }
    }

    return NextResponse.json({
      area: data.nome_area_fm,
      analysis,
      metadata: {
        total_ocorrencias: data.total_ocorrencias,
        total_denuncias: data.total_denuncias,
        total_fatores: data.total_fatores,
        fonte,
      },
      heatmap_dia_hora: heatmap,
    });
  } catch (error) {
    console.error("Erro na analise de area:", error);
    return NextResponse.json(
      { error: "Erro ao gerar analise da area" },
      { status: 500 }
    );
  }
}
