"use client";

import { useState } from "react";
import { Box, Stack, Text, Spinner, HStack, IconButton } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";

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

export function MapControls({ layers, onToggle, loading }: MapControlsProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={collapsed ? 2 : 4}
      shadow="lg"
      minW={collapsed ? "auto" : "200px"}
    >
      <HStack justify="space-between" mb={collapsed ? 0 : 3}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          {collapsed ? "☰" : "Camadas"}{" "}
          {loading && !collapsed && <Spinner size="xs" ml={2} />}
        </Text>
        <IconButton
          aria-label={collapsed ? "Expandir" : "Recolher"}
          size="2xs"
          variant="ghost"
          onClick={() => setCollapsed((v) => !v)}
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
