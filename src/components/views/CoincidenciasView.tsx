"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer as LeafletMap, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  Stack,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import "leaflet/dist/leaflet.css";
import type { RiskScore, RiskHotspot } from "@/lib/risk-queries";
import { RiskZonesLayer } from "../map/layers/RiskZonesLayer";
import { RiskRadiusControl } from "../map/RiskRadiusControl";
import { RiskTop10Panel } from "../panels/RiskTop10Panel";
import { RiskDetailPanel } from "../panels/RiskDetailPanel";
import { TOUCH_TARGET, VIEW_HEIGHT } from "@/lib/responsive";

const RIO_CENTER: [number, number] = [-22.9068, -43.1729];
const DEFAULT_ZOOM = 12;

type MobileTab = "lista" | "mapa";

interface FocusPoint {
  lat: number;
  lng: number;
  label: string;
  /** Muda a cada clique, para o mapa recentralizar mesmo ao clicar no mesmo ponto de novo. */
  seq: number;
}

const FOCUS_ZOOM = 16;

// Centraliza o mapa no hotspot escolhido na lista. Espera o MapResizer (que remede o mapa ao
// voltar para a aba "Mapa" no celular) antes de mover a câmera.
function MapFocus({ point }: { point: FocusPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    const id = setTimeout(() => {
      map.invalidateSize();
      // Aba em segundo plano não roda as animações do Leaflet: nesse caso a câmera pula direto.
      map.setView([point.lat, point.lng], Math.max(map.getZoom(), FOCUS_ZOOM), { animate: !document.hidden });
    }, 150);
    return () => clearTimeout(id);
  }, [point, map]);
  return null;
}

// O Leaflet mede o contêiner ao montar. Escondido (aba "Lista" no celular) ele fica com
// largura 0; ao voltar para a aba "Mapa" é preciso remedir.
function MapResizer({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(id);
  }, [active, map]);
  return null;
}

export function CoincidenciasView() {
  const [radius, setRadius] = useState(200);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [hotspots, setHotspots] = useState<RiskHotspot[]>([]);
  const [selectedRiskArea, setSelectedRiskArea] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<MobileTab>("lista");
  const [focus, setFocus] = useState<FocusPoint | null>(null);

  const fetchRiskData = useCallback(async (r: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/geo/risk-scoring?radius=${r}`);
      const data = await res.json();
      setRiskScores(data.scoring || []);
      setHotspots(data.hotspots || []);
    } catch (error) {
      console.error("Erro ao carregar dados de risco:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData(radius);
  }, [radius, fetchRiskData]);

  const handleHotspotClick = (hotspot: RiskHotspot) => {
    setFocus((prev) => ({
      lat: hotspot.latitude,
      lng: hotspot.longitude,
      label: hotspot.logradouro || "Local não identificado",
      seq: (prev?.seq ?? 0) + 1,
    }));
    setTab("mapa"); // no celular a lista e o mapa ficam em abas; no desktop não muda nada
  };

  const handleRiskAreaClick = (area: RiskScore) => {
    setSelectedRiskArea(area);
  };

  const bingoCount = riskScores.filter((r) => {
    let l = 0;
    if (r.ocorrencias_count > 0) l++;
    if (r.fatores_count > 0) l++;
    if (r.denuncias_count > 0) l++;
    return l >= 2;
  }).length;

  return (
    <Box h={VIEW_HEIGHT} display="flex" flexDirection="column">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={{ base: 4, md: 6 }}
        py={4}
      >
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <Stack gap={1}>
            <Heading size="md" color="#0A2E5C">
              🎯 Coincidências de Alto Risco
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Áreas onde mancha criminal, fatores urbanos e denúncias se sobrepõem
            </Text>
          </Stack>

          <HStack gap={{ base: 4, md: 6 }} w={{ base: "100%", md: "auto" }}>
            <Stack gap={0} align="end">
              <Text fontSize="xs" color="gray.500">
                BINGOs detectados
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="red.600">
                {bingoCount}
              </Text>
            </Stack>
            <Box minW={{ base: 0, md: "160px" }} flex={{ base: 1, md: "none" }}>
              <RiskRadiusControl radius={radius} onRadiusChange={setRadius} />
            </Box>
          </HStack>
        </HStack>
      </Box>

      {/* Celular: alterna entre a lista e o mapa, que não cabem lado a lado */}
      <HStack
        display={{ base: "flex", md: "none" }}
        gap={2}
        px={4}
        py={2}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        role="tablist"
      >
        {(["lista", "mapa"] as const).map((t) => (
          <Button
            key={t}
            role="tab"
            aria-selected={tab === t}
            flex={1}
            minH={TOUCH_TARGET}
            variant={tab === t ? "solid" : "outline"}
            colorPalette="blue"
            onClick={() => setTab(t)}
          >
            {t === "lista" ? `Lista (${hotspots.length})` : "Mapa"}
          </Button>
        ))}
      </HStack>

      <Box flex={1} display="flex" overflow="hidden" minH={0}>
        <Box
          display={{ base: tab === "lista" ? "block" : "none", md: "block" }}
          w={{ base: "100%", md: "400px" }}
          bg="gray.50"
          borderRight={{ base: "none", md: "1px solid" }}
          borderColor="gray.200"
          overflowY="auto"
          p={4}
        >
          {loading ? (
            <Box textAlign="center" py={8}>
              <Spinner />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Calculando coincidências...
              </Text>
            </Box>
          ) : (
            <Stack gap={3}>
              <HStack gap={2}>
                <Badge colorPalette="red" variant="solid">
                  Top {hotspots.length}
                </Badge>
                <Text fontSize="xs" color="gray.600">
                  hotspots no raio de {radius}m
                </Text>
              </HStack>
              <RiskTop10Panel
                hotspots={hotspots}
                onHotspotClick={handleHotspotClick}
              />
            </Stack>
          )}
        </Box>

        <Box
          display={{ base: tab === "mapa" ? "block" : "none", md: "block" }}
          flex={1}
          position="relative"
        >
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
            <MapResizer active={tab === "mapa"} />
            <MapFocus point={focus} />
            {focus && (
              <CircleMarker
                key={focus.seq}
                center={[focus.lat, focus.lng]}
                radius={14}
                pathOptions={{ color: "#a50f15", weight: 3, fillColor: "#de2d26", fillOpacity: 0.35 }}
              >
                <Popup>{focus.label}</Popup>
              </CircleMarker>
            )}
            <RiskZonesLayer
              areas={riskScores}
              onAreaClick={handleRiskAreaClick}
            />
          </LeafletMap>

          {selectedRiskArea && (
            <RiskDetailPanel
              area={selectedRiskArea}
              onClose={() => setSelectedRiskArea(null)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
