import { NextRequest, NextResponse } from "next/server";
import { getAreaAnalysisBundle } from "@/lib/analysis-service";

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

    const bundle = await getAreaAnalysisBundle(Number(area_fm_id));

    if (bundle.areaData.total_ocorrencias === 0) {
      return NextResponse.json(
        {
          error:
            "Dados insuficientes para gerar analise desta area. Nenhuma ocorrencia encontrada.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      area: bundle.areaData.nome_area_fm,
      analysis: bundle.analysis,
      metadata: {
        total_ocorrencias: bundle.areaData.total_ocorrencias,
        total_denuncias: bundle.areaData.total_denuncias,
        total_fatores: bundle.areaData.total_fatores,
        fonte: bundle.fonte,
      },
      heatmap_dia_hora: bundle.heatmap,
    });
  } catch (error) {
    console.error("Erro na analise de area:", error);
    return NextResponse.json(
      { error: "Erro ao gerar analise da area" },
      { status: 500 }
    );
  }
}
