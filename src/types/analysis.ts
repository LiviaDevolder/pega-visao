export interface PerguntaNorteadora {
  diagnostico: string;
  sugestao: string;
}

export interface PerguntasNorteadoras {
  rota_fm: PerguntaNorteadora;
  horario_qmd: PerguntaNorteadora;
  modelo_emprego: PerguntaNorteadora;
  fatores_orgaos: PerguntaNorteadora;
}

export interface AreaAnalysis {
  resumo_executivo: string;
  dinamica_criminal: string;
  perguntas_norteadoras: PerguntasNorteadoras;
}

export interface HeatmapCell {
  dia_semana: string;
  hora: number;
  total: number;
}

export interface AnalysisResponse {
  area: string;
  analysis: AreaAnalysis;
  metadata: {
    total_ocorrencias: number;
    total_denuncias: number;
    total_fatores: number;
    fonte: "ia" | "fallback";
  };
  heatmap_dia_hora: HeatmapCell[];
}
