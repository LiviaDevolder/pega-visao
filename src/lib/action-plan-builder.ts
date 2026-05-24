const ACTION_MAP: Record<string, string> = {
  // Iluminacao - RioLuz
  "iluminacao": "Instalar/reparar iluminacao publica no trecho identificado",
  "lampada": "Substituir lampadas queimadas e ampliar cobertura de iluminacao",

  // Vegetacao - Comlurb
  "vegetacao": "Realizar poda de arvores e limpeza de vegetacao que obstrui visibilidade",
  "lixo": "Realizar coleta e limpeza da area, instalar lixeiras",
  "entulho": "Remover entulho e material acumulado no local",

  // Calçada - Seconserva
  "calcada": "Reparar calcada danificada e garantir acessibilidade",
  "mobiliario": "Reparar/instalar mobiliario urbano (bancos, postes, grades)",
  "bueiro": "Desobstruir bueiro e realizar manutencao do sistema de drenagem",

  // Estacionamento/Comercio - SEOP
  "estacionamento": "Fiscalizar estacionamento irregular e aplicar penalidades",
  "comercio": "Fiscalizar comercio ambulante irregular na area",
  "ocupacao": "Fiscalizar ocupacao irregular do espaco publico",

  // Transito - CET-Rio
  "transito": "Implementar sinalizacao e controle de trafego no trecho",
  "sinalizacao": "Instalar/reparar sinalizacao viaria e semaforos",

  // Motos/Bikes - GM-Rio
  "moto": "Intensificar fiscalizacao de motocicletas no passeio publico",
  "bicicleta": "Fiscalizar transito irregular de bicicletas na calcada",

  // Transporte - SMTR
  "onibus": "Avaliar rota e parada de onibus quanto a seguranca dos usuarios",
  "ponto": "Melhorar infraestrutura do ponto de onibus (iluminacao, visibilidade)",

  // PSR/Drogas - SMAS
  "drogas": "Acionar assistencia social para abordagem e encaminhamento",
  "morador": "Realizar abordagem social e encaminhamento para acolhimento",
};

export function getActionSuggestion(tipoOcorrencia: string): string {
  if (!tipoOcorrencia) return "Avaliar situacao no local e definir intervencao adequada";

  const tipoLower = tipoOcorrencia.toLowerCase();

  for (const [key, action] of Object.entries(ACTION_MAP)) {
    if (tipoLower.includes(key)) {
      return action;
    }
  }

  return "Avaliar situacao no local e definir intervencao adequada";
}

export interface ActionPlan {
  orgao: string;
  acoes: Array<{
    tipo: string;
    logradouro: string;
    acao: string;
    prioridade: "alta" | "media" | "baixa";
  }>;
}

export function buildActionPlan(
  fatores: Array<{
    orgao_responsavel: string;
    tipo_ocorrencia_descricao: string;
    logradouro: string | null;
    risk_level?: string;
  }>
): ActionPlan[] {
  const orgaoMap = new Map<string, ActionPlan["acoes"]>();

  for (const fator of fatores) {
    const orgao = fator.orgao_responsavel || "Nao definido";
    const acoes = orgaoMap.get(orgao) || [];

    acoes.push({
      tipo: fator.tipo_ocorrencia_descricao,
      logradouro: fator.logradouro || "Nao informado",
      acao: getActionSuggestion(fator.tipo_ocorrencia_descricao),
      prioridade:
        fator.risk_level === "alto"
          ? "alta"
          : fator.risk_level === "medio"
            ? "media"
            : "baixa",
    });

    orgaoMap.set(orgao, acoes);
  }

  return Array.from(orgaoMap.entries())
    .map(([orgao, acoes]) => ({
      orgao,
      acoes: acoes.sort((a, b) => {
        const order = { alta: 0, media: 1, baixa: 2 };
        return order[a.prioridade] - order[b.prioridade];
      }),
    }))
    .sort((a, b) => b.acoes.length - a.acoes.length);
}
