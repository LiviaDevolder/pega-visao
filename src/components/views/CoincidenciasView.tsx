"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import {
  Box,
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

const RIO_CENTER: [number, number] = [-22.9068, -43.1729];
const DEFAULT_ZOOM = 12;

export function CoincidenciasView() {
  const [radius, setRadius] = useState(200);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [hotspots, setHotspots] = useState<RiskHotspot[]>([]);
  const [selectedRiskArea, setSelectedRiskArea] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(false);

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
    console.log("Hotspot clicked:", hotspot);
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
    <Box h="calc(100vh - 56px)" display="flex" flexDirection="column">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={6}
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

          <HStack gap={6}>
            <Stack gap={0} align="end">
              <Text fontSize="xs" color="gray.500">
                BINGOs detectados
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="red.600">
                {bingoCount}
              </Text>
            </Stack>
            <Box minW="160px">
              <RiskRadiusControl radius={radius} onRadiusChange={setRadius} />
            </Box>
          </HStack>
        </HStack>
      </Box>

      <Box flex={1} display="flex" overflow="hidden">
        <Box
          w="400px"
          bg="gray.50"
          borderRight="1px solid"
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

        <Box flex={1} position="relative">
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
