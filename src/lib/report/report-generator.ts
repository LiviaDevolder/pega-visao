import { Packer } from "docx";
import {
  buildRelintDocument,
  type ReportData,
  type PerguntaNorteadoraReport,
} from "./relint-template";
import { aggregateAreaData } from "../area-data-aggregator";
import { buildAreaAnalysisPrompt } from "../ai/prompts/area-analysis";
import { generateAnalysis } from "../ai/anthropic-client";
import { getActionSuggestion } from "../action-plan-builder";
import {
  buildGenericFallback,
  getFallbackByAreaId,
} from "../ai/demo-fallbacks";
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

function isValidAnalysis(value: unknown): value is AreaAnalysis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.resumo_executivo !== "string") return false;
  if (typeof v.dinamica_criminal !== "string") return false;
  const pn = v.perguntas_norteadoras as Record<string, unknown> | undefined;
  if (!pn || typeof pn !== "object") return false;
  for (const key of [
    "rota_fm",
    "horario_qmd",
    "modelo_emprego",
    "fatores_orgaos",
  ]) {
    const p = pn[key] as Record<string, unknown> | undefined;
    if (
      !p ||
      typeof p.diagnostico !== "string" ||
      typeof p.sugestao !== "string"
    ) {
      return false;
    }
  }
  return true;
}

function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateReport(
  areaFmId: number,
  periodoInicio?: string,
  periodoFim?: string
): Promise<Buffer> {
  const areaData = await aggregateAreaData(areaFmId);

  const demoMode = process.env.DEMO_MODE === "true";
  let analysis: AreaAnalysis | null = null;

  if (demoMode) {
    analysis =
      getFallbackByAreaId(areaFmId) ?? buildGenericFallback(areaData);
  } else {
    try {
      const prompt = buildAreaAnalysisPrompt(areaData);
      const aiResponse = await generateAnalysis(prompt);
      const parsed = extractJson(aiResponse);
      if (isValidAnalysis(parsed)) {
        analysis = parsed;
      }
    } catch (err) {
      console.error("Falha na chamada da IA para relatorio:", err);
    }
    if (!analysis) {
      analysis =
        getFallbackByAreaId(areaFmId) ?? buildGenericFallback(areaData);
    }
  }

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
    diagnostico: analysis!.perguntas_norteadoras[key].diagnostico,
    sugestao: analysis!.perguntas_norteadoras[key].sugestao,
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
