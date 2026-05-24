import { NextResponse } from "next/server";
import { getAreasFm } from "@/lib/geo-queries";

export async function GET() {
  try {
    const areas = await getAreasFm();
    return NextResponse.json(areas);
  } catch (error) {
    console.error("Erro ao buscar areas FM:", error);
    return NextResponse.json(
      { error: "Erro ao buscar areas FM" },
      { status: 500 }
    );
  }
}
