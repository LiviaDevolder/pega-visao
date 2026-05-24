"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Spinner,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import type { AnalysisResponse } from "@/types/analysis";

interface AreaAnalysisPanelProps {
  areaFmId: number;
  areaName: string;
  onClose: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  resumo_executivo: "Resumo Executivo",
  analise_temporal: "Analise Temporal",
  dinamica_criminal: "Dinamica Criminal",
  fatores_urbanos: "Fatores Urbanos",
  sintese_qualitativa: "Sintese Qualitativa",
};

export function AreaAnalysisPanel({
  areaFmId,
  areaName,
  onClose,
}: AreaAnalysisPanelProps) {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis/area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area_fm_id: areaFmId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro desconhecido");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar analise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="absolute"
      right={4}
      top={4}
      bottom={4}
      zIndex={1001}
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="xl"
      w="400px"
      overflowY="auto"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={1}>
          <Badge colorPalette="purple" w="fit-content">
            Analise IA
          </Badge>
          <Heading size="md">{areaName}</Heading>
        </Stack>
        <IconButton aria-label="Fechar" size="sm" variant="ghost" onClick={onClose}>
          X
        </IconButton>
      </Box>

      {!data && !loading && (
        <Box mt={6} textAlign="center">
          <Text fontSize="sm" color="gray.500" mb={4}>
            Gere uma analise automatizada com IA para esta area FM.
          </Text>
          <Button
            colorPalette="purple"
            onClick={handleAnalyze}
            disabled={loading}
          >
            Analisar Area
          </Button>
        </Box>
      )}

      {loading && (
        <Box mt={8} textAlign="center">
          <Spinner size="lg" color="purple.500" />
          <Text mt={3} fontSize="sm" color="gray.500">
            Gerando analise...
          </Text>
        </Box>
      )}

      {error && (
        <Box mt={4} p={3} bg="red.50" borderRadius="md">
          <Text fontSize="sm" color="red.600">
            {error}
          </Text>
          <Button size="sm" mt={2} onClick={handleAnalyze}>
            Tentar novamente
          </Button>
        </Box>
      )}

      {data && (
        <Stack gap={4} mt={4}>
          <Box display="flex" gap={2}>
            <Badge size="sm">{data.metadata.total_ocorrencias} ocorr.</Badge>
            <Badge size="sm">{data.metadata.total_denuncias} denun.</Badge>
            <Badge size="sm">{data.metadata.total_fatores} fatores</Badge>
          </Box>

          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const content =
              data.analysis[key as keyof typeof data.analysis];
            if (!content) return null;
            return (
              <Box key={key}>
                <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={1}>
                  {label}
                </Text>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {content}
                </Text>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
