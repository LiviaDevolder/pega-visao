import type { AreaAnalysis } from "@/types/analysis";
import type { AreaAnalysisData } from "./prompts/area-analysis";

const FALLBACKS_BY_AREA_ID: Record<number, AreaAnalysis> = {};

export function registerFallback(areaFmId: number, analysis: AreaAnalysis) {
  FALLBACKS_BY_AREA_ID[areaFmId] = analysis;
}

export function getFallbackByAreaId(areaFmId: number): AreaAnalysis | null {
  return FALLBACKS_BY_AREA_ID[areaFmId] ?? null;
}

export function buildGenericFallback(data: AreaAnalysisData): AreaAnalysis {
  const topDelito = data.top_delitos[0]?.desc_delito ?? "ocorrencias diversas";
  const segundoDelito = data.top_delitos[1]?.desc_delito;
  const picoHora = data.distribuicao_horaria[0]?.hora;
  const diaMaisCritico = data.distribuicao_dia_semana[0]?.dia_semana;
  const orgaosUnicos = Array.from(
    new Set(data.fatores_por_orgao.map((f) => f.orgao_responsavel).filter(Boolean))
  );
  const top3Fatores = data.fatores_por_orgao.slice(0, 3);
  const dominio = data.dominios_presentes[0];

  return {
    resumo_executivo: `A area ${data.nome_area_fm} concentra ${data.total_ocorrencias} ocorrencias criminais, ${data.total_denuncias} denuncias e ${data.total_fatores} fatores urbanos mapeados. O delito predominante e ${topDelito}${segundoDelito ? `, seguido por ${segundoDelito}` : ""}. A combinacao entre mancha criminal, fatores urbanos e dinamica qualitativa indica uma area que exige acao coordenada entre Forca Municipal e orgaos complementares.`,

    dinamica_criminal: `A dinamica criminal e marcada por ${topDelito.toLowerCase()} concentrada${picoHora !== undefined ? ` no entorno das ${picoHora}h` : ""}${diaMaisCritico ? `, com pico ${diaMaisCritico}` : ""}. ${dominio ? `A area sofre influencia territorial de ${dominio.sigla}, o que sugere fluxos de receptacao e rotas de fuga conhecidas.` : "Nao ha dominio territorial mapeado, indicando criminalidade oportunista difusa."} Os fatores urbanos coincidem com os trechos de maior incidencia, sugerindo que o ambiente urbano degradado facilita a acao criminosa.`,

    perguntas_norteadoras: {
      rota_fm: {
        diagnostico: `A mancha criminal se concentra em trechos especificos da area${data.top_delitos.length > 0 ? `, com ${data.top_delitos[0].total} ocorrencias do delito principal` : ""}. A rota atual da FM precisa ser cruzada com esses pontos para confirmar coincidencia.`,
        sugestao: `Reorganizar a rota da FM para priorizar os trechos com maior concentracao de ${topDelito.toLowerCase()}, garantindo presenca ostensiva nos logradouros criticos.`,
      },
      horario_qmd: {
        diagnostico: `O pico de incidencia ocorre${picoHora !== undefined ? ` por volta das ${picoHora}h` : " em horarios noturnos"}${diaMaisCritico ? ` e o dia mais critico e ${diaMaisCritico}` : ""}. O QMD atual da FM precisa ser comparado a esse padrao para identificar lacunas de cobertura.`,
        sugestao: `Ajustar o QMD para reforcar a cobertura${picoHora !== undefined ? ` na janela das ${Math.max(0, picoHora - 1)}h-${picoHora + 1}h` : " no periodo noturno"}${diaMaisCritico ? ` com prioridade ${diaMaisCritico}` : ""}.`,
      },
      modelo_emprego: {
        diagnostico: `A predominancia de ${topDelito.toLowerCase()} indica um modus operandi especifico — se predominante por motocicleta ou em deslocamento, o emprego exclusivamente a pe nao resolve.`,
        sugestao: `Combinar patrulha motorizada nos trechos de maior fluxo com presenca a pe nos pontos de aglomeracao. Considerando o efetivo total de 600 agentes para 22 areas, esta area demanda atencao proporcional ao seu peso no ranking.`,
      },
      fatores_orgaos: {
        diagnostico: `Foram mapeados ${data.total_fatores} fatores urbanos sob responsabilidade de ${orgaosUnicos.length} orgao(s)${orgaosUnicos.length > 0 ? ` (${orgaosUnicos.slice(0, 4).join(", ")})` : ""}. ${top3Fatores.length > 0 ? `Os mais relevantes sao: ${top3Fatores.map((f) => `${f.tipo} (${f.orgao_responsavel})`).join("; ")}.` : ""}`,
        sugestao: `Encaminhar plano de acao especifico para cada orgao responsavel, priorizando os fatores que coincidem espacialmente com a mancha criminal. Acoes tipicas: poda de vegetacao (Comlurb), reparo de iluminacao (RioLuz), fiscalizacao de comercio irregular (SEOP), ordenamento de transito (CET-Rio).`,
      },
    },
  };
}
