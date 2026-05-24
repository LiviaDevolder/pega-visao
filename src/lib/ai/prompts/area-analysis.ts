export interface AreaAnalysisData {
  nome_area_fm: string;
  total_ocorrencias: number;
  total_denuncias: number;
  total_fatores: number;
  top_delitos: Array<{ desc_delito: string; total: number }>;
  distribuicao_dia_semana: Array<{ dia_semana: string; total: number }>;
  distribuicao_horaria: Array<{ hora: number; total: number }>;
  fatores_por_orgao: Array<{
    orgao_responsavel: string;
    tipo: string;
    total: number;
  }>;
  denuncias_por_classe: Array<{ classe: string; total: number }>;
  dominios_presentes: Array<{ nome: string; sigla: string }>;
}

export function buildAreaAnalysisPrompt(data: AreaAnalysisData): string {
  return `Voce e um analista de seguranca publica do CompStat Municipal do Rio de Janeiro. Analise os dados da area "${data.nome_area_fm}" e produza uma analise estruturada.

## Dados da Area

**Volume total:** ${data.total_ocorrencias} ocorrencias criminais, ${data.total_denuncias} denuncias, ${data.total_fatores} fatores urbanos

**Top delitos:**
${data.top_delitos.map((d) => `- ${d.desc_delito}: ${d.total} ocorrencias`).join("\n")}

**Distribuicao por dia da semana:**
${data.distribuicao_dia_semana.map((d) => `- ${d.dia_semana}: ${d.total}`).join("\n")}

**Distribuicao horaria (picos):**
${data.distribuicao_horaria.slice(0, 5).map((d) => `- ${d.hora}h: ${d.total} ocorrencias`).join("\n")}

**Fatores urbanos por orgao:**
${data.fatores_por_orgao.map((f) => `- ${f.orgao_responsavel} (${f.tipo}): ${f.total}`).join("\n")}

**Denuncias por classe:**
${data.denuncias_por_classe.map((d) => `- ${d.classe || "Sem classe"}: ${d.total}`).join("\n")}

**Dominios territoriais presentes:**
${data.dominios_presentes.length > 0 ? data.dominios_presentes.map((d) => `- ${d.nome} (${d.sigla})`).join("\n") : "Nenhum dominio territorial mapeado"}

## Instrucoes

Produza a analise em formato JSON com exatamente estas 5 secoes:

{
  "resumo_executivo": "Paragrafo com volume total, tendencia geral e os 3 principais tipos de delito",
  "analise_temporal": "Paragrafo identificando horarios de pico, dias mais criticos e padroes temporais",
  "dinamica_criminal": "Paragrafo descrevendo padroes de modus operandi, perfil predominante dos crimes e relacao com dominios territoriais",
  "fatores_urbanos": "Paragrafo agrupando fatores por tipo e orgao responsavel, destacando os mais relevantes para seguranca",
  "sintese_qualitativa": "Paragrafo conectando dados quantitativos com informacoes qualitativas das denuncias, gerando insights operacionais"
}

Responda APENAS com o JSON, sem markdown ou texto adicional.`;
}
