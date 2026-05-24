"use client";

import { Box, Text, Badge } from "@chakra-ui/react";
import { getActionSuggestion } from "@/lib/action-plan-builder";
import type { FatorComAcao } from "@/lib/fatores-queries";

interface FatorCardProps {
  fator: FatorComAcao;
}

export function FatorCard({ fator }: FatorCardProps) {
  const prioridadeColor =
    fator.risk_level === "alto" ? "red" : "orange";

  return (
    <Box
      p={3}
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.100"
      _hover={{ borderColor: "blue.200" }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Text fontSize="sm" fontWeight="medium" color="gray.700">
          {fator.tipo_ocorrencia_descricao}
        </Text>
        <Badge colorPalette={prioridadeColor} size="sm">
          {fator.risk_level === "alto" ? "Alta" : "Media"}
        </Badge>
      </Box>

      {fator.logradouro && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {fator.logradouro}
          {fator.bairro_nome ? ` - ${fator.bairro_nome}` : ""}
        </Text>
      )}

      <Box mt={2} p={2} bg="blue.50" borderRadius="sm">
        <Text fontSize="xs" fontWeight="medium" color="blue.700">
          Acao sugerida:
        </Text>
        <Text fontSize="xs" color="blue.600">
          {getActionSuggestion(fator.tipo_ocorrencia_descricao)}
        </Text>
      </Box>

      {fator.observacao && (
        <Text fontSize="xs" color="gray.400" mt={1} fontStyle="italic">
          {fator.observacao}
        </Text>
      )}
    </Box>
  );
}
