"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Text,
  Stack,
  Spinner,
  Badge,
  NativeSelect,
  Button,
} from "@chakra-ui/react";
import type { FatorUrbano } from "@/types/geo";
import { getActionSuggestion } from "@/lib/action-plan-builder";

interface OrgaoGroup {
  orgao: string;
  fatores: FatorUrbano[];
}

export function PlanoAcaoView() {
  const [fatores, setFatores] = useState<FatorUrbano[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgaoFilter, setOrgaoFilter] = useState<string>("");
  const [expandedOrgaos, setExpandedOrgaos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/geo/fatores-urbanos")
      .then((r) => r.json())
      .then((data: FatorUrbano[]) => {
        setFatores(data);
        const top3 = new Set(
          groupByOrgao(data)
            .slice(0, 3)
            .map((g) => g.orgao)
        );
        setExpandedOrgaos(top3);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo<OrgaoGroup[]>(() => groupByOrgao(fatores), [fatores]);

  const orgaos = useMemo(() => groups.map((g) => g.orgao), [groups]);

  const filtered = useMemo(
    () => (orgaoFilter ? groups.filter((g) => g.orgao === orgaoFilter) : groups),
    [groups, orgaoFilter]
  );

  const totalAcoes = filtered.reduce((sum, g) => sum + g.fatores.length, 0);

  const toggleOrgao = (orgao: string) => {
    setExpandedOrgaos((prev) => {
      const next = new Set(prev);
      if (next.has(orgao)) next.delete(orgao);
      else next.add(orgao);
      return next;
    });
  };

  const expandAll = () => setExpandedOrgaos(new Set(filtered.map((g) => g.orgao)));
  const collapseAll = () => setExpandedOrgaos(new Set());

  return (
    <Box minH="calc(100vh - 56px)" display="flex" flexDirection="column">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={6}
        py={4}
      >
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <Stack gap={1}>
            <Heading size="md" color="#0A2E5C">
              🏗️ Plano de Ação por Órgão
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Fatores urbanos agrupados por responsável e prontos para
              encaminhamento intersetorial
            </Text>
          </Stack>

          <HStack gap={4}>
            <Badge colorPalette="blue" size="lg" p={2}>
              {totalAcoes} ações
            </Badge>
            <Box minW="220px">
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  value={orgaoFilter}
                  onChange={(e) => setOrgaoFilter(e.target.value)}
                >
                  <option value="">Todos os órgãos</option>
                  {orgaos.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>
            <Button size="xs" variant="outline" onClick={expandAll}>
              Expandir tudo
            </Button>
            <Button size="xs" variant="outline" onClick={collapseAll}>
              Recolher tudo
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" bg="gray.50" p={6}>
        {loading ? (
          <Box textAlign="center" py={12}>
            <Spinner size="lg" />
            <Text fontSize="sm" color="gray.500" mt={3}>
              Carregando fatores urbanos...
            </Text>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="sm" color="gray.500">
              Nenhum fator urbano encontrado.
            </Text>
          </Box>
        ) : (
          <Stack gap={3} maxW="1100px" mx="auto">
            {filtered.map((group) => {
              const expanded = expandedOrgaos.has(group.orgao);
              return (
                <Box
                  key={group.orgao}
                  bg="white"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                  overflow="hidden"
                >
                  <HStack
                    px={4}
                    py={3}
                    bg="gray.50"
                    borderBottom={expanded ? "1px solid" : "none"}
                    borderColor="gray.200"
                    cursor="pointer"
                    onClick={() => toggleOrgao(group.orgao)}
                    _hover={{ bg: "gray.100" }}
                  >
                    <Text fontSize="md" fontWeight="700" color="#0A2E5C" flex={1}>
                      {expanded ? "▼" : "▶"} {group.orgao}
                    </Text>
                    <Badge colorPalette="blue" variant="subtle">
                      {group.fatores.length} ações
                    </Badge>
                  </HStack>

                  {expanded && (
                    <Stack gap={0} divideY="1px" divideColor="gray.100">
                      {group.fatores.map((f) => (
                        <Box key={f.id} px={4} py={3}>
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            {f.logradouro || "Local não informado"}
                          </Text>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            {f.tipo_ocorrencia_descricao}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="blue.600"
                            mt={2}
                            pl={3}
                            borderLeft="2px solid"
                            borderColor="blue.200"
                          >
                            → {getActionSuggestion(f.tipo_ocorrencia_descricao)}
                          </Text>
                          {f.observacao && (
                            <Text fontSize="2xs" color="gray.500" mt={1}>
                              Obs: {f.observacao}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function groupByOrgao(fatores: FatorUrbano[]): OrgaoGroup[] {
  const map = new Map<string, FatorUrbano[]>();
  for (const f of fatores) {
    const orgao = f.orgao_responsavel || "Não definido";
    const arr = map.get(orgao) || [];
    arr.push(f);
    map.set(orgao, arr);
  }
  return Array.from(map.entries())
    .map(([orgao, fatores]) => ({ orgao, fatores }))
    .sort((a, b) => b.fatores.length - a.fatores.length);
}
