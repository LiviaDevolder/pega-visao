"use client";

import { Box, Stack, Text, Badge, Heading } from "@chakra-ui/react";
import type { RiskHotspot } from "@/lib/risk-queries";

interface RiskTop10PanelProps {
  hotspots: RiskHotspot[];
  onHotspotClick: (hotspot: RiskHotspot) => void;
}

function countLayers(h: RiskHotspot): number {
  let count = 0;
  if (h.ocorrencias_no_raio > 0) count++;
  if (h.fatores_no_raio > 0) count++;
  if (h.denuncias_no_raio > 0) count++;
  return count;
}

function bingoColor(layers: number): string {
  if (layers >= 3) return "red";
  if (layers === 2) return "orange";
  return "yellow";
}

export function RiskTop10Panel({
  hotspots,
  onHotspotClick,
}: RiskTop10PanelProps) {
  if (!hotspots.length) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="gray.500">
          Nenhuma coincidencia encontrada no raio configurado.
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap={2}>
      <Box>
        <Heading size="sm" color="gray.700">
          Painel de Coincidencias
        </Heading>
        <Text fontSize="xs" color="gray.500">
          Pontos onde mancha criminal, fatores urbanos e denuncias se sobrepoem
        </Text>
      </Box>

      {hotspots.map((h, index) => {
        const layers = countLayers(h);
        const color = bingoColor(layers);
        return (
          <Box
            key={index}
            p={3}
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.100"
            cursor="pointer"
            _hover={{ borderColor: `${color}.300`, bg: `${color}.50` }}
            onClick={() => onHotspotClick(h)}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                #{index + 1} {h.logradouro || "Local nao identificado"}
              </Text>
              <Badge colorPalette={color} variant="solid" size="sm">
                BINGO {layers}/3
              </Badge>
            </Box>
            <Box display="flex" gap={3}>
              <Text fontSize="xs" color="red.600">
                {h.ocorrencias_no_raio} ocorr.
              </Text>
              <Text fontSize="xs" color="orange.600">
                {h.fatores_no_raio} fatores
              </Text>
              <Text fontSize="xs" color="purple.600">
                {h.denuncias_no_raio} denun.
              </Text>
              <Text fontSize="xs" color="gray.500" ml="auto">
                score {h.score.toFixed(0)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
