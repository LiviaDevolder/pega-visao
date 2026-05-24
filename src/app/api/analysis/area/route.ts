import { NextRequest, NextResponse } from "next/server";
import { aggregateAreaData } from "@/lib/area-data-aggregator";
import { buildAreaAnalysisPrompt } from "@/lib/ai/prompts/area-analysis";
import { generateAnalysis } from "@/lib/ai/anthropic-client";

export const maxDuration = 30;

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

    const data = await aggregateAreaData(area_fm_id);

    if (data.total_ocorrencias === 0) {
      return NextResponse.json(
        {
          error:
            "Dados insuficientes para gerar analise desta area. Nenhuma ocorrencia encontrada.",
        },
        { status: 404 }
      );
    }

    const prompt = buildAreaAnalysisPrompt(data);
    const response = await generateAnalysis(prompt);

    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch {
      analysis = {
        resumo_executivo: response,
        analise_temporal: "",
        dinamica_criminal: "",
        fatores_urbanos: "",
        sintese_qualitativa: "",
      };
    }

    return NextResponse.json({
      area: data.nome_area_fm,
      analysis,
      metadata: {
        total_ocorrencias: data.total_ocorrencias,
        total_denuncias: data.total_denuncias,
        total_fatores: data.total_fatores,
      },
    });
  } catch (error) {
    console.error("Erro na analise de area:", error);
    return NextResponse.json(
      { error: "Erro ao gerar analise da area" },
      { status: 500 }
    );
  }
}
