"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import type { RiskScore } from "@/lib/risk-queries";

interface RiskDetailPanelProps {
  area: RiskScore;
  onClose: () => void;
}

interface DetailData {
  ocorrencias: Array<{ desc_delito: string; total: number }>;
  fatores: Array<{
    orgao_responsavel: string;
    tipo_ocorrencia_descricao: string;
    total: number;
  }>;
  denuncias: Array<{ assuntos_classe: string; total: number }>;
}

export function RiskDetailPanel({ area, onClose }: RiskDetailPanelProps) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/geo/risk-detail?area_fm_id=${area.id}`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [area.id]);

  const riskColor =
    area.risk_level === "alto"
      ? "red"
      : area.risk_level === "medio"
        ? "orange"
        : "green";

  let layersCount = 0;
  if (area.ocorrencias_count > 0) layersCount++;
  if (area.fatores_count > 0) layersCount++;
  if (area.denuncias_count > 0) layersCount++;
  const isBingo = layersCount >= 2;

  return (
    <Box
      position="absolute"
      right={4}
      bottom={4}
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="xl"
      maxW="380px"
      maxH="70vh"
      overflowY="auto"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={1}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {isBingo && (
              <Badge colorPalette="red" variant="solid" w="fit-content">
                BINGO {layersCount}/3
              </Badge>
            )}
            <Badge colorPalette={riskColor} w="fit-content">
              Risco {area.risk_level.toUpperCase()}
            </Badge>
          </Box>
          <Heading size="sm">{area.nome_area_fm}</Heading>
          <Text fontSize="xs" color="gray.500">
            Score: {area.risk_score.toFixed(4)} | Area:{" "}
            {area.area_km2.toFixed(2)} km2
          </Text>
        </Stack>
        <IconButton aria-label="Fechar" size="sm" variant="ghost" onClick={onClose}>
          X
        </IconButton>
      </Box>

      {loading ? (
        <Box textAlign="center" py={8}>
          <Spinner />
        </Box>
      ) : detail ? (
        <Stack gap={4} mt={4}>
          <Box>
            <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
              Ocorrencias por Tipo
            </Text>
            {detail.ocorrencias.map((o, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                py={1}
              >
                <Text fontSize="xs" color="gray.600">
                  {o.desc_delito}
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {o.total}
                </Text>
              </Box>
            ))}
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
              Fatores Urbanos por Orgao
            </Text>
            {detail.fatores.map((f, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                py={1}
              >
                <Text fontSize="xs" color="gray.600">
                  {f.orgao_responsavel} - {f.tipo_ocorrencia_descricao}
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {f.total}
                </Text>
              </Box>
            ))}
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.700">
              Denuncias por Classe
            </Text>
            {detail.denuncias.map((d, i) => (
              <Box
                key={i}
                display="flex"
                justifyContent="space-between"
                py={1}
              >
                <Text fontSize="xs" color="gray.600">
                  {d.assuntos_classe || "Sem classificacao"}
                </Text>
                <Text fontSize="xs" fontWeight="bold">
                  {d.total}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      ) : null}
    </Box>
  );
}
