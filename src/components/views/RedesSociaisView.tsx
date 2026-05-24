"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Text,
  Stack,
  Badge,
  NativeSelect,
  Input,
  SimpleGrid,
  Avatar,
  Spinner,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import type { SocialMention } from "@/lib/social/social-mentions-repository";
import { AREAS_FM_KEYWORDS } from "@/lib/social/keywords-areas-fm";

const TIPOS_CRIME = ["roubo", "furto", "arrastao", "tiroteio", "outros"];

function relevanciaColor(r: number | null): string {
  if (!r) return "gray";
  if (r >= 4) return "red";
  if (r === 3) return "orange";
  return "gray";
}

function sentimentoColor(s: string | null): string {
  if (s === "negativo") return "red";
  if (s === "positivo") return "green";
  return "gray";
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RedesSociaisView() {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [relevanciaMinima, setRelevanciaMinima] = useState<string>("");
  const [search, setSearch] = useState("");

  const fetchMentions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (areaFilter) params.set("area_fm", areaFilter);
    if (tipoFilter) params.set("tipo_crime", tipoFilter);
    if (relevanciaMinima) params.set("relevancia_minima", relevanciaMinima);
    const qs = params.toString();
    fetch(qs ? `/api/social?${qs}` : "/api/social")
      .then((r) => r.json())
      .then((data) => setMentions(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [areaFilter, tipoFilter, relevanciaMinima]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  const filtered = useMemo(() => {
    if (!search) return mentions;
    const q = search.toLowerCase();
    return mentions.filter(
      (m) =>
        m.texto.toLowerCase().includes(q) ||
        (m.autor || "").toLowerCase().includes(q) ||
        (m.area_fm || "").toLowerCase().includes(q)
    );
  }, [mentions, search]);

  const stats = useMemo(() => {
    const total = mentions.length;
    const altaRelev = mentions.filter((m) => (m.relevancia ?? 0) >= 4).length;
    const pendentes = mentions.filter(
      (m) => m.status === "pendente de classificacao"
    ).length;
    return { total, altaRelev, pendentes };
  }, [mentions]);

  return (
    <Box minH="calc(100vh - 56px)" display="flex" flexDirection="column">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={6}
        py={4}
      >
        <Stack gap={3}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <Stack gap={1}>
              <Heading size="md" color="#0A2E5C">
                📡 Inteligência de Redes Sociais
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Tweets monitorados nas 22 áreas, classificados por IA quanto a
                tipo, local e relevância
              </Text>
            </Stack>

            <HStack gap={6}>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Alta relevância
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  {stats.altaRelev}
                </Text>
              </Stack>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Pendentes
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="orange.600">
                  {stats.pendentes}
                </Text>
              </Stack>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Total
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="#0A2E5C">
                  {stats.total}
                </Text>
              </Stack>
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                onClick={fetchMentions}
                disabled={loading}
              >
                {loading ? <Spinner size="xs" /> : "Atualizar"}
              </Button>
            </HStack>
          </HStack>

          <HStack gap={3} wrap="wrap">
            <Input
              size="sm"
              placeholder="Buscar texto, autor ou local..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="320px"
            />
            <NativeSelect.Root size="sm" maxW="220px">
              <NativeSelect.Field
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="">Todas as áreas FM</option>
                {AREAS_FM_KEYWORDS.map((a) => (
                  <option key={a.nome_area_fm} value={a.nome_area_fm}>
                    {a.nome_area_fm}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root size="sm" maxW="160px">
              <NativeSelect.Field
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                {TIPOS_CRIME.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root size="sm" maxW="160px">
              <NativeSelect.Field
                value={relevanciaMinima}
                onChange={(e) => setRelevanciaMinima(e.target.value)}
              >
                <option value="">Relevância: todas</option>
                <option value="2">≥ 2</option>
                <option value="3">≥ 3</option>
                <option value="4">≥ 4 (alta)</option>
                <option value="5">= 5 (máxima)</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Text fontSize="xs" color="gray.500" ml="auto">
              {filtered.length} de {mentions.length} menções
            </Text>
          </HStack>
        </Stack>
      </Box>

      <Box flex={1} overflowY="auto" bg="gray.50" p={6}>
        {loading && mentions.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Spinner size="lg" />
            <Text fontSize="sm" color="gray.500" mt={3}>
              Carregando menções...
            </Text>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="sm" color="gray.500">
              Nenhuma menção encontrada com os filtros aplicados.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {filtered.map((m) => (
              <MentionCard key={m.id} mention={m} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

function MentionCard({ mention: m }: { mention: SocialMention }) {
  const isPendente = m.status === "pendente de classificacao";

  return (
    <Box
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
      _hover={{ borderColor: "gray.300", shadow: "sm" }}
    >
      <HStack gap={3}>
        <Avatar.Root size="sm">
          <Avatar.Fallback name={m.autor || "?"} />
        </Avatar.Root>
        <Stack gap={0} flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            @{m.autor || "—"}
          </Text>
          <Text fontSize="xs" color="gray.500" truncate>
            {formatTime(m.data_tweet)}
          </Text>
        </Stack>
        <Box
          fontSize="2xs"
          fontWeight="700"
          color="#1DA1F2"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          Twitter
        </Box>
      </HStack>

      <Text fontSize="sm" color="gray.700" lineHeight="1.5" lineClamp={5}>
        {m.texto}
      </Text>

      <HStack gap={2} wrap="wrap">
        {isPendente ? (
          <Badge colorPalette="orange" size="sm">
            Pendente de classificação
          </Badge>
        ) : (
          <>
            {m.area_fm && (
              <Badge colorPalette="blue" size="sm">
                📍 {m.area_fm}
              </Badge>
            )}
            {m.tipo_crime && (
              <Badge colorPalette="purple" size="sm">
                {m.tipo_crime}
              </Badge>
            )}
            {m.relevancia !== null && (
              <Badge
                colorPalette={relevanciaColor(m.relevancia)}
                variant="solid"
                size="sm"
              >
                Relevância {m.relevancia}/5
              </Badge>
            )}
            {m.sentimento && (
              <Badge colorPalette={sentimentoColor(m.sentimento)} size="sm">
                {m.sentimento}
              </Badge>
            )}
          </>
        )}
      </HStack>

      {m.url && (
        <HStack
          fontSize="xs"
          color="gray.500"
          pt={2}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <ChakraLink href={m.url} target="_blank" color="blue.500" fontSize="xs">
            Ver tweet original →
          </ChakraLink>
        </HStack>
      )}
    </Box>
  );
}
