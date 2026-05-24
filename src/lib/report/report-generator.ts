import { Packer } from "docx";
import {
  buildRelintDocument,
  type ReportData,
  type PerguntaNorteadoraReport,
} from "./relint-template";
import { getAreaAnalysisBundle } from "../analysis-service";
import { getActionSuggestion } from "../action-plan-builder";
import type { AreaAnalysis } from "@/types/analysis";

const PERGUNTAS_LABELS: Record<
  keyof AreaAnalysis["perguntas_norteadoras"],
  string
> = {
  rota_fm: "Locais de maior incidencia coincidem com a rota da FM?",
  horario_qmd: "Horario de maior incidencia coincide com o QMD?",
  modelo_emprego:
    "Dinamica criminal coincide com o modelo de emprego da FM?",
  fatores_orgaos:
    "Fatores estao sendo resolvidos pelos orgaos complementares?",
};

export async function generateReport(
  areaFmId: number,
  periodoInicio?: string,
  periodoFim?: string
): Promise<Buffer> {
  const { areaData, analysis } = await getAreaAnalysisBundle(areaFmId);

  const periodo =
    periodoInicio && periodoFim
      ? `${periodoInicio} a ${periodoFim}`
      : "Periodo completo";

  const analiseTemporalRows = areaData.distribuicao_dia_semana.map((d) => [
    d.dia_semana,
    String(d.total),
    `${((d.total / areaData.total_ocorrencias) * 100).toFixed(1)}%`,
  ]);

  const perguntasNorteadoras: PerguntaNorteadoraReport[] = (
    Object.keys(PERGUNTAS_LABELS) as Array<
      keyof AreaAnalysis["perguntas_norteadoras"]
    >
  ).map((key) => ({
    pergunta: PERGUNTAS_LABELS[key],
    diagnostico: analysis.perguntas_norteadoras[key].diagnostico,
    sugestao: analysis.perguntas_norteadoras[key].sugestao,
  }));

  const fatoresUrbanos = areaData.fatores_por_orgao.map((f) => ({
    orgao: f.orgao_responsavel || "Nao definido",
    tipo: f.tipo || "Nao especificado",
    logradouro: "Area FM",
    acao_sugerida: getActionSuggestion(f.tipo),
  }));

  const orgaoMap = new Map<string, string[]>();
  for (const f of fatoresUrbanos) {
    const acoes = orgaoMap.get(f.orgao) || [];
    acoes.push(`${f.tipo}: ${f.acao_sugerida}`);
    orgaoMap.set(f.orgao, acoes);
  }
  const planoAcao = Array.from(orgaoMap.entries()).map(([orgao, acoes]) => ({
    orgao,
    acoes,
  }));

  const reportData: ReportData = {
    area_fm: areaData.nome_area_fm,
    periodo,
    resumo_executivo: analysis.resumo_executivo,
    dinamica_criminal: analysis.dinamica_criminal,
    analise_temporal: {
      headers: ["Dia da Semana", "Ocorrencias", "Percentual"],
      rows: analiseTemporalRows,
    },
    perguntas_norteadoras: perguntasNorteadoras,
    fatores_urbanos: fatoresUrbanos,
    plano_acao: planoAcao,
  };

  const doc = buildRelintDocument(reportData);
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
