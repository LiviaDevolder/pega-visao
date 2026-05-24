import { NextRequest, NextResponse } from "next/server";
import { getFatoresByAreaFm } from "@/lib/fatores-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const areaFmId = Number(searchParams.get("area_fm_id"));

  if (!areaFmId) {
    return NextResponse.json(
      { error: "Parametro area_fm_id obrigatorio" },
      { status: 400 }
    );
  }

  try {
    const fatoresPorOrgao = await getFatoresByAreaFm(areaFmId);

    if (fatoresPorOrgao.length === 0) {
      return NextResponse.json({
        message: "Nenhum fator urbano encontrado nesta area FM.",
        fatores_por_orgao: [],
      });
    }

    return NextResponse.json({
      fatores_por_orgao: fatoresPorOrgao,
      total: fatoresPorOrgao.reduce((sum, g) => sum + g.total, 0),
    });
  } catch (error) {
    console.error("Erro ao buscar fatores urbanos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fatores urbanos" },
      { status: 500 }
    );
  }
}
