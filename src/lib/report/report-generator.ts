import { Packer } from "docx";
import { buildRelintDocument, type ReportData } from "./relint-template";
import { aggregateAreaData } from "../area-data-aggregator";
import { buildAreaAnalysisPrompt } from "../ai/prompts/area-analysis";
import { generateAnalysis } from "../ai/anthropic-client";
import { getActionSuggestion } from "../action-plan-builder";

export async function generateReport(
  areaFmId: number,
  periodoInicio?: string,
  periodoFim?: string
): Promise<Buffer> {
  // 1. Agregar dados da area
  const areaData = await aggregateAreaData(areaFmId);

  // 2. Gerar narrativa com IA
  const prompt = buildAreaAnalysisPrompt(areaData);
  const aiResponse = await generateAnalysis(prompt);

  let analysis = {
    resumo_executivo: "",
    dinamica_criminal: "",
  };

  try {
    const parsed = JSON.parse(aiResponse);
    analysis = {
      resumo_executivo: parsed.resumo_executivo || aiResponse,
      dinamica_criminal: parsed.dinamica_criminal || "",
    };
  } catch {
    analysis.resumo_executivo = aiResponse;
  }

  // 3. Montar dados temporais para tabela
  const periodo = periodoInicio && periodoFim
    ? `${periodoInicio} a ${periodoFim}`
    : "Periodo completo";

  const analiseTemporalRows = areaData.distribuicao_dia_semana.map((d) => [
    d.dia_semana,
    String(d.total),
    `${((d.total / areaData.total_ocorrencias) * 100).toFixed(1)}%`,
  ]);

  // 4. Montar fatores urbanos
  const fatoresUrbanos = areaData.fatores_por_orgao.map((f) => ({
    orgao: f.orgao_responsavel || "Nao definido",
    tipo: f.tipo || "Nao especificado",
    logradouro: "Area FM",
    acao_sugerida: getActionSuggestion(f.tipo),
  }));

  // 5. Montar plano de acao agrupado por orgao
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

  // 6. Construir documento
  const reportData: ReportData = {
    area_fm: areaData.nome_area_fm,
    periodo,
    resumo_executivo: analysis.resumo_executivo,
    analise_temporal: {
      headers: ["Dia da Semana", "Ocorrencias", "Percentual"],
      rows: analiseTemporalRows,
    },
    dinamica_criminal: analysis.dinamica_criminal,
    fatores_urbanos: fatoresUrbanos,
    plano_acao: planoAcao,
  };

  const doc = buildRelintDocument(reportData);
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
