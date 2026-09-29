"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { HEATMAP_GRADIENT } from "./layers/HeatmapLayer";
import { Z_INDEX } from "@/lib/responsive";

const GRADIENT_CSS = `linear-gradient(to right, ${Object.entries(HEATMAP_GRADIENT)
  .sort(([a], [b]) => Number(a) - Number(b)) // a chave 1.0 vira "1" e o JS a enumera primeiro
  .map(([stop, color]) => `${color} ${Math.round(Number(stop) * 100)}%`)
  .join(", ")})`;

// Legenda da mancha criminal: barra com o mesmo gradiente do mapa de calor.
export function HeatmapLegend() {
  return (
    <Box
      position="absolute"
      left={{ base: 3, md: 4 }}
      bottom={{ base: 6, md: 6 }}
      zIndex={Z_INDEX.mapOverlay}
      bg="white"
      borderRadius="md"
      px={3}
      py={2}
      shadow="md"
      role="img"
      aria-label="Legenda da mancha criminal: cores mais escuras indicam maior concentração de ocorrências"
      w={{ base: "140px", md: "180px" }}
    >
      <Text fontSize="2xs" fontWeight="700" color="gray.700" mb={1} lineHeight="1.2">
        Concentração de ocorrências
      </Text>
      <Box h="8px" borderRadius="full" style={{ background: GRADIENT_CSS }} />
      <HStack justify="space-between" mt={1}>
        <Text fontSize="2xs" color="gray.600">
          menor
        </Text>
        <Text fontSize="2xs" color="gray.600">
          maior
        </Text>
      </HStack>
    </Box>
  );
}
