"use client";

import { Box, Text } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";

interface RiskRadiusControlProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { value: 100, label: "100m" },
  { value: 200, label: "200m" },
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
];

export function RiskRadiusControl({
  radius,
  onRadiusChange,
}: RiskRadiusControlProps) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={1}>
        Raio de Sobreposicao
      </Text>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Box>
  );
}
