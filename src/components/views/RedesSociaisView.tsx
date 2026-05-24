"use client";

import { useMemo, useState } from "react";
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
} from "@chakra-ui/react";
import {
  POSTS_MOCK,
  AREAS_MOCK,
  TIPOS_CRIME,
  type PostMock,
  type Plataforma,
  type Relevancia,
} from "@/lib/mock/redes-sociais";

const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
};

const PLATAFORMA_COLOR: Record<Plataforma, string> = {
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  facebook: "#1877F2",
};

const RELEVANCIA_COLOR: Record<Relevancia, string> = {
  alta: "red",
  media: "orange",
  baixa: "gray",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RedesSociaisView() {
  const [areaFilter, setAreaFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [relevanciaFilter, setRelevanciaFilter] = useState<Relevancia | "">("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return POSTS_MOCK.filter((p) => {
      if (areaFilter && p.area !== areaFilter) return false;
      if (tipoFilter && p.tipo !== tipoFilter) return false;
      if (relevanciaFilter && p.relevancia !== relevanciaFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.conteudo.toLowerCase().includes(q) &&
          !p.autor.toLowerCase().includes(q) &&
          !p.area.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [areaFilter, tipoFilter, relevanciaFilter, search]);

  const stats = useMemo(() => {
    const total = POSTS_MOCK.length;
    const alta = POSTS_MOCK.filter((p) => p.relevancia === "alta").length;
    const ultimas24h = POSTS_MOCK.filter((p) => {
      const ageHours =
        (Date.now() - new Date(p.timestamp).getTime()) / (1000 * 60 * 60);
      return ageHours < 24;
    }).length;
    return { total, alta, ultimas24h };
  }, []);

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
              <HStack gap={2}>
                <Heading size="md" color="#0A2E5C">
                  📡 Inteligência de Redes Sociais
                </Heading>
                <Badge colorPalette="yellow" size="sm">
                  DEMO
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Publicações sobre segurança nas 22 áreas, classificadas por IA
                quanto a tipo, local e relevância
              </Text>
            </Stack>

            <HStack gap={6}>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Posts (24h)
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="#0A2E5C">
                  {stats.ultimas24h}
                </Text>
              </Stack>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Alta relevância
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  {stats.alta}
                </Text>
              </Stack>
              <Stack gap={0} align="end">
                <Text fontSize="2xs" color="gray.500">
                  Total monitorado
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="#0A2E5C">
                  {stats.total}
                </Text>
              </Stack>
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
            <NativeSelect.Root size="sm" maxW="180px">
              <NativeSelect.Field
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="">Todas as áreas</option>
                {AREAS_MOCK.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root size="sm" maxW="180px">
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
            <HStack gap={1}>
              {(["alta", "media", "baixa"] as Relevancia[]).map((r) => (
                <Badge
                  key={r}
                  colorPalette={RELEVANCIA_COLOR[r]}
                  variant={relevanciaFilter === r ? "solid" : "outline"}
                  cursor="pointer"
                  onClick={() =>
                    setRelevanciaFilter(relevanciaFilter === r ? "" : r)
                  }
                  px={2}
                  py={1}
                >
                  {r}
                </Badge>
              ))}
            </HStack>
            <Text fontSize="xs" color="gray.500" ml="auto">
              {filtered.length} de {POSTS_MOCK.length} posts
            </Text>
          </HStack>
        </Stack>
      </Box>

      <Box flex={1} overflowY="auto" bg="gray.50" p={6}>
        {filtered.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="sm" color="gray.500">
              Nenhum post encontrado com os filtros aplicados.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

function PostCard({ post }: { post: PostMock }) {
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
          <Avatar.Fallback name={post.autor} />
        </Avatar.Root>
        <Stack gap={0} flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            {post.autor}
          </Text>
          <Text fontSize="xs" color="gray.500" truncate>
            {post.handle} · {formatTime(post.timestamp)}
          </Text>
        </Stack>
        <Box
          fontSize="2xs"
          fontWeight="700"
          color={PLATAFORMA_COLOR[post.plataforma]}
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          {PLATAFORMA_LABEL[post.plataforma]}
        </Box>
      </HStack>

      <Text fontSize="sm" color="gray.700" lineHeight="1.5">
        {post.conteudo}
      </Text>

      <HStack gap={2} wrap="wrap">
        <Badge colorPalette="blue" size="sm">
          📍 {post.area}
        </Badge>
        <Badge colorPalette="purple" size="sm">
          {post.tipo}
        </Badge>
        <Badge
          colorPalette={RELEVANCIA_COLOR[post.relevancia]}
          variant="solid"
          size="sm"
        >
          Relevância {post.relevancia}
        </Badge>
      </HStack>

      <HStack gap={4} fontSize="xs" color="gray.500" pt={2} borderTop="1px solid" borderColor="gray.100">
        <Text>♥ {post.engajamento.curtidas.toLocaleString("pt-BR")}</Text>
        <Text>💬 {post.engajamento.comentarios.toLocaleString("pt-BR")}</Text>
        <Text>↗ {post.engajamento.compartilhamentos.toLocaleString("pt-BR")}</Text>
      </HStack>
    </Box>
  );
}
