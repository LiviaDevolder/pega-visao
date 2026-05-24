"use client";

import { Box, Stack, Text, Spinner, Button } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";
import type { LayerVisibility } from "@/types/geo";

interface MapControlsProps {
  layers: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
  loading: boolean;
  onOpenFmSuggestion?: () => void;
  onOpenSocialFeed?: () => void;
}

const LAYER_LABELS: Record<keyof LayerVisibility, string> = {
  heatmap: "Mancha Criminal",
  fatoresUrbanos: "Fatores Urbanos",
  areasFm: "Areas FM",
  cameras: "Cameras",
  riskZones: "Coincidencias (BINGO)",
};

const LAYER_COLORS: Record<keyof LayerVisibility, string> = {
  heatmap: "red",
  fatoresUrbanos: "green",
  areasFm: "blue",
  cameras: "cyan",
  riskZones: "orange",
};

export function MapControls({ layers, onToggle, loading, onOpenFmSuggestion, onOpenSocialFeed }: MapControlsProps) {
  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      p={4}
      shadow="lg"
      minW="200px"
    >
      <Stack gap={3}>
        <Text fontWeight="bold" fontSize="sm" color="gray.700">
          Camadas {loading && <Spinner size="xs" ml={2} />}
        </Text>

        {onOpenFmSuggestion && (
          <Button
            size="xs"
            colorPalette="blue"
            variant="outline"
            onClick={onOpenFmSuggestion}
          >
            Sugestao FM
          </Button>
        )}

        {onOpenSocialFeed && (
          <Button
            size="xs"
            colorPalette="purple"
            variant="outline"
            onClick={onOpenSocialFeed}
          >
            Feed Social
          </Button>
        )}

        {(Object.keys(LAYER_LABELS) as Array<keyof LayerVisibility>).map(
          (layer) => (
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
          )
        )}
      </Stack>
    </Box>
  );
}
