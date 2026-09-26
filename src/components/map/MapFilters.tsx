"use client";

import { Box, Stack, Text, Input, HStack, IconButton } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";
import { TOUCH_TARGET, Z_INDEX } from "@/lib/responsive";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export interface LocalMapFilters {
  dia_semana?: string;
  hora_inicio?: number;
  hora_fim?: number;
}

interface MapFiltersPanelProps {
  filters: LocalMapFilters;
  onFilterChange: (filters: LocalMapFilters) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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
  collapsed,
  onCollapsedChange,
}: MapFiltersPanelProps) {
  const isMobile = useIsMobile();
  return (
    <Box
      position="absolute"
      top={4}
      left={{ base: "56px", md: 4 }}
      zIndex={Z_INDEX.mapOverlay}
      bg="white"
      borderRadius="lg"
      p={collapsed ? 2 : 4}
      shadow="lg"
      minW={collapsed ? "auto" : "220px"}
      maxW={{ base: "calc(100% - 72px)", md: "none" }}
      maxH="80dvh"
      overflowY="auto"
      cursor={collapsed ? "pointer" : undefined}
      minH={collapsed ? { base: TOUCH_TARGET, md: "auto" } : undefined}
      display={collapsed ? "flex" : undefined}
      alignItems={collapsed ? "center" : undefined}
      onClick={collapsed ? () => onCollapsedChange(false) : undefined}
      {...(collapsed && isMobile
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": "Expandir filtros temporais",
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") onCollapsedChange(false);
            },
          }
        : {})}
    >
      <HStack justify="space-between" mb={collapsed ? 0 : 3} gap={2}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          {collapsed ? "⏱" : "Filtros Temporais"}
          {collapsed && (
            <Box as="span" display={{ base: "inline", md: "none" }} ml={2}>
              Horário
            </Box>
          )}
        </Text>
        <IconButton
          aria-label={collapsed ? "Expandir filtros temporais" : "Recolher filtros temporais"}
          size={{ base: "md", md: "2xs" }}
          minW={{ base: TOUCH_TARGET, md: "auto" }}
          display={collapsed ? { base: "none", md: "inline-flex" } : undefined}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onCollapsedChange(!collapsed);
          }}
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
            <NativeSelect.Root size={{ base: "lg", md: "sm" }}>
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
                size={{ base: "lg", md: "sm" }}
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
                size={{ base: "lg", md: "sm" }}
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
