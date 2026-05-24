import { NextRequest, NextResponse } from "next/server";
import { getRiskDetail } from "@/lib/risk-queries";

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
    const detail = await getRiskDetail(areaFmId);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("Erro ao buscar detalhamento de risco:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhamento" },
      { status: 500 }
    );
  }
}
