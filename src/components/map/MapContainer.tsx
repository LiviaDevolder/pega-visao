"use client";

import { useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [fatoresRes, areasRes, camerasRes] = await Promise.all([
          fetch("/api/geo/fatores-urbanos"),
          fetch("/api/geo/areas-fm"),
          fetch("/api/geo/cameras"),
        ]);

        const [fatoresData, areasData, camerasData] = await Promise.all([
          fatoresRes.json(),
          areasRes.json(),
          camerasRes.json(),
        ]);

        setFatores(fatoresData);
        setAreas(areasData);
        setCameras(camerasData);
      } catch (error) {
        console.error("Erro ao carregar dados do mapa:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
    <Box position="relative" h="calc(100vh - 56px)" w="100%">
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
        loading={loading}
      />

      <MapFiltersPanel
        filters={localFilters}
        onFilterChange={setLocalFilters}
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
