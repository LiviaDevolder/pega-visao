"use client";

import { useState } from "react";
import { Box, Stack, Text, Input, HStack, IconButton } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";

export interface LocalMapFilters {
  dia_semana?: string;
  hora_inicio?: number;
  hora_fim?: number;
}

interface MapFiltersPanelProps {
  filters: LocalMapFilters;
  onFilterChange: (filters: LocalMapFilters) => void;
}

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export function MapFiltersPanel({
  filters,
  onFilterChange,
}: MapFiltersPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={collapsed ? 2 : 4}
      shadow="lg"
      minW={collapsed ? "auto" : "220px"}
      maxH="80vh"
      overflowY="auto"
    >
      <HStack justify="space-between" mb={collapsed ? 0 : 3}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          {collapsed ? "⏱" : "Filtros Temporais"}
        </Text>
        <IconButton
          aria-label={collapsed ? "Expandir" : "Recolher"}
          size="2xs"
          variant="ghost"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "›" : "‹"}
        </IconButton>
      </HStack>

      {!collapsed && (
        <Stack gap={3}>
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
              Faixa Horária
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
                placeholder="Até"
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
      )}
    </Box>
  );
}
