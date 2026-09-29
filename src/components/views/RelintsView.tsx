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
  Input,
  Table,
} from "@chakra-ui/react";
import type { AreaFm } from "@/types/geo";
import { ReportButton } from "@/components/panels/ReportButton";
import { TOUCH_TARGET, VIEW_HEIGHT } from "@/lib/responsive";

// Prioridade da área pelo volume de ocorrências (tabela no desktop, cartões no celular).
function classifyPriority(ocorrencias: number) {
  if (ocorrencias > 3000) return { priority: "alta", color: "red" };
  if (ocorrencias > 1000) return { priority: "média", color: "orange" };
  return { priority: "baixa", color: "green" };
}

export function RelintsView() {
  const [areas, setAreas] = useState<AreaFm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/geo/areas-fm")
      .then((r) => r.json())
      .then((data: AreaFm[]) => {
        const sorted = [...data].sort(
          (a, b) => (b.total_ocorrencias || 0) - (a.total_ocorrencias || 0)
        );
        setAreas(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? areas.filter((a) =>
            a.nome_area_fm.toLowerCase().includes(search.toLowerCase())
          )
        : areas,
    [areas, search]
  );

  const totalOcorrencias = areas.reduce(
    (sum, a) => sum + (a.total_ocorrencias || 0),
    0
  );

  return (
    <Box minH={VIEW_HEIGHT} display="flex" flexDirection="column">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={{ base: 4, md: 6 }}
        py={4}
      >
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <Stack gap={1}>
            <Heading size="md" color="#0A2E5C">
              📄 RELINTs — Relatórios de Inteligência
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Gere o relatório executivo de cada área no formato padronizado do
              CompStat (.docx)
            </Text>
          </Stack>

          <HStack gap={{ base: 3, md: 4 }} wrap="wrap" w={{ base: "100%", md: "auto" }}>
            <Stack gap={0} align="end">
              <Text fontSize="xs" color="gray.500">
                Total no recorte
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="#0A2E5C">
                {totalOcorrencias.toLocaleString("pt-BR")} ocorrências
              </Text>
            </Stack>
            <Box minW={{ base: 0, md: "240px" }} flex={{ base: 1, md: "none" }}>
              <Input
                size={{ base: "lg", md: "sm" }}
                placeholder="Buscar área..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
          </HStack>
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" bg="gray.50" p={{ base: 3, md: 6 }}>
        <Box maxW="1100px" mx="auto">
          {loading ? (
            <Box textAlign="center" py={12}>
              <Spinner size="lg" />
              <Text fontSize="sm" color="gray.500" mt={3}>
                Carregando áreas FM...
              </Text>
            </Box>
          ) : (
            <>
            <Box
              display={{ base: "none", md: "block" }}
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              overflowX="auto"
            >
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader>Área FM</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">
                      Ocorrências
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">
                      Fatores
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">
                      Prioridade
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">
                      Ação
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered.map((area) => {
                    const ocor = area.total_ocorrencias || 0;
                    const { priority, color } = classifyPriority(ocor);
                    return (
                      <Table.Row key={area.id}>
                        <Table.Cell>
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            {area.nome_area_fm}
                          </Text>
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <Text fontSize="sm" fontWeight="bold">
                            {ocor.toLocaleString("pt-BR")}
                          </Text>
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <Text fontSize="sm" color="gray.600">
                            {area.total_fatores || 0}
                          </Text>
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Badge colorPalette={color} size="sm">
                            {priority}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <ReportButton
                            areaFmId={area.id}
                            areaName={area.nome_area_fm}
                          />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Celular: um cartão por área, com o botão de gerar em largura total */}
            <Stack gap={3} display={{ base: "flex", md: "none" }}>
              {filtered.map((area) => {
                const ocor = area.total_ocorrencias || 0;
                const { priority, color } = classifyPriority(ocor);
                return (
                  <Box
                    key={area.id}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={4}
                  >
                    <Stack gap={3}>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">
                        {area.nome_area_fm}
                      </Text>
                      <HStack gap={4} wrap="wrap">
                        <Stack gap={0}>
                          <Text fontSize="2xs" color="gray.500">
                            Ocorrências
                          </Text>
                          <Text fontSize="md" fontWeight="bold">
                            {ocor.toLocaleString("pt-BR")}
                          </Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text fontSize="2xs" color="gray.500">
                            Fatores
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            {area.total_fatores || 0}
                          </Text>
                        </Stack>
                        <Badge colorPalette={color} size="sm" ml="auto">
                          {priority}
                        </Badge>
                      </HStack>
                      <ReportButton
                        areaFmId={area.id}
                        areaName={area.nome_area_fm}
                        fullWidth
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
            </>
          )}

          {!loading && filtered.length === 0 && (
            <Box textAlign="center" py={12}>
              <Text fontSize="sm" color="gray.500">
                Nenhuma área encontrada com &quot;{search}&quot;.
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
