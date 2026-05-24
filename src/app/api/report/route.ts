import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/report/report-generator";
import { sql } from "@/lib/db";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { area_fm_id, periodo_inicio, periodo_fim } = body;

    if (!area_fm_id) {
      return NextResponse.json(
        { error: "Parametro area_fm_id obrigatorio" },
        { status: 400 }
      );
    }

    // Buscar nome da area para o filename
    const areaRows = await sql(
      "SELECT nome_area_fm FROM areas_fm WHERE id = $1",
      [area_fm_id]
    );

    if (!areaRows.length) {
      return NextResponse.json(
        { error: "Area FM nao encontrada" },
        { status: 404 }
      );
    }

    const areaName = (areaRows[0] as Record<string, unknown>).nome_area_fm as string;
    const buffer = await generateReport(area_fm_id, periodo_inicio, periodo_fim);

    const date = new Date().toISOString().split("T")[0];
    const code = areaName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `RELINT_${code}_${date}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatorio:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatorio" },
      { status: 500 }
    );
  }
}
