import { NextResponse } from "next/server";
import { getFatoresUrbanos } from "@/lib/geo-queries";

export async function GET() {
  try {
    const fatores = await getFatoresUrbanos();
    return NextResponse.json(fatores);
  } catch (error) {
    console.error("Erro ao buscar fatores urbanos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fatores urbanos" },
      { status: 500 }
    );
  }
}
