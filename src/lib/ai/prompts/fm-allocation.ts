export interface FmAreaMetrics {
  id: number;
  nome_area_fm: string;
  total_ocorrencias: number;
  total_fatores: number;
  risk_score: number;
  risk_level: string;
  top_delitos: string[];
  horarios_pico: number[];
}

export interface FmAllocation {
  area: string;
  agentes: number;
  modelo_emprego: "a pe" | "moto" | "viatura";
  horarios_prioridade: string;
  justificativa: string;
}

export function buildFmAllocationPrompt(areas: FmAreaMetrics[]): string {
  const areasData = areas
    .map(
      (a) =>
        `- ${a.nome_area_fm}: ${a.total_ocorrencias} ocorrencias, ${a.total_fatores} fatores, risco ${a.risk_level} (score: ${a.risk_score.toFixed(3)}), top delitos: [${a.top_delitos.join(", ")}], picos: [${a.horarios_pico.join("h, ")}h]`
    )
    .join("\n");

  return `Voce e um consultor tatico de seguranca publica do CompStat Municipal do Rio de Janeiro.

## Tarefa
Distribua exatamente 600 agentes da Forca Municipal pelas 22 areas operacionais abaixo. A soma DEVE ser exatamente 600.

## Dados das 22 Areas FM
${areasData}

## Regras
1. Areas com maior risk_score devem receber proporcionalmente mais agentes
2. Nenhuma area pode ter 0 agentes (minimo: 10)
3. O modelo de emprego deve considerar:
   - "a pe": areas com alta circulacao de pedestres, furtos oportunisticos, calcadas estreitas
   - "moto": areas com alta incidencia de roubos a transeuntes, necessidade de mobilidade rapida
   - "viatura": areas extensas, com roubos de veiculos, necessidade de cobertura ampla
4. Os horarios de prioridade devem se alinhar aos picos de incidencia criminal da area
5. A justificativa deve ser concisa (1-2 frases) referenciando os dados

## Formato de Resposta
Responda APENAS com um JSON array de 22 objetos:
[
  {
    "area": "nome da area",
    "agentes": numero,
    "modelo_emprego": "a pe" | "moto" | "viatura",
    "horarios_prioridade": "ex: 06h-14h e 18h-22h",
    "justificativa": "breve justificativa"
  }
]

Responda SOMENTE com o JSON, sem markdown ou texto adicional.`;
}
