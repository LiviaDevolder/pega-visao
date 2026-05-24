"use client";

import { Box, Button, Heading, Text, Stack, Badge, IconButton } from "@chakra-ui/react";
import type { AreaFm } from "@/types/geo";

interface AreaFmDetailProps {
  area: AreaFm;
  onClose: () => void;
  onAnalyze?: (area: AreaFm) => void;
}

export function AreaFmDetail({ area, onClose, onAnalyze }: AreaFmDetailProps) {
  return (
    <Box
      position="absolute"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="xl"
      minW="320px"
      maxW="400px"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={2}>
          <Badge colorPalette="blue" w="fit-content">
            Area FM
          </Badge>
          <Heading size="md" color="gray.800">
            {area.nome_area_fm}
          </Heading>
        </Stack>
        <IconButton
          aria-label="Fechar"
          size="sm"
          variant="ghost"
          onClick={onClose}
        >
          X
        </IconButton>
      </Box>

      <Stack gap={3} mt={4}>
        <Box display="flex" justifyContent="space-between">
          <Text fontSize="sm" color="gray.600">
            Total de Ocorrencias
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="red.600">
            {area.total_ocorrencias?.toLocaleString("pt-BR") || "—"}
          </Text>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Text fontSize="sm" color="gray.600">
            Fatores Urbanos
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="orange.600">
            {area.total_fatores?.toLocaleString("pt-BR") || "—"}
          </Text>
        </Box>

        {onAnalyze && (
          <Button
            size="sm"
            colorPalette="purple"
            mt={2}
            onClick={() => onAnalyze(area)}
          >
            Analisar com IA
          </Button>
        )}
      </Stack>
    </Box>
  );
}
