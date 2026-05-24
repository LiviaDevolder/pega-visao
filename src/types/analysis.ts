export interface AreaAnalysis {
  resumo_executivo: string;
  analise_temporal: string;
  dinamica_criminal: string;
  fatores_urbanos: string;
  sintese_qualitativa: string;
}

export interface AnalysisResponse {
  area: string;
  analysis: AreaAnalysis;
  metadata: {
    total_ocorrencias: number;
    total_denuncias: number;
    total_fatores: number;
  };
}
