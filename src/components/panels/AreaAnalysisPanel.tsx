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
import type {
  AnalysisResponse,
  PerguntaNorteadora,
} from "@/types/analysis";
import { HeatmapDiaHora } from "./HeatmapDiaHora";

interface AreaAnalysisPanelProps {
  areaFmId: number;
  areaName: string;
  onClose: () => void;
}

const PERGUNTAS_NORTEADORAS: Array<{
  key: keyof AnalysisResponse["analysis"]["perguntas_norteadoras"];
  numero: number;
  titulo: string;
}> = [
  {
    key: "rota_fm",
    numero: 1,
    titulo: "Locais de maior incidencia coincidem com a rota da FM?",
  },
  {
    key: "horario_qmd",
    numero: 2,
    titulo: "Horario de maior incidencia coincide com o QMD?",
  },
  {
    key: "modelo_emprego",
    numero: 3,
    titulo: "Dinamica criminal coincide com o modelo de emprego da FM?",
  },
  {
    key: "fatores_orgaos",
    numero: 4,
    titulo: "Fatores estao sendo resolvidos pelos orgaos complementares?",
  },
];

function PerguntaBlock({
  numero,
  titulo,
  data,
}: {
  numero: number;
  titulo: string;
  data: PerguntaNorteadora;
}) {
  return (
    <Box
      p={3}
      bg="purple.50"
      borderRadius="md"
      borderLeft="3px solid"
      borderLeftColor="purple.400"
    >
      <Box display="flex" gap={2} mb={2}>
        <Badge colorPalette="purple" variant="solid" size="sm">
          {numero}
        </Badge>
        <Text fontWeight="bold" fontSize="xs" color="purple.900">
          {titulo}
        </Text>
      </Box>
      <Text fontSize="xs" color="gray.700" mb={2}>
        <Text as="span" fontWeight="semibold">
          Diagnostico:{" "}
        </Text>
        {data.diagnostico}
      </Text>
      <Text fontSize="xs" color="gray.800">
        <Text as="span" fontWeight="semibold">
          Sugestao:{" "}
        </Text>
        {data.sugestao}
      </Text>
    </Box>
  );
}

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

      const result: AnalysisResponse = await res.json();
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
      w="460px"
      overflowY="auto"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={1}>
          <Badge colorPalette="purple" w="fit-content">
            Analise IA
          </Badge>
          <Heading size="md">{areaName}</Heading>
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

      {!data && !loading && (
        <Box mt={6} textAlign="center">
          <Text fontSize="sm" color="gray.500" mb={4}>
            Gere o relatorio analitico desta area FM respondendo as 4 perguntas
            norteadoras do CompStat.
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
            Cruzando mancha criminal, fatores urbanos e dinamica...
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
          <Box display="flex" gap={2} flexWrap="wrap">
            <Badge size="sm">{data.metadata.total_ocorrencias} ocorr.</Badge>
            <Badge size="sm">{data.metadata.total_denuncias} denun.</Badge>
            <Badge size="sm">{data.metadata.total_fatores} fatores</Badge>
            {data.metadata.fonte === "fallback" && (
              <Badge size="sm" colorPalette="orange">
                modo demo
              </Badge>
            )}
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={1}>
              Resumo Executivo
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              {data.analysis.resumo_executivo}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={1}>
              Dinamica Criminal
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              {data.analysis.dinamica_criminal}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={2}>
              Heatmap Dia x Hora
            </Text>
            <HeatmapDiaHora cells={data.heatmap_dia_hora} />
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={2}>
              Perguntas Norteadoras
            </Text>
            <Stack gap={3}>
              {PERGUNTAS_NORTEADORAS.map((p) => (
                <PerguntaBlock
                  key={p.key}
                  numero={p.numero}
                  titulo={p.titulo}
                  data={data.analysis.perguntas_norteadoras[p.key]}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
