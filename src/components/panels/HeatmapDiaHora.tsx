"use client";

import { Box, Text, Stack } from "@chakra-ui/react";
import type { HeatmapCell } from "@/types/analysis";

interface HeatmapDiaHoraProps {
  cells: HeatmapCell[];
}

const DIAS_ORDEM = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
];

const DIAS_ALIASES: Record<string, string> = {
  "DOMINGO": "Domingo",
  "SEGUNDA": "Segunda",
  "SEGUNDA-FEIRA": "Segunda",
  "TERCA": "Terca",
  "TERÇA": "Terca",
  "TERCA-FEIRA": "Terca",
  "TERÇA-FEIRA": "Terca",
  "QUARTA": "Quarta",
  "QUARTA-FEIRA": "Quarta",
  "QUINTA": "Quinta",
  "QUINTA-FEIRA": "Quinta",
  "SEXTA": "Sexta",
  "SEXTA-FEIRA": "Sexta",
  "SABADO": "Sabado",
  "SÁBADO": "Sabado",
};

function normalizeDia(raw: string): string {
  return DIAS_ALIASES[raw.toUpperCase().trim()] ?? raw;
}

function colorForIntensity(value: number, max: number): string {
  if (max === 0 || value === 0) return "gray.50";
  const ratio = value / max;
  if (ratio >= 0.8) return "red.500";
  if (ratio >= 0.6) return "red.400";
  if (ratio >= 0.4) return "orange.400";
  if (ratio >= 0.2) return "orange.200";
  if (ratio > 0) return "yellow.100";
  return "gray.50";
}

export function HeatmapDiaHora({ cells }: HeatmapDiaHoraProps) {
  const matrix: Record<string, Record<number, number>> = {};
  for (const dia of DIAS_ORDEM) {
    matrix[dia] = {};
  }

  let max = 0;
  for (const cell of cells) {
    const dia = normalizeDia(cell.dia_semana);
    if (!matrix[dia]) continue;
    matrix[dia][cell.hora] = cell.total;
    if (cell.total > max) max = cell.total;
  }

  const horas = Array.from({ length: 24 }, (_, i) => i);

  if (cells.length === 0) {
    return (
      <Text fontSize="xs" color="gray.500">
        Sem dados temporais para esta area.
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      <Box overflowX="auto">
        <Box display="inline-block" minW="100%">
          <Box display="flex" alignItems="center" mb={1}>
            <Box w="60px" />
            {horas.map((h) => (
              <Box
                key={h}
                w="14px"
                fontSize="9px"
                color="gray.500"
                textAlign="center"
              >
                {h % 3 === 0 ? h : ""}
              </Box>
            ))}
          </Box>
          {DIAS_ORDEM.map((dia) => (
            <Box key={dia} display="flex" alignItems="center" mb="2px">
              <Box w="60px" fontSize="10px" color="gray.700" pr={2}>
                {dia}
              </Box>
              {horas.map((h) => {
                const total = matrix[dia][h] ?? 0;
                return (
                  <Box
                    key={h}
                    w="14px"
                    h="14px"
                    bg={colorForIntensity(total, max)}
                    title={`${dia} ${h}h: ${total} ocorr.`}
                    borderRadius="sm"
                    mr="1px"
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text fontSize="xs" color="gray.500">
          Baixo
        </Text>
        <Box display="flex" gap="1px">
          <Box w="14px" h="10px" bg="gray.50" />
          <Box w="14px" h="10px" bg="yellow.100" />
          <Box w="14px" h="10px" bg="orange.200" />
          <Box w="14px" h="10px" bg="orange.400" />
          <Box w="14px" h="10px" bg="red.400" />
          <Box w="14px" h="10px" bg="red.500" />
        </Box>
        <Text fontSize="xs" color="gray.500">
          Alto (pico: {max})
        </Text>
      </Box>
    </Stack>
  );
}
