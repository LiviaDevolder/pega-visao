"use client";

import { Box, Text, Stack, Badge } from "@chakra-ui/react";
import { getActionSuggestion } from "@/lib/action-plan-builder";
import type { FatoresPorOrgao } from "@/lib/fatores-queries";

interface ActionPlanSummaryProps {
  fatoresPorOrgao: FatoresPorOrgao[];
}

export function ActionPlanSummary({ fatoresPorOrgao }: ActionPlanSummaryProps) {
  return (
    <Stack gap={4}>
      {fatoresPorOrgao.map((group) => (
        <Box key={group.orgao}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Text fontWeight="bold" fontSize="sm" color="gray.700">
              {group.orgao}
            </Text>
            <Badge size="sm" colorPalette="gray">
              {group.total} acoes
            </Badge>
          </Box>

          <Stack gap={1} pl={3} borderLeft="2px solid" borderColor="blue.200">
            {group.fatores.map((fator, i) => (
              <Box key={i}>
                <Text fontSize="xs" color="gray.700">
                  <strong>{fator.logradouro || "Local nao informado"}</strong>
                  {" — "}
                  {fator.tipo_ocorrencia_descricao}
                </Text>
                <Text fontSize="xs" color="blue.600" pl={2}>
                  → {getActionSuggestion(fator.tipo_ocorrencia_descricao)}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
