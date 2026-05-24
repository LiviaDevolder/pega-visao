"use client";

import { Box, Stack, Text, Badge, Heading } from "@chakra-ui/react";
import type { RiskHotspot } from "@/lib/risk-queries";

interface RiskTop10PanelProps {
  hotspots: RiskHotspot[];
  onHotspotClick: (hotspot: RiskHotspot) => void;
}

export function RiskTop10Panel({
  hotspots,
  onHotspotClick,
}: RiskTop10PanelProps) {
  if (!hotspots.length) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="gray.500">
          Nenhuma sobreposicao encontrada no raio configurado.
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap={2}>
      <Heading size="sm" color="gray.700">
        Top 10 Pontos Criticos
      </Heading>

      {hotspots.map((h, index) => (
        <Box
          key={index}
          p={3}
          bg="white"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.100"
          cursor="pointer"
          _hover={{ borderColor: "red.300", bg: "red.50" }}
          onClick={() => onHotspotClick(h)}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              #{index + 1} {h.logradouro || "Local nao identificado"}
            </Text>
            <Badge colorPalette="red" size="sm">
              {h.score.toFixed(0)}
            </Badge>
          </Box>
          <Box display="flex" gap={3} mt={1}>
            <Text fontSize="xs" color="red.600">
              {h.ocorrencias_no_raio} ocorr.
            </Text>
            <Text fontSize="xs" color="orange.600">
              {h.fatores_no_raio} fatores
            </Text>
            <Text fontSize="xs" color="purple.600">
              {h.denuncias_no_raio} denun.
            </Text>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
