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
  return `Voce e um analista de seguranca publica do CompStat Municipal do Rio de Janeiro. Sua analise vai compor o Relatorio Analitico de Area que subsidia a reuniao semanal do CompStat — focada em decisoes operacionais sobre o emprego da Forca Municipal (FM) e atuacao dos orgaos complementares (Comlurb, RioLuz, SEOP, CET-Rio, SMAS, Seconserva, GM-Rio).

## Dados da Area "${data.nome_area_fm}"

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

Produza a analise em formato JSON. As "perguntas norteadoras" sao as 4 perguntas estruturais do CompStat — cada uma exige um diagnostico baseado nos dados e uma sugestao operacional concreta.

{
  "resumo_executivo": "Paragrafo de 3-4 frases com volume, principais tipos de crime e tendencia geral da area.",
  "dinamica_criminal": "Paragrafo descrevendo a dinamica qualitativa: modalidade criminal predominante, modus operandi inferido (a pe, moto, grupos armados), possiveis rotas de fuga e pontos de receptacao, e influencia de organizacoes criminosas. Conecte os dados quantitativos com as informacoes das denuncias.",
  "perguntas_norteadoras": {
    "rota_fm": {
      "diagnostico": "Os locais de maior incidencia criminal estao coincidindo com a rota atual da FM? Cite trechos/logradouros criticos com base nos dados.",
      "sugestao": "Sugira ajustes na rota da FM, priorizando trechos com maior concentracao de ocorrencias."
    },
    "horario_qmd": {
      "diagnostico": "O horario de maior incidencia criminal coincide com o QMD (Quadro de Movimento Diario) da FM? Indique janelas horarias e dias criticos.",
      "sugestao": "Sugira horarios e dias que devem ser priorizados na cobertura da FM."
    },
    "modelo_emprego": {
      "diagnostico": "A dinamica criminal coincide com o modelo de emprego atual da FM? Ex: se os roubos sao majoritariamente por motocicletas, o emprego a pe nao resolve.",
      "sugestao": "Sugira modalidade (moto, a pe ou viatura) e quantidade aproximada de efetivo, lembrando que o total da FM e 600 agentes para 22 areas."
    },
    "fatores_orgaos": {
      "diagnostico": "Os fatores urbanos relevantes para o crime estao sendo enderecados pelos orgaos complementares? Aponte os fatores mais criticos com base na coincidencia com a mancha criminal.",
      "sugestao": "Sugira acoes especificas por orgao (ex: Comlurb deve realizar podas na Rua X; RioLuz deve substituir luminarias na Av Y; SEOP deve fiscalizar ambulantes no trecho Z)."
    }
  }
}

Cada campo "diagnostico" e "sugestao" deve ter 2-3 frases concretas, citando logradouros, horarios e numeros quando disponiveis nos dados. Nao invente nomes de ruas que nao aparecem nos dados.

Responda APENAS com o JSON valido, sem markdown ou texto adicional.`;
}
