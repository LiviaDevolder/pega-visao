export type Plataforma = "twitter" | "instagram" | "facebook";
export type TipoCrime =
  | "Roubo"
  | "Furto"
  | "Tráfico"
  | "Vandalismo"
  | "Violência"
  | "Perturbação"
  | "Trânsito";
export type Relevancia = "alta" | "media" | "baixa";

export interface PostMock {
  id: string;
  plataforma: Plataforma;
  autor: string;
  handle: string;
  timestamp: string;
  conteudo: string;
  area: string;
  tipo: TipoCrime;
  relevancia: Relevancia;
  engajamento: { curtidas: number; comentarios: number; compartilhamentos: number };
}

export const AREAS_MOCK = [
  "Copacabana",
  "Ipanema",
  "Leblon",
  "Centro",
  "Lapa",
  "Tijuca",
  "Méier",
  "Madureira",
  "Bangu",
  "Campo Grande",
  "Santa Cruz",
  "Barra da Tijuca",
  "Recreio",
  "Botafogo",
  "Flamengo",
];

export const TIPOS_CRIME: TipoCrime[] = [
  "Roubo",
  "Furto",
  "Tráfico",
  "Vandalismo",
  "Violência",
  "Perturbação",
  "Trânsito",
];

export const POSTS_MOCK: PostMock[] = [
  {
    id: "p1",
    plataforma: "twitter",
    autor: "Carlos Mendes",
    handle: "@carlosrj_",
    timestamp: "2026-05-24T14:32:00Z",
    conteudo:
      "Mais um assalto a mão armada na esquina da Rainha Elizabeth com Atlântica agora há pouco. Levaram 3 celulares. Cadê o policiamento?",
    area: "Copacabana",
    tipo: "Roubo",
    relevancia: "alta",
    engajamento: { curtidas: 487, comentarios: 92, compartilhamentos: 156 },
  },
  {
    id: "p2",
    plataforma: "instagram",
    autor: "Viver Ipanema",
    handle: "@viveripanema",
    timestamp: "2026-05-24T13:15:00Z",
    conteudo:
      "Câmera de segurança do prédio flagrou furto de bicicleta na Vieira Souto. Já é o terceiro essa semana. Atenção, moradores.",
    area: "Ipanema",
    tipo: "Furto",
    relevancia: "alta",
    engajamento: { curtidas: 1230, comentarios: 287, compartilhamentos: 412 },
  },
  {
    id: "p3",
    plataforma: "twitter",
    autor: "Tijuca News",
    handle: "@tijucanews",
    timestamp: "2026-05-24T12:48:00Z",
    conteudo:
      "Movimentação suspeita na Praça Saens Peña durante a madrugada. Vizinhos relatam barulho de tiros e correria.",
    area: "Tijuca",
    tipo: "Violência",
    relevancia: "alta",
    engajamento: { curtidas: 215, comentarios: 64, compartilhamentos: 88 },
  },
  {
    id: "p4",
    plataforma: "facebook",
    autor: "Beatriz Lima",
    handle: "Beatriz Lima",
    timestamp: "2026-05-24T11:22:00Z",
    conteudo:
      "Pichação nova no muro da escola municipal da Lapa. A prefeitura já foi avisada mas ninguém faz nada.",
    area: "Lapa",
    tipo: "Vandalismo",
    relevancia: "media",
    engajamento: { curtidas: 78, comentarios: 23, compartilhamentos: 12 },
  },
  {
    id: "p5",
    plataforma: "twitter",
    autor: "Rafael Souza",
    handle: "@rafa_souza",
    timestamp: "2026-05-24T10:45:00Z",
    conteudo:
      "Pessoal, cuidado redobrado no Centro hoje. Vi pelo menos 4 abordagens suspeitas na Rio Branco em menos de 1 hora.",
    area: "Centro",
    tipo: "Roubo",
    relevancia: "alta",
    engajamento: { curtidas: 645, comentarios: 145, compartilhamentos: 230 },
  },
  {
    id: "p6",
    plataforma: "instagram",
    autor: "Madureira News",
    handle: "@madureira.news",
    timestamp: "2026-05-24T09:30:00Z",
    conteudo:
      "Operação policial em curso no Morro do Dendê. Acessos bloqueados. Evite a região se possível.",
    area: "Madureira",
    tipo: "Tráfico",
    relevancia: "alta",
    engajamento: { curtidas: 2870, comentarios: 512, compartilhamentos: 890 },
  },
  {
    id: "p7",
    plataforma: "twitter",
    autor: "Bangu Info",
    handle: "@banguinfo",
    timestamp: "2026-05-24T08:12:00Z",
    conteudo:
      "Som alto na Praça Cristiano Ottoni passou da meia-noite de novo. Moradores não conseguem dormir.",
    area: "Bangu",
    tipo: "Perturbação",
    relevancia: "baixa",
    engajamento: { curtidas: 34, comentarios: 9, compartilhamentos: 4 },
  },
  {
    id: "p8",
    plataforma: "facebook",
    autor: "Marcia Pereira",
    handle: "Marcia Pereira",
    timestamp: "2026-05-23T22:05:00Z",
    conteudo:
      "Carro batido e abandonado na Av. Brasil altura do Méier. Ninguém pra remover há 3 dias.",
    area: "Méier",
    tipo: "Trânsito",
    relevancia: "media",
    engajamento: { curtidas: 156, comentarios: 42, compartilhamentos: 18 },
  },
  {
    id: "p9",
    plataforma: "twitter",
    autor: "Botafogo Vive",
    handle: "@botafogovive",
    timestamp: "2026-05-23T20:55:00Z",
    conteudo:
      "Furto de celular na saída do metrô de Botafogo. Mulher foi empurrada e abordagem rápida. Atenção ao desembarcar.",
    area: "Botafogo",
    tipo: "Furto",
    relevancia: "alta",
    engajamento: { curtidas: 412, comentarios: 78, compartilhamentos: 134 },
  },
  {
    id: "p10",
    plataforma: "instagram",
    autor: "Flamengo Hoje",
    handle: "@flamengohoje",
    timestamp: "2026-05-23T19:30:00Z",
    conteudo:
      "Confusão generalizada no Largo do Machado depois do jogo. Vidros quebrados e duas pessoas feridas.",
    area: "Flamengo",
    tipo: "Violência",
    relevancia: "alta",
    engajamento: { curtidas: 1890, comentarios: 367, compartilhamentos: 540 },
  },
  {
    id: "p11",
    plataforma: "twitter",
    autor: "Leblon Diário",
    handle: "@leblondiario",
    timestamp: "2026-05-23T17:42:00Z",
    conteudo:
      "Bicicleta elétrica furtada da bicicletário do shopping. Câmeras teriam pegado a ação completa.",
    area: "Leblon",
    tipo: "Furto",
    relevancia: "media",
    engajamento: { curtidas: 89, comentarios: 21, compartilhamentos: 14 },
  },
  {
    id: "p12",
    plataforma: "facebook",
    autor: "João Carvalho",
    handle: "João Carvalho",
    timestamp: "2026-05-23T16:10:00Z",
    conteudo:
      "Roubo de carga na Avenida das Américas próximo ao Recreio. Motorista bem mas caminhão levado.",
    area: "Recreio",
    tipo: "Roubo",
    relevancia: "alta",
    engajamento: { curtidas: 567, comentarios: 134, compartilhamentos: 234 },
  },
  {
    id: "p13",
    plataforma: "twitter",
    autor: "Barra Online",
    handle: "@barraonline",
    timestamp: "2026-05-23T14:28:00Z",
    conteudo:
      "Vandalismo no parquinho da Barra: brinquedos quebrados e pichações. Mais um ataque ao patrimônio público.",
    area: "Barra da Tijuca",
    tipo: "Vandalismo",
    relevancia: "media",
    engajamento: { curtidas: 234, comentarios: 56, compartilhamentos: 42 },
  },
  {
    id: "p14",
    plataforma: "instagram",
    autor: "Campo Grande Notícias",
    handle: "@cgnoticias",
    timestamp: "2026-05-23T12:00:00Z",
    conteudo:
      "Tiroteio próximo à estação de Campo Grande pela manhã. Comércio fechado às pressas. Sem feridos confirmados.",
    area: "Campo Grande",
    tipo: "Violência",
    relevancia: "alta",
    engajamento: { curtidas: 3450, comentarios: 678, compartilhamentos: 1230 },
  },
  {
    id: "p15",
    plataforma: "twitter",
    autor: "Santa Cruz Info",
    handle: "@scruzinfo",
    timestamp: "2026-05-23T10:20:00Z",
    conteudo:
      "Carro suspeito rondando a região da estação há vários dias. Polícia avisada.",
    area: "Santa Cruz",
    tipo: "Roubo",
    relevancia: "media",
    engajamento: { curtidas: 145, comentarios: 38, compartilhamentos: 27 },
  },
  {
    id: "p16",
    plataforma: "facebook",
    autor: "Patrícia Oliveira",
    handle: "Patrícia Oliveira",
    timestamp: "2026-05-23T08:45:00Z",
    conteudo:
      "Festa rave ilegal na pedreira da Tijuca outra vez. Barulho de meia-noite às 6 da manhã.",
    area: "Tijuca",
    tipo: "Perturbação",
    relevancia: "baixa",
    engajamento: { curtidas: 67, comentarios: 19, compartilhamentos: 8 },
  },
  {
    id: "p17",
    plataforma: "twitter",
    autor: "Centro RJ",
    handle: "@centro_rj",
    timestamp: "2026-05-22T23:15:00Z",
    conteudo:
      "Pichação enorme no MAR durante a madrugada. Funcionários estão limpando agora.",
    area: "Centro",
    tipo: "Vandalismo",
    relevancia: "media",
    engajamento: { curtidas: 312, comentarios: 87, compartilhamentos: 56 },
  },
  {
    id: "p18",
    plataforma: "instagram",
    autor: "Lapa News",
    handle: "@lapa.news",
    timestamp: "2026-05-22T22:00:00Z",
    conteudo:
      "Briga generalizada na Mem de Sá após boate fechar. PM acionada e duas detenções.",
    area: "Lapa",
    tipo: "Violência",
    relevancia: "alta",
    engajamento: { curtidas: 890, comentarios: 234, compartilhamentos: 312 },
  },
  {
    id: "p19",
    plataforma: "twitter",
    autor: "Copa Alerta",
    handle: "@copaalerta",
    timestamp: "2026-05-22T20:30:00Z",
    conteudo:
      "Arrastão na orla próximo ao posto 4. Várias vítimas e celulares levados. Caos total.",
    area: "Copacabana",
    tipo: "Roubo",
    relevancia: "alta",
    engajamento: { curtidas: 5670, comentarios: 1230, compartilhamentos: 2340 },
  },
  {
    id: "p20",
    plataforma: "facebook",
    autor: "Eduardo Ferreira",
    handle: "Eduardo Ferreira",
    timestamp: "2026-05-22T18:00:00Z",
    conteudo:
      "Acidente grave na entrada do túnel Rebouças. Trânsito parado em ambos sentidos.",
    area: "Botafogo",
    tipo: "Trânsito",
    relevancia: "media",
    engajamento: { curtidas: 423, comentarios: 89, compartilhamentos: 145 },
  },
  {
    id: "p21",
    plataforma: "instagram",
    autor: "Méier no Ar",
    handle: "@meiernoar",
    timestamp: "2026-05-22T15:45:00Z",
    conteudo:
      "Tentativa de assalto a posto de gasolina foi frustrada por funcionários. Suspeito fugiu sem nada.",
    area: "Méier",
    tipo: "Roubo",
    relevancia: "media",
    engajamento: { curtidas: 178, comentarios: 45, compartilhamentos: 23 },
  },
  {
    id: "p22",
    plataforma: "twitter",
    autor: "Ipanema Real",
    handle: "@ipanema_real",
    timestamp: "2026-05-22T14:00:00Z",
    conteudo:
      "Bandidos em moto fizeram arrastão no calçadão entre os postos 8 e 9 agora há pouco. Cuidado.",
    area: "Ipanema",
    tipo: "Roubo",
    relevancia: "alta",
    engajamento: { curtidas: 2340, comentarios: 478, compartilhamentos: 890 },
  },
  {
    id: "p23",
    plataforma: "facebook",
    autor: "Bangu Comunidade",
    handle: "Bangu Comunidade",
    timestamp: "2026-05-22T11:30:00Z",
    conteudo:
      "Operação da PM no Conjunto Esperança termina com 3 presos e drogas apreendidas.",
    area: "Bangu",
    tipo: "Tráfico",
    relevancia: "alta",
    engajamento: { curtidas: 1450, comentarios: 287, compartilhamentos: 412 },
  },
  {
    id: "p24",
    plataforma: "twitter",
    autor: "Recreio Hoje",
    handle: "@recreiohoje",
    timestamp: "2026-05-22T09:00:00Z",
    conteudo:
      "Camera flagrou invasão a casa na Pontões. Família tinha viajado. Polícia investiga.",
    area: "Recreio",
    tipo: "Furto",
    relevancia: "media",
    engajamento: { curtidas: 234, comentarios: 67, compartilhamentos: 89 },
  },
  {
    id: "p25",
    plataforma: "instagram",
    autor: "Madureira Viva",
    handle: "@madureiraviva",
    timestamp: "2026-05-21T22:20:00Z",
    conteudo:
      "Comerciantes locais relatam aumento de extorsões. Querem reunião urgente com batalhão.",
    area: "Madureira",
    tipo: "Violência",
    relevancia: "alta",
    engajamento: { curtidas: 1290, comentarios: 345, compartilhamentos: 567 },
  },
];
