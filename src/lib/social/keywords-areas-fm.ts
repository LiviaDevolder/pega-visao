export const CRIME_KEYWORDS = [
  'assalto',
  'roubado',
  'roubo',
  'furto',
  'arrastao',
  'tiroteio',
  'bala perdida',
];

export const FM_KEYWORDS = ['Guarda Municipal', 'Força Municipal', 'GM Rio'];

export interface AreaKeywords {
  nome_area_fm: string;
  localidades: string[];
}

export const AREAS_FM_KEYWORDS: AreaKeywords[] = [
  { nome_area_fm: 'Copacabana', localidades: ['Copacabana', 'Leme', 'Posto 6'] },
  { nome_area_fm: 'Botafogo', localidades: ['Botafogo', 'Flamengo', 'Catete', 'Gloria'] },
  { nome_area_fm: 'Ipanema', localidades: ['Ipanema', 'Leblon', 'Arpoador'] },
  { nome_area_fm: 'Centro', localidades: ['Centro', 'Cinelandia', 'Lapa', 'Saude', 'Gamboa'] },
  { nome_area_fm: 'Tijuca', localidades: ['Tijuca', 'Alto da Boa Vista', 'Vila Isabel'] },
  { nome_area_fm: 'Madureira', localidades: ['Madureira', 'Cascadura', 'Campinho', 'Vaz Lobo'] },
  { nome_area_fm: 'Penha', localidades: ['Penha', 'Penha Circular', 'Bras de Pina', 'Cordovil'] },
  { nome_area_fm: 'Meier', localidades: ['Meier', 'Engenho de Dentro', 'Engenho Novo', 'Rocha'] },
  { nome_area_fm: 'Jacarepagua', localidades: ['Jacarepagua', 'Barra da Tijuca', 'Recreio', 'Camorim'] },
  { nome_area_fm: 'Bangu', localidades: ['Bangu', 'Campo Grande', 'Realengo', 'Padre Miguel'] },
  { nome_area_fm: 'Santa Cruz', localidades: ['Santa Cruz', 'Sepetiba', 'Pedra de Guaratiba'] },
  { nome_area_fm: 'Ilha do Governador', localidades: ['Ilha do Governador', 'Cacuia', 'Jardim Guanabara'] },
  { nome_area_fm: 'Sao Cristovao', localidades: ['Sao Cristovao', 'Mangueira', 'Maracana'] },
  { nome_area_fm: 'Ramos', localidades: ['Ramos', 'Olaria', 'Bonsucesso', 'Manguinhos'] },
  { nome_area_fm: 'Pavuna', localidades: ['Pavuna', 'Anchieta', 'Guadalupe', 'Coelho Neto'] },
  { nome_area_fm: 'Santa Teresa', localidades: ['Santa Teresa', 'Cosme Velho', 'Laranjeiras'] },
  { nome_area_fm: 'Bonsucesso', localidades: ['Bonsucesso', 'Higienopolis', 'Portuguesa'] },
  { nome_area_fm: 'Irajá', localidades: ['Iraja', 'Vincente de Carvalho', 'Vila Kosmos', 'Coelho Neto'] },
  { nome_area_fm: 'Ilha de Paqueta', localidades: ['Paqueta'] },
  { nome_area_fm: 'Deodoro', localidades: ['Deodoro', 'Magalhaes Bastos', 'Jardim Sulacap', 'Jabour'] },
  { nome_area_fm: 'Guaratiba', localidades: ['Guaratiba', 'Barra de Guaratiba', 'Pedra de Guaratiba'] },
  { nome_area_fm: 'Vigario Geral', localidades: ['Vigario Geral', 'Parada de Lucas', 'Jardim America'] },
];

export function buildSearchQuery(area: AreaKeywords): string {
  const crimeQuery = CRIME_KEYWORDS.map((k) => `"${k}"`).join(' OR ');
  const localQuery = area.localidades.map((l) => `"${l}"`).join(' OR ');
  return `(${crimeQuery}) AND (${localQuery}) lang:pt`;
}
