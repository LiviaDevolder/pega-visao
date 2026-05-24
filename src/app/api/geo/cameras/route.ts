import { NextResponse } from "next/server";
import { getCameras } from "@/lib/geo-queries";

export async function GET() {
  try {
    const cameras = await getCameras();
    return NextResponse.json(cameras);
  } catch (error) {
    console.error("Erro ao buscar cameras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cameras" },
      { status: 500 }
    );
  }
}
