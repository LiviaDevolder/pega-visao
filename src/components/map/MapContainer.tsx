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
  MapFilters,
  LayerVisibility,
} from "@/types/geo";
import type { RiskScore, RiskHotspot } from "@/lib/risk-queries";
import { HeatmapLayer } from "./layers/HeatmapLayer";
import { FatoresUrbanosLayer } from "./layers/FatoresUrbanosLayer";
import { AreasFmLayer } from "./layers/AreasFmLayer";
import { CamerasLayer } from "./layers/CamerasLayer";
import { RiskZonesLayer } from "./layers/RiskZonesLayer";
import { MapControls } from "./MapControls";
import { MapFiltersPanel } from "./MapFilters";
import { RiskRadiusControl } from "./RiskRadiusControl";
import { AreaFmDetail } from "../panels/AreaFmDetail";
import { AreaAnalysisPanel } from "../panels/AreaAnalysisPanel";
import { RiskTop10Panel } from "../panels/RiskTop10Panel";
import { RiskDetailPanel } from "../panels/RiskDetailPanel";

const RIO_CENTER: [number, number] = [-22.9068, -43.1729];
const DEFAULT_ZOOM = 12;

export function MapView() {
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [fatores, setFatores] = useState<FatorUrbano[]>([]);
  const [areas, setAreas] = useState<AreaFm[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [hotspots, setHotspots] = useState<RiskHotspot[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaFm | null>(null);
  const [selectedRiskArea, setSelectedRiskArea] = useState<RiskScore | null>(null);
  const [analysisArea, setAnalysisArea] = useState<AreaFm | null>(null);
  const [radius, setRadius] = useState(200);
  const [filters, setFilters] = useState<MapFilters>({});
  const [layers, setLayers] = useState<LayerVisibility>({
    heatmap: true,
    fatoresUrbanos: false,
    areasFm: true,
    cameras: false,
    riskZones: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchHeatmap = useCallback(async (f: MapFilters) => {
    const params = new URLSearchParams();
    if (f.ano) params.set("ano", String(f.ano));
    if (f.mes) params.set("mes", String(f.mes));
    if (f.delito) params.set("delito", f.delito);
    if (f.dia_semana) params.set("dia_semana", f.dia_semana);
    if (f.hora_inicio !== undefined)
      params.set("hora_inicio", String(f.hora_inicio));
    if (f.hora_fim !== undefined) params.set("hora_fim", String(f.hora_fim));

    const res = await fetch(`/api/geo/ocorrencias?${params}`);
    const data = await res.json();
    setHeatPoints(data);
  }, []);

  const fetchRiskData = useCallback(async (r: number) => {
    try {
      const res = await fetch(`/api/geo/risk-scoring?radius=${r}`);
      const data = await res.json();
      setRiskScores(data.scoring);
      setHotspots(data.hotspots);
    } catch (error) {
      console.error("Erro ao carregar dados de risco:", error);
    }
  }, []);

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
        await Promise.all([fetchHeatmap({}), fetchRiskData(200)]);
      } catch (error) {
        console.error("Erro ao carregar dados do mapa:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fetchHeatmap, fetchRiskData]);

  useEffect(() => {
    fetchHeatmap(filters);
  }, [filters, fetchHeatmap]);

  useEffect(() => {
    fetchRiskData(radius);
  }, [radius, fetchRiskData]);

  const handleLayerToggle = (layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleFilterChange = (newFilters: MapFilters) => {
    setFilters(newFilters);
  };

  const handleAreaClick = (area: AreaFm) => {
    setSelectedArea(area);
    setSelectedRiskArea(null);
  };

  const handleRiskAreaClick = (area: RiskScore) => {
    setSelectedRiskArea(area);
    setSelectedArea(null);
  };

  const handleHotspotClick = (hotspot: RiskHotspot) => {
    // Could center map on hotspot location
    console.log("Hotspot clicked:", hotspot);
  };

  return (
    <Box position="relative" h="100vh" w="100%">
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
        {layers.areasFm && !layers.riskZones && (
          <AreasFmLayer areas={areas} onAreaClick={handleAreaClick} />
        )}
        {layers.riskZones && (
          <RiskZonesLayer areas={riskScores} onAreaClick={handleRiskAreaClick} />
        )}
        {layers.cameras && <CamerasLayer cameras={cameras} />}
      </LeafletMap>

      <MapControls
        layers={layers}
        onToggle={handleLayerToggle}
        loading={loading}
      />

      <MapFiltersPanel filters={filters} onFilterChange={handleFilterChange} />

      {layers.riskZones && (
        <Box
          position="absolute"
          bottom={4}
          left={4}
          zIndex={1000}
          bg="white"
          borderRadius="lg"
          p={4}
          shadow="lg"
          maxW="320px"
          maxH="60vh"
          overflowY="auto"
        >
          <RiskRadiusControl radius={radius} onRadiusChange={setRadius} />
          <Box mt={4}>
            <RiskTop10Panel
              hotspots={hotspots}
              onHotspotClick={handleHotspotClick}
            />
          </Box>
        </Box>
      )}

      {selectedArea && (
        <AreaFmDetail
          area={selectedArea}
          onClose={() => setSelectedArea(null)}
          onAnalyze={(area) => {
            setAnalysisArea(area);
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

      {selectedRiskArea && (
        <RiskDetailPanel
          area={selectedRiskArea}
          onClose={() => setSelectedRiskArea(null)}
        />
      )}
    </Box>
  );
}
