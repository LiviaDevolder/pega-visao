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

export interface PerguntaNorteadoraReport {
  pergunta: string;
  diagnostico: string;
  sugestao: string;
}

export interface ReportData {
  area_fm: string;
  periodo: string;
  resumo_executivo: string;
  analise_temporal: {
    headers: string[];
    rows: string[][];
  };
  dinamica_criminal: string;
  perguntas_norteadoras: PerguntaNorteadoraReport[];
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

const ALL_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1 },
  bottom: { style: BorderStyle.SINGLE, size: 1 },
  left: { style: BorderStyle.SINGLE, size: 1 },
  right: { style: BorderStyle.SINGLE, size: 1 },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
};

function headerCell(text: string, widthPct?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20 })],
      }),
    ],
    ...(widthPct !== undefined
      ? { width: { size: widthPct, type: WidthType.PERCENTAGE } }
      : {}),
  });
}

function bodyCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20 })],
      }),
    ],
  });
}

export function buildRelintDocument(data: ReportData): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "RELATORIO ANALITICO DE AREA - COMPSTAT",
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Area FM: ${data.area_fm}`, size: 24 }),
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

  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "2. DINAMICA CRIMINAL", bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: data.dinamica_criminal, size: 22 })],
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "3. ANALISE TEMPORAL", bold: true })],
    })
  );
  if (data.analise_temporal.rows.length > 0) {
    const tableRows = [
      new TableRow({
        children: data.analise_temporal.headers.map((h) =>
          headerCell(h, 100 / data.analise_temporal.headers.length)
        ),
      }),
      ...data.analise_temporal.rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) => bodyCell(cell)),
          })
      ),
    ];
    sections.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: ALL_BORDERS,
      })
    );
  }
  sections.push(new Paragraph({ children: [] }));

  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({ text: "4. PERGUNTAS NORTEADORAS", bold: true }),
      ],
    })
  );
  if (data.perguntas_norteadoras.length > 0) {
    const perguntasRows = [
      new TableRow({
        children: [
          headerCell("Pergunta", 35),
          headerCell("Diagnostico", 35),
          headerCell("Sugestao", 30),
        ],
      }),
      ...data.perguntas_norteadoras.map(
        (p) =>
          new TableRow({
            children: [
              bodyCell(p.pergunta),
              bodyCell(p.diagnostico),
              bodyCell(p.sugestao),
            ],
          })
      ),
    ];
    sections.push(
      new Table({
        rows: perguntasRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: ALL_BORDERS,
      })
    );
  }
  sections.push(new Paragraph({ children: [] }));

  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({ text: "5. FATORES DE INCIDENCIA CRIMINAL", bold: true }),
      ],
    })
  );
  if (data.fatores_urbanos.length > 0) {
    const fatoresRows = [
      new TableRow({
        children: ["Orgao", "Tipo", "Logradouro", "Acao Sugerida"].map((h) =>
          headerCell(h)
        ),
      }),
      ...data.fatores_urbanos.map(
        (f) =>
          new TableRow({
            children: [f.orgao, f.tipo, f.logradouro, f.acao_sugerida].map(
              (cell) => bodyCell(cell)
            ),
          })
      ),
    ];
    sections.push(
      new Table({
        rows: fatoresRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: ALL_BORDERS,
      })
    );
  }
  sections.push(new Paragraph({ children: [] }));

  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({ text: "6. PLANO DE ACAO E RESPONSABILIZACAO", bold: true }),
      ],
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
          children: [new TextRun({ text: `- ${acao}`, size: 22 })],
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
