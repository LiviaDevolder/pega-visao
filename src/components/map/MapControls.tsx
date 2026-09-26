"use client";

import { Box, Stack, Text, Spinner, HStack, IconButton } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";
import { TOUCH_TARGET, Z_INDEX } from "@/lib/responsive";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export type MapLayerKey =
  | "heatmap"
  | "fatoresUrbanos"
  | "areasFm"
  | "cameras";

export type MapLayerVisibility = Record<MapLayerKey, boolean>;

interface MapControlsProps {
  layers: MapLayerVisibility;
  onToggle: (layer: MapLayerKey) => void;
  loading: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const LAYER_LABELS: Record<MapLayerKey, string> = {
  heatmap: "Mancha Criminal",
  fatoresUrbanos: "Fatores Urbanos",
  areasFm: "Áreas FM",
  cameras: "Câmeras",
};

const LAYER_COLORS: Record<MapLayerKey, string> = {
  heatmap: "red",
  fatoresUrbanos: "green",
  areasFm: "blue",
  cameras: "cyan",
};

export function MapControls({
  layers,
  onToggle,
  loading,
  collapsed,
  onCollapsedChange,
}: MapControlsProps) {
  const isMobile = useIsMobile();
  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      zIndex={Z_INDEX.mapOverlay}
      bg="white"
      borderRadius="lg"
      p={collapsed ? 2 : 4}
      shadow="lg"
      minW={collapsed ? "auto" : "200px"}
      maxW="calc(100% - 32px)"
      cursor={collapsed ? "pointer" : undefined}
      minH={collapsed ? { base: TOUCH_TARGET, md: "auto" } : undefined}
      display={collapsed ? "flex" : undefined}
      alignItems={collapsed ? "center" : undefined}
      onClick={collapsed ? () => onCollapsedChange(false) : undefined}
      {...(collapsed && isMobile
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": "Expandir camadas",
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") onCollapsedChange(false);
            },
          }
        : {})}
    >
      <HStack justify="space-between" mb={collapsed ? 0 : 3} gap={2}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          {collapsed ? "☰" : "Camadas"}
          {collapsed && (
            <Box as="span" display={{ base: "inline", md: "none" }} ml={2}>
              Camadas
            </Box>
          )}{" "}
          {loading && !collapsed && <Spinner size="xs" ml={2} />}
        </Text>
        <IconButton
          aria-label={collapsed ? "Expandir camadas" : "Recolher camadas"}
          size={{ base: "md", md: "2xs" }}
          minW={{ base: TOUCH_TARGET, md: "auto" }}
          display={collapsed ? { base: "none", md: "inline-flex" } : undefined}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onCollapsedChange(!collapsed);
          }}
        >
          {collapsed ? "‹" : "›"}
        </IconButton>
      </HStack>

      {!collapsed && (
        <Stack gap={3}>
          {(Object.keys(LAYER_LABELS) as MapLayerKey[]).map((layer) => (
            <Box
              key={layer}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="sm" color="gray.600">
                {LAYER_LABELS[layer]}
              </Text>
              <Switch.Root
                checked={layers[layer]}
                onCheckedChange={() => onToggle(layer)}
                colorPalette={LAYER_COLORS[layer]}
                size="sm"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
