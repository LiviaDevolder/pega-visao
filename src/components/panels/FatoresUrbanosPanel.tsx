"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  IconButton,
  Tabs,
} from "@chakra-ui/react";
import { FatorCard } from "./FatorCard";
import { ActionPlanSummary } from "./ActionPlanSummary";
import type { FatoresPorOrgao } from "@/lib/fatores-queries";

interface FatoresUrbanosPanelProps {
  areaFmId: number;
  areaName: string;
  onClose: () => void;
}

export function FatoresUrbanosPanel({
  areaFmId,
  areaName,
  onClose,
}: FatoresUrbanosPanelProps) {
  const [data, setData] = useState<FatoresPorOrgao[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fatores-urbanos?area_fm_id=${areaFmId}`)
      .then((r) => r.json())
      .then((result) => setData(result.fatores_por_orgao || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [areaFmId]);

  return (
    <Box
      position="absolute"
      right={4}
      top={4}
      bottom={4}
      zIndex={1001}
      bg="white"
      borderRadius="lg"
      p={5}
      shadow="xl"
      w="420px"
      overflowY="auto"
    >
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Stack gap={1}>
          <Badge colorPalette="orange" w="fit-content">
            Fatores Urbanos
          </Badge>
          <Heading size="md">{areaName}</Heading>
        </Stack>
        <IconButton aria-label="Fechar" size="sm" variant="ghost" onClick={onClose}>
          X
        </IconButton>
      </Box>

      {loading ? (
        <Box mt={8} textAlign="center">
          <Spinner size="lg" />
        </Box>
      ) : !data || data.length === 0 ? (
        <Box mt={6} p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600">
            Nenhum fator urbano encontrado nesta area FM.
          </Text>
        </Box>
      ) : showPlan ? (
        <Box mt={4}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Text fontWeight="bold" fontSize="sm">
              Plano de Acao Consolidado
            </Text>
            <Badge
              cursor="pointer"
              onClick={() => setShowPlan(false)}
              colorPalette="gray"
            >
              Voltar
            </Badge>
          </Box>
          <ActionPlanSummary fatoresPorOrgao={data} />
        </Box>
      ) : (
        <Stack gap={4} mt={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Badge colorPalette="gray">
              {data.reduce((sum, g) => sum + g.total, 0)} fatores
            </Badge>
            <Badge
              cursor="pointer"
              onClick={() => setShowPlan(true)}
              colorPalette="teal"
            >
              Ver Plano de Acao
            </Badge>
          </Box>

          <Tabs.Root defaultValue={data[0]?.orgao} variant="outline" size="sm">
            <Tabs.List flexWrap="wrap">
              {data.map((group) => (
                <Tabs.Trigger key={group.orgao} value={group.orgao}>
                  {group.orgao} ({group.total})
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {data.map((group) => (
              <Tabs.Content key={group.orgao} value={group.orgao}>
                <Stack gap={2} mt={2}>
                  {group.fatores.map((fator) => (
                    <FatorCard key={fator.id} fator={fator} />
                  ))}
                </Stack>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Stack>
      )}
    </Box>
  );
}
