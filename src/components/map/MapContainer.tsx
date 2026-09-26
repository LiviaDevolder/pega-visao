"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import { Box } from "@chakra-ui/react";
import "leaflet/dist/leaflet.css";
import type {
  HeatPoint,
  FatorUrbano,
  AreaFm,
  Camera,
} from "@/types/geo";
import { HeatmapLayer } from "./layers/HeatmapLayer";
import { FatoresUrbanosLayer } from "./layers/FatoresUrbanosLayer";
import { AreasFmLayer } from "./layers/AreasFmLayer";
import { CamerasLayer } from "./layers/CamerasLayer";
import {
  MapControls,
  type MapLayerKey,
  type MapLayerVisibility,
} from "./MapControls";
import { MapFiltersPanel, type LocalMapFilters } from "./MapFilters";
import { AreaFmDetail } from "../panels/AreaFmDetail";
import { AreaAnalysisPanel } from "../panels/AreaAnalysisPanel";
import { FatoresUrbanosPanel } from "../panels/FatoresUrbanosPanel";
import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { VIEW_HEIGHT } from "@/lib/responsive";

const RIO_CENTER: [number, number] = [-22.9068, -43.1729];
const DEFAULT_ZOOM = 12;

export function MapView() {
  const { filters: globalFilters } = useGlobalFilters();

  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [fatores, setFatores] = useState<FatorUrbano[]>([]);
  const [areas, setAreas] = useState<AreaFm[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaFm | null>(null);
  const [analysisArea, setAnalysisArea] = useState<AreaFm | null>(null);
  const [fatoresArea, setFatoresArea] = useState<AreaFm | null>(null);
  const [localFilters, setLocalFilters] = useState<LocalMapFilters>({});
  const [layers, setLayers] = useState<MapLayerVisibility>({
    heatmap: true,
    fatoresUrbanos: false,
    areasFm: true,
    cameras: false,
  });
  const [loading, setLoading] = useState(true);
  const [layerLoading, setLayerLoading] = useState(0);

  // Desktop: os dois painéis começam abertos e são independentes.
  // Celular: começam recolhidos e só um fica aberto por vez, para não cobrirem o mapa nem um ao outro.
  const isMobile = useIsMobile();
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setLayersCollapsed(true);
      setFiltersCollapsed(true);
    }
  }, [isMobile]);

  const handleLayersCollapsed = (collapsed: boolean) => {
    setLayersCollapsed(collapsed);
    if (isMobile && !collapsed) setFiltersCollapsed(true);
  };

  const handleFiltersCollapsed = (collapsed: boolean) => {
    setFiltersCollapsed(collapsed);
    if (isMobile && !collapsed) setLayersCollapsed(true);
  };

  const fetchHeatmap = useCallback(async () => {
    const params = new URLSearchParams();
    if (globalFilters.ano) params.set("ano", String(globalFilters.ano));
    if (globalFilters.mes) params.set("mes", String(globalFilters.mes));
    if (globalFilters.delito) params.set("delito", globalFilters.delito);
    if (localFilters.dia_semana) params.set("dia_semana", localFilters.dia_semana);
    if (localFilters.hora_inicio !== undefined)
      params.set("hora_inicio", String(localFilters.hora_inicio));
    if (localFilters.hora_fim !== undefined)
      params.set("hora_fim", String(localFilters.hora_fim));

    const res = await fetch(`/api/geo/ocorrencias?${params}`);
    const data = await res.json();
    setHeatPoints(data);
  }, [globalFilters, localFilters]);

  // As áreas FM são a base do mapa e carregam de imediato.
  useEffect(() => {
    async function loadAreas() {
      setLoading(true);
      try {
        const res = await fetch("/api/geo/areas-fm");
        setAreas(await res.json());
      } catch (error) {
        console.error("Erro ao carregar áreas FM:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAreas();
  }, []);

  // Fatores urbanos (~530 KB) e câmeras (~190 KB) começam desligados: só são
  // baixados na primeira vez que a camada é ligada.
  const fatoresRequested = useRef(false);
  const camerasRequested = useRef(false);

  useEffect(() => {
    if (!layers.fatoresUrbanos || fatoresRequested.current) return;
    fatoresRequested.current = true;
    setLayerLoading((n) => n + 1);
    fetch("/api/geo/fatores-urbanos")
      .then((r) => r.json())
      .then(setFatores)
      .catch((error) => {
        fatoresRequested.current = false; // permite tentar de novo ao religar
        console.error("Erro ao carregar fatores urbanos:", error);
      })
      .finally(() => setLayerLoading((n) => n - 1));
  }, [layers.fatoresUrbanos]);

  useEffect(() => {
    if (!layers.cameras || camerasRequested.current) return;
    camerasRequested.current = true;
    setLayerLoading((n) => n + 1);
    fetch("/api/geo/cameras")
      .then((r) => r.json())
      .then(setCameras)
      .catch((error) => {
        camerasRequested.current = false;
        console.error("Erro ao carregar câmeras:", error);
      })
      .finally(() => setLayerLoading((n) => n - 1));
  }, [layers.cameras]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const handleLayerToggle = (layer: MapLayerKey) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleAreaClick = (area: AreaFm) => {
    setSelectedArea(area);
  };

  return (
    <Box position="relative" h={VIEW_HEIGHT} w="100%">
      <LeafletMap
        center={RIO_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {layers.heatmap && <HeatmapLayer points={heatPoints} />}
        {layers.fatoresUrbanos && <FatoresUrbanosLayer fatores={fatores} />}
        {layers.areasFm && (
          <AreasFmLayer areas={areas} onAreaClick={handleAreaClick} />
        )}
        {layers.cameras && <CamerasLayer cameras={cameras} />}
      </LeafletMap>

      <MapControls
        layers={layers}
        onToggle={handleLayerToggle}
        loading={loading || layerLoading > 0}
        collapsed={layersCollapsed}
        onCollapsedChange={handleLayersCollapsed}
      />

      <MapFiltersPanel
        filters={localFilters}
        onFilterChange={setLocalFilters}
        collapsed={filtersCollapsed}
        onCollapsedChange={handleFiltersCollapsed}
      />

      {selectedArea && (
        <AreaFmDetail
          area={selectedArea}
          onClose={() => setSelectedArea(null)}
          onAnalyze={(area) => {
            setAnalysisArea(area);
            setSelectedArea(null);
          }}
          onShowFatores={(area) => {
            setFatoresArea(area);
            setSelectedArea(null);
          }}
        />
      )}

      {analysisArea && (
        <AreaAnalysisPanel
          areaFmId={analysisArea.id}
          areaName={analysisArea.nome_area_fm}
          onClose={() => setAnalysisArea(null)}
        />
      )}

      {fatoresArea && (
        <FatoresUrbanosPanel
          areaFmId={fatoresArea.id}
          areaName={fatoresArea.nome_area_fm}
          onClose={() => setFatoresArea(null)}
        />
      )}
    </Box>
  );
}
