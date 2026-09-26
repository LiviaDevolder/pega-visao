"use client";

import { Box, Button, Heading, Text, Stack, Badge, IconButton } from "@chakra-ui/react";
import type { AreaFm } from "@/types/geo";
import { ReportButton } from "./ReportButton";
import { BottomSheet } from "@/components/ui/BottomSheet";

interface AreaFmDetailProps {
  area: AreaFm;
  onClose: () => void;
  onAnalyze?: (area: AreaFm) => void;
  onShowFatores?: (area: AreaFm) => void;
}

export function AreaFmDetail({ area, onClose, onAnalyze, onShowFatores }: AreaFmDetailProps) {
  return (
    <BottomSheet
      title="Área FM"
      onClose={onClose}
      desktop={{
        bottom: 4,
        left: "50%",
        transform: "translateX(-50%)",
        minW: "320px",
        maxW: "400px",
        borderRadius: "lg",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={2}>
          <Badge colorPalette="blue" w="fit-content" display={{ base: "none", md: "inline-flex" }}>
            Área FM
          </Badge>
          <Heading size="md" color="gray.800">
            {area.nome_area_fm}
          </Heading>
        </Stack>
        {/* No celular o botão de fechar fica na barra do BottomSheet */}
        <IconButton
          aria-label="Fechar"
          size="sm"
          variant="ghost"
          display={{ base: "none", md: "inline-flex" }}
          onClick={onClose}
        >
          X
        </IconButton>
      </Box>

      <Stack gap={3} mt={4}>
        <Box display="flex" justifyContent="space-between">
          <Text fontSize="sm" color="gray.600">
            Total de Ocorrências
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

        <Box display="flex" gap={2} mt={2} flexWrap="wrap" flexDirection={{ base: "column", md: "row" }}>
          {onAnalyze && (
            <Button
              size={{ base: "md", md: "sm" }}
              minH={{ base: "44px", md: "auto" }}
              colorPalette="purple"
              onClick={() => onAnalyze(area)}
            >
              Analisar com IA
            </Button>
          )}
          {onShowFatores && (
            <Button
              size={{ base: "md", md: "sm" }}
              minH={{ base: "44px", md: "auto" }}
              colorPalette="orange"
              onClick={() => onShowFatores(area)}
            >
              Fatores Urbanos
            </Button>
          )}
          <ReportButton areaFmId={area.id} areaName={area.nome_area_fm} fullWidth />
        </Box>
      </Stack>
    </BottomSheet>
  );
}
