"use client";

import { useEffect, useState } from "react";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import {
  Box,
  Heading,
  HStack,
  Text,
  Stack,
  Spinner,
  Badge,
  Button,
} from "@chakra-ui/react";
import "leaflet/dist/leaflet.css";
import type { AreaFm } from "@/types/geo";
import type { FmAllocation } from "@/lib/ai/prompts/fm-allocation";
import { AreasFmLayer } from "../map/layers/AreasFmLayer";
import { FmAllocationLayer } from "../map/layers/FmAllocationLayer";
import { FmAllocationTable } from "../panels/FmAllocationTable";
import { TOUCH_TARGET, VIEW_HEIGHT } from "@/lib/responsive";

const RIO_CENTER: [number, number] = [-22.9068, -43.1729];
const DEFAULT_ZOOM = 11;

export function CoberturaFmView() {
  const [allocation, setAllocation] = useState<FmAllocation[] | null>(null);
  const [areas, setAreas] = useState<AreaFm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/geo/areas-fm")
      .then((r) => r.json())
      .then(setAreas)
      .catch(console.error);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest-fm", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro desconhecido");
      }
      const data = await res.json();
      setAllocation(data.allocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar sugestão");
    } finally {
      setLoading(false);
    }
  };

  const totalAgentes = allocation
    ? allocation.reduce((sum, a) => sum + a.agentes, 0)
    : 0;

  return (
    <Box
      h={{ base: "auto", md: VIEW_HEIGHT }}
      minH={{ base: VIEW_HEIGHT, md: "auto" }}
      display="flex"
      flexDirection="column"
    >
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
              👮 Cobertura da Força Municipal
            </Heading>
            <Text fontSize="sm" color="gray.600" display={{ base: "none", md: "block" }}>
              Distribuição sugerida de 600 agentes pelas 22 áreas, com modelo de
              emprego e turnos prioritários
            </Text>
          </Stack>

          <HStack gap={{ base: 2, md: 4 }} wrap="wrap" w={{ base: "100%", md: "auto" }}>
            {allocation && (
              <>
                <Badge colorPalette="green" size="lg" p={2}>
                  {totalAgentes} agentes
                </Badge>
                <Badge size="lg" p={2}>
                  {allocation.length} áreas
                </Badge>
              </>
            )}
            <Button
              colorPalette="blue"
              w={{ base: "100%", md: "auto" }}
              minH={{ base: TOUCH_TARGET, md: "auto" }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <Spinner size="xs" mr={2} /> : null}
              {allocation ? "Regenerar Sugestão" : "Gerar Sugestão"}
            </Button>
          </HStack>
        </HStack>
      </Box>

      {error && (
        <Box bg="red.50" px={{ base: 4, md: 6 }} py={3} borderBottom="1px solid" borderColor="red.200">
          <Text fontSize="sm" color="red.700">
            {error}
          </Text>
        </Box>
      )}

      <Box
        flex={1}
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        overflow={{ base: "visible", md: "hidden" }}
        minH={0}
      >
        {!allocation && !loading && (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={6}
          >
            <Stack gap={3} maxW="480px" textAlign="center">
              <Text fontSize="lg" color="gray.600">
                Nenhuma sugestão gerada ainda
              </Text>
              <Text fontSize="sm" color="gray.500">
                Clique em <strong>Gerar Sugestão</strong> para que a IA analise
                dados criminais, fatores urbanos e risco para distribuir os
                agentes da FM nas 22 áreas.
              </Text>
            </Stack>
          </Box>
        )}

        {loading && !allocation && (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack align="center" gap={3}>
              <Spinner size="lg" color="blue.500" />
              <Text fontSize="sm" color="gray.500">
                Analisando dados e gerando distribuição...
              </Text>
            </Stack>
          </Box>
        )}

        {allocation && (
          <>
            {/* Celular: mapa em cima (order 1) e a lista rola embaixo (order 2) */}
            <Box
              w={{ base: "100%", md: "55%" }}
              order={{ base: 2, md: 1 }}
              flex={{ base: "none", md: "none" }}
              minH={0}
              bg="gray.50"
              borderRight={{ base: "none", md: "1px solid" }}
              borderTop={{ base: "1px solid", md: "none" }}
              borderColor="gray.200"
              overflowY={{ base: "visible", md: "auto" }}
              p={{ base: 3, md: 4 }}
            >
              <FmAllocationTable allocation={allocation} />
            </Box>
            <Box
              flex={{ base: "none", md: 1 }}
              h={{ base: "32dvh", md: "auto" }}
              order={{ base: 1, md: 2 }}
              position="relative"
            >
              <LeafletMap
                center={RIO_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AreasFmLayer areas={areas} onAreaClick={() => {}} />
                <FmAllocationLayer allocation={allocation} areas={areas} />
              </LeafletMap>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
