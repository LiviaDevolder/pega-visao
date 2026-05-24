import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getRiskScoring, getRiskHotspots } from "@/lib/risk-queries";

export const maxDuration = 60;

const getCachedScoring = unstable_cache(
  async () => getRiskScoring(),
  ["risk-scoring-v1"],
  { revalidate: 300, tags: ["risk"] }
);

function getCachedHotspots(radius: number) {
  return unstable_cache(
    async () => getRiskHotspots(radius),
    [`risk-hotspots-v1-${radius}`],
    { revalidate: 300, tags: ["risk"] }
  )();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const radius = Number(searchParams.get("radius")) || 200;
  const started = Date.now();

  try {
    const [scoring, hotspots] = await Promise.all([
      getCachedScoring(),
      getCachedHotspots(radius),
    ]);
    console.log(
      `risk-scoring radius=${radius} levou ${Date.now() - started}ms — areas=${scoring.length}, hotspots=${hotspots.length}`
    );
    return NextResponse.json({ scoring, hotspots });
  } catch (error) {
    console.error("Erro ao calcular risk scoring:", error);
    return NextResponse.json(
      { error: "Erro ao calcular scoring de risco" },
      { status: 500 }
    );
  }
}
