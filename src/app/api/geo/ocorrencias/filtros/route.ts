import { NextResponse } from "next/server";
import { getDelitos, getAnosDisponiveis } from "@/lib/geo-queries";

export async function GET() {
  try {
    const [delitos, anos] = await Promise.all([
      getDelitos(),
      getAnosDisponiveis(),
    ]);
    return NextResponse.json({ delitos, anos });
  } catch (error) {
    console.error("Erro ao buscar filtros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar filtros" },
      { status: 500 }
    );
  }
}
