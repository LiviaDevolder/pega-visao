export const CRIME_KEYWORDS = [
  // Roubo/Furto
  'assalto',
  'assaltado',
  'roubado',
  'roubo',
  'furto',
  'furtado',
  'arrastao',
  // Violencia
  'tiroteio',
  'tiros',
  'bala perdida',
  'facada',
  'esfaqueado',
  // Modus operandi
  'mao armada',
  // Seguranca geral
  'inseguranca',
  'perigoso',
];

export const FM_KEYWORDS = [
  'Guarda Municipal',
  'Forca Municipal',
  'GM Rio',
  'CompStat',
];

export interface AreaKeywords {
  nome_area_fm: string;
  localidades: string[];
}

export const AREAS_FM_KEYWORDS: AreaKeywords[] = [
  {
    nome_area_fm: 'Arpoador - Av Atlantica',
    localidades: ['Arpoador', 'Atlantica', 'praia Arpoador'],
  },
  {
    nome_area_fm: 'Av Americas - Av Lucio Costa',
    localidades: ['Av Americas', 'Lucio Costa', 'Barra da Tijuca', 'Barra'],
  },
  {
    nome_area_fm: 'Av Atlantica - Av Barata Ribeiro',
    localidades: ['Barata Ribeiro', 'Copacabana', 'Copa'],
  },
  {
    nome_area_fm: 'Av Ayrton Senna',
    localidades: ['Ayrton Senna', 'Jacarepagua'],
  },
  {
    nome_area_fm: 'Bangu: Calcadao - Bangu Shopping',
    localidades: ['Bangu', 'Bangu Shopping', 'calcadao Bangu'],
  },
  {
    nome_area_fm: 'Campo Grande: Estacao - Calcadao',
    localidades: ['Campo Grande', 'estacao Campo Grande'],
  },
  {
    nome_area_fm: 'Estacao Del Castilho - Norte Shopping',
    localidades: ['Del Castilho', 'Norte Shopping'],
  },
  {
    nome_area_fm: 'Estacao Maracana - UERJ',
    localidades: ['Maracana', 'UERJ', 'Sao Cristovao'],
  },
  {
    nome_area_fm: 'Estacao Marechal Hermes',
    localidades: ['Marechal Hermes'],
  },
  {
    nome_area_fm: 'Estacao Meier - Cachambi',
    localidades: ['Meier', 'Cachambi'],
  },
  {
    nome_area_fm: 'Estacoes SFX - Afonso Pena',
    localidades: ['Sao Francisco Xavier', 'Afonso Pena', 'Tijuca'],
  },
  {
    nome_area_fm: 'General Osorio - Nossa Sra da Paz',
    localidades: ['General Osorio', 'Ipanema', 'Nossa Senhora da Paz'],
  },
  {
    nome_area_fm: 'Jardim de Alah',
    localidades: ['Jardim de Alah', 'Leblon'],
  },
  {
    nome_area_fm: 'Madureira - Estacao - Mercadao',
    localidades: ['Madureira', 'Madureira Shopping', 'Mercadao'],
  },
  {
    nome_area_fm: 'Metro Botafogo - Sao Clemente',
    localidades: ['Botafogo', 'Sao Clemente', 'Voluntarios da Patria'],
  },
  {
    nome_area_fm: 'Posto 1',
    localidades: ['Posto 1', 'Leme'],
  },
  {
    nome_area_fm: 'Praia Botafogo - Marques de Abrantes',
    localidades: ['Praia de Botafogo', 'Marques de Abrantes', 'Flamengo'],
  },
  {
    nome_area_fm: 'Praca Santos Dumont - Parque dos Patins',
    localidades: ['Santos Dumont', 'Parque dos Patins', 'Lagoa'],
  },
  {
    nome_area_fm: 'Pres. Vargas - Campo de Santana',
    localidades: [
      'Presidente Vargas',
      'Campo de Santana',
      'Central do Brasil',
      'Cinelandia',
      'Uruguaiana',
    ],
  },
  {
    nome_area_fm: 'Rio Sul',
    localidades: ['Rio Sul', 'Shopping Rio Sul'],
  },
  {
    nome_area_fm: 'Rodoviaria - Terminal Gentileza',
    localidades: ['Rodoviaria', 'Novo Rio', 'Terminal Gentileza', 'Leopoldina'],
  },
  {
    nome_area_fm: 'Santa Cruz: Estacao - Shopping',
    localidades: ['Santa Cruz', 'Santa Cruz Shopping'],
  },
];

export function buildSearchQuery(area: AreaKeywords): string {
  const crimeQuery = CRIME_KEYWORDS.map((k) => `"${k}"`).join(' OR ');
  const localQuery = area.localidades.map((l) => `"${l}"`).join(' OR ');
  return `(${crimeQuery}) AND (${localQuery}) lang:pt`;
}
