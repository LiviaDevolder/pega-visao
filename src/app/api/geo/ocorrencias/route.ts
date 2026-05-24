import { NextRequest, NextResponse } from "next/server";
import { getHeatmapPoints } from "@/lib/geo-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters = {
    ano: searchParams.get("ano") ? Number(searchParams.get("ano")) : undefined,
    mes: searchParams.get("mes") ? Number(searchParams.get("mes")) : undefined,
    delito: searchParams.get("delito") || undefined,
    dia_semana: searchParams.get("dia_semana") || undefined,
    hora_inicio: searchParams.get("hora_inicio")
      ? Number(searchParams.get("hora_inicio"))
      : undefined,
    hora_fim: searchParams.get("hora_fim")
      ? Number(searchParams.get("hora_fim"))
      : undefined,
  };

  try {
    const points = await getHeatmapPoints(filters);
    return NextResponse.json(points);
  } catch (error) {
    console.error("Erro ao buscar ocorrencias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de ocorrencias" },
      { status: 500 }
    );
  }
}
