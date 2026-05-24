"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { FmAllocationTable } from "./FmAllocationTable";
import type { FmAllocation } from "@/lib/ai/prompts/fm-allocation";

interface FmSuggestionPanelProps {
  onClose: () => void;
  onShowOnMap?: (allocation: FmAllocation[]) => void;
}

export function FmSuggestionPanel({
  onClose,
  onShowOnMap,
}: FmSuggestionPanelProps) {
  const [allocation, setAllocation] = useState<FmAllocation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest-fm", {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro desconhecido");
      }

      const data = await res.json();
      setAllocation(data.allocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar sugestao");
    } finally {
      setLoading(false);
    }
  };

  const totalAgentes = allocation
    ? allocation.reduce((sum, a) => sum + a.agentes, 0)
    : 0;

  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      right={4}
      bottom={4}
      zIndex={1001}
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="xl"
      overflowY="auto"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={1}>
          <Badge colorPalette="blue" w="fit-content">
            Sugestao Tatica
          </Badge>
          <Heading size="md">Cobertura da Forca Municipal</Heading>
          <Text fontSize="sm" color="gray.500">
            Distribuicao de 600 agentes em 22 areas
          </Text>
        </Stack>
        <IconButton aria-label="Fechar" size="sm" variant="ghost" onClick={onClose}>
          X
        </IconButton>
      </Box>

      {!allocation && !loading && (
        <Box mt={6} textAlign="center">
          <Text fontSize="sm" color="gray.500" mb={4}>
            Gere uma sugestao de distribuicao baseada em dados criminais, fatores
            urbanos e analise de risco.
          </Text>
          <Button colorPalette="blue" onClick={handleGenerate}>
            Gerar Sugestao
          </Button>
        </Box>
      )}

      {loading && (
        <Box mt={8} textAlign="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={3} fontSize="sm" color="gray.500">
            Analisando dados e gerando distribuicao...
          </Text>
        </Box>
      )}

      {error && (
        <Box mt={4} p={3} bg="red.50" borderRadius="md">
          <Text fontSize="sm" color="red.600">
            {error}
          </Text>
          <Button size="sm" mt={2} onClick={handleGenerate}>
            Tentar novamente
          </Button>
        </Box>
      )}

      {allocation && (
        <Stack gap={4} mt={4}>
          <Box display="flex" gap={3} alignItems="center">
            <Badge colorPalette="green">Total: {totalAgentes} agentes</Badge>
            <Badge>{allocation.length} areas</Badge>
            {onShowOnMap && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => onShowOnMap(allocation)}
              >
                Ver no Mapa
              </Button>
            )}
          </Box>

          <FmAllocationTable allocation={allocation} />
        </Stack>
      )}
    </Box>
  );
}
