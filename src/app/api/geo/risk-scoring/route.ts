import { NextRequest, NextResponse } from "next/server";
import { getRiskScoring, getRiskHotspots } from "@/lib/risk-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const radius = Number(searchParams.get("radius")) || 200;

  try {
    const [scoring, hotspots] = await Promise.all([
      getRiskScoring(),
      getRiskHotspots(radius),
    ]);

    return NextResponse.json({ scoring, hotspots });
  } catch (error) {
    console.error("Erro ao calcular risk scoring:", error);
    return NextResponse.json(
      { error: "Erro ao calcular scoring de risco" },
      { status: 500 }
    );
  }
}
