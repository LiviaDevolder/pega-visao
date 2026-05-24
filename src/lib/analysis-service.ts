import { aggregateAreaData, getHeatmapDiaHora } from "./area-data-aggregator";
import { buildAreaAnalysisPrompt, type AreaAnalysisData } from "./ai/prompts/area-analysis";
import { generateAnalysis } from "./ai/anthropic-client";
import { buildGenericFallback, getFallbackByAreaId } from "./ai/demo-fallbacks";
import { getOrSet } from "./cache";
import type { AreaAnalysis, HeatmapCell } from "@/types/analysis";

const ANALYSIS_TTL_MS = 10 * 60 * 1000; // 10 minutos

export interface AreaAnalysisBundle {
  areaData: AreaAnalysisData;
  analysis: AreaAnalysis;
  heatmap: HeatmapCell[];
  fonte: "ia" | "fallback";
}

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

export function getAreaAnalysisBundle(
  areaFmId: number
): Promise<AreaAnalysisBundle> {
  return getOrSet(`analysis:area:${areaFmId}`, ANALYSIS_TTL_MS, async () => {
    const [areaData, heatmap] = await Promise.all([
      aggregateAreaData(areaFmId),
      getHeatmapDiaHora(areaFmId),
    ]);

    const demoMode = process.env.DEMO_MODE === "true";
    let analysis: AreaAnalysis | null = null;
    let fonte: "ia" | "fallback" = "ia";

    if (demoMode) {
      analysis = getFallbackByAreaId(areaFmId) ?? buildGenericFallback(areaData);
      fonte = "fallback";
    } else {
      try {
        const prompt = buildAreaAnalysisPrompt(areaData);
        const response = await generateAnalysis(prompt);
        const parsed = extractJson(response);
        if (isValidAnalysis(parsed)) {
          analysis = parsed;
        }
      } catch (err) {
        console.error("Falha na chamada da IA, usando fallback:", err);
      }
      if (!analysis) {
        analysis = getFallbackByAreaId(areaFmId) ?? buildGenericFallback(areaData);
        fonte = "fallback";
      }
    }

    return { areaData, analysis, heatmap, fonte };
  });
}
