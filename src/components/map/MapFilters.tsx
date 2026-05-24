"use client";

import { useState, useEffect } from "react";
import { Box, Stack, Text, Input } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";
import type { MapFilters } from "@/types/geo";

interface MapFiltersPanelProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
}

const DIAS_SEMANA = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
];

export function MapFiltersPanel({
  filters,
  onFilterChange,
}: MapFiltersPanelProps) {
  const [delitos, setDelitos] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/geo/ocorrencias/filtros")
      .then((r) => r.json())
      .then((data) => {
        if (data.delitos) setDelitos(data.delitos);
        if (data.anos) setAnos(data.anos);
      })
      .catch(() => {});
  }, []);

  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={4}
      shadow="lg"
      minW="220px"
      maxH="90vh"
      overflowY="auto"
    >
      <Stack gap={3}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          Filtros
        </Text>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Ano
          </Text>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.ano || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  ano: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            >
              <option value="">Todos</option>
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Mes
          </Text>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.mes || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  mes: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            >
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString("pt-BR", { month: "long" })}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Tipo de Delito
          </Text>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.delito || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  delito: e.target.value || undefined,
                })
              }
            >
              <option value="">Todos</option>
              {delitos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Dia da Semana
          </Text>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={filters.dia_semana || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  dia_semana: e.target.value || undefined,
                })
              }
            >
              <option value="">Todos</option>
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Faixa Horaria
          </Text>
          <Box display="flex" gap={2} alignItems="center">
            <Input
              size="sm"
              type="number"
              min={0}
              max={23}
              placeholder="De"
              value={filters.hora_inicio ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  hora_inicio: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
            <Text fontSize="xs">-</Text>
            <Input
              size="sm"
              type="number"
              min={0}
              max={23}
              placeholder="Ate"
              value={filters.hora_fim ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  hora_fim: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
