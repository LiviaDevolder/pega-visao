import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";

export interface ReportData {
  area_fm: string;
  periodo: string;
  resumo_executivo: string;
  analise_temporal: {
    headers: string[];
    rows: string[][];
  };
  dinamica_criminal: string;
  fatores_urbanos: Array<{
    orgao: string;
    tipo: string;
    logradouro: string;
    acao_sugerida: string;
  }>;
  plano_acao: Array<{
    orgao: string;
    acoes: string[];
  }>;
}

export function buildRelintDocument(data: ReportData): Document {
  const sections = [];

  // Cabecalho
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "RELATORIO DE INTELIGENCIA - RELINT",
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Area: ${data.area_fm}`,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Periodo: ${data.periodo}`,
          size: 20,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({ children: [] })
  );

  // Resumo Executivo
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "1. RESUMO EXECUTIVO", bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: data.resumo_executivo, size: 22 })],
      spacing: { after: 200 },
    })
  );

  // Analise Temporal
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "2. ANALISE TEMPORAL", bold: true })],
    })
  );

  if (data.analise_temporal.rows.length > 0) {
    const tableRows = [
      new TableRow({
        children: data.analise_temporal.headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 20 })],
                }),
              ],
              width: { size: 100 / data.analise_temporal.headers.length, type: WidthType.PERCENTAGE },
            })
        ),
      }),
      ...data.analise_temporal.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20 })],
                    }),
                  ],
                })
            ),
          })
      ),
    ];

    sections.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );
  }

  sections.push(new Paragraph({ children: [] }));

  // Dinamica Criminal
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "3. DINAMICA CRIMINAL", bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: data.dinamica_criminal, size: 22 })],
      spacing: { after: 200 },
    })
  );

  // Fatores Urbanos
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "4. FATORES URBANOS", bold: true })],
    })
  );

  if (data.fatores_urbanos.length > 0) {
    const fatoresRows = [
      new TableRow({
        children: ["Orgao", "Tipo", "Logradouro", "Acao Sugerida"].map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 20 })],
                }),
              ],
            })
        ),
      }),
      ...data.fatores_urbanos.map(
        (f) =>
          new TableRow({
            children: [f.orgao, f.tipo, f.logradouro, f.acao_sugerida].map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20 })],
                    }),
                  ],
                })
            ),
          })
      ),
    ];

    sections.push(
      new Table({
        rows: fatoresRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );
  }

  sections.push(new Paragraph({ children: [] }));

  // Plano de Acao
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "5. PLANO DE ACAO", bold: true })],
    })
  );

  for (const plano of data.plano_acao) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: plano.orgao, bold: true })],
      })
    );
    for (const acao of plano.acoes) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${acao}`, size: 22 })],
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        children: sections,
      },
    ],
  });
}
