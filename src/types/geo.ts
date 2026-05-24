export interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface FatorUrbano {
  id: number;
  latitude: number;
  longitude: number;
  tipo_ocorrencia_descricao: string;
  orgao_responsavel: string;
  logradouro: string | null;
  observacao: string | null;
}

export interface AreaFm {
  id: number;
  nome_area_fm: string;
  geojson: GeoJSON.Geometry;
  total_ocorrencias?: number;
  total_fatores?: number;
}

export interface Camera {
  id: number;
  id_ponto: string;
  nome_area_fm: string;
  latitude: number;
  longitude: number;
}

export interface MapFilters {
  ano?: number;
  mes?: number;
  delito?: string;
  dia_semana?: string;
  hora_inicio?: number;
  hora_fim?: number;
}

export interface LayerVisibility {
  heatmap: boolean;
  fatoresUrbanos: boolean;
  areasFm: boolean;
  cameras: boolean;
}
