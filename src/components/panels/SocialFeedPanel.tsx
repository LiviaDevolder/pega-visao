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
  Button,
  Link,
} from "@chakra-ui/react";
import type { SocialMention } from "@/lib/social/social-mentions-repository";
import { AREAS_FM_KEYWORDS } from "@/lib/social/keywords-areas-fm";

interface SocialFeedPanelProps {
  onClose: () => void;
}

const TIPO_CRIME_OPTIONS = ["roubo", "furto", "arrastao", "tiroteio", "outros"];

function relevanciaColor(r: number | null): string {
  if (!r) return "gray";
  if (r >= 4) return "red";
  if (r === 3) return "yellow";
  return "gray";
}

export function SocialFeedPanel({ onClose }: SocialFeedPanelProps) {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);

  const [areaFm, setAreaFm] = useState("");
  const [tipoCrime, setTipoCrime] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [relevanciaMinimaStr, setRelevanciaMinimaStr] = useState("");

  function buildUrl() {
    const params = new URLSearchParams();
    if (areaFm) params.set("area_fm", areaFm);
    if (tipoCrime) params.set("tipo_crime", tipoCrime);
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    if (relevanciaMinimaStr) params.set("relevancia_minima", relevanciaMinimaStr);
    const qs = params.toString();
    return qs ? `/api/social?${qs}` : "/api/social";
  }

  function fetchMentions() {
    setLoading(true);
    fetch(buildUrl())
      .then((r) => r.json())
      .then((data) => setMentions(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMentions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={4}>
        <Stack gap={1}>
          <Badge colorPalette="purple" w="fit-content">
            Inteligência Social
          </Badge>
          <Heading size="md">Feed Social</Heading>
        </Stack>
        <IconButton aria-label="Fechar" size="sm" variant="ghost" onClick={onClose}>
          X
        </IconButton>
      </Box>

      {/* Filtros */}
      <Stack gap={2} mb={4} p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="xs" fontWeight="bold" color="gray.600">
          Filtros
        </Text>

        <select
          value={areaFm}
          onChange={(e) => setAreaFm(e.target.value)}
          style={{ fontSize: 12, padding: "4px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}
        >
          <option value="">Todas as áreas FM</option>
          {AREAS_FM_KEYWORDS.map((a) => (
            <option key={a.nome_area_fm} value={a.nome_area_fm}>
              {a.nome_area_fm}
            </option>
          ))}
        </select>

        <select
          value={tipoCrime}
          onChange={(e) => setTipoCrime(e.target.value)}
          style={{ fontSize: 12, padding: "4px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}
        >
          <option value="">Todos os tipos</option>
          {TIPO_CRIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <Box display="flex" gap={2}>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            placeholder="Data início"
            style={{ fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "1px solid #e2e8f0", flex: 1 }}
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            placeholder="Data fim"
            style={{ fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "1px solid #e2e8f0", flex: 1 }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="xs" color="gray.600" whiteSpace="nowrap">
            Relevância mín:
          </Text>
          <input
            type="range"
            min={1}
            max={5}
            value={relevanciaMinimaStr || 1}
            onChange={(e) => setRelevanciaMinimaStr(e.target.value === "1" ? "" : e.target.value)}
            style={{ flex: 1 }}
          />
          <Text fontSize="xs" color="gray.600" w="16px">
            {relevanciaMinimaStr || "1"}
          </Text>
        </Box>

        <Button size="xs" colorPalette="purple" variant="outline" onClick={fetchMentions}>
          Atualizar
        </Button>
      </Stack>

      {/* Conteúdo */}
      {loading ? (
        <Box mt={8} textAlign="center">
          <Spinner size="lg" />
        </Box>
      ) : mentions.length === 0 ? (
        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.500">
            Nenhuma menção encontrada com os filtros aplicados.
          </Text>
        </Box>
      ) : (
        <Stack gap={3}>
          <Text fontSize="xs" color="gray.500">
            {mentions.length} menção(ões)
          </Text>

          {mentions.map((m) => (
            <Box
              key={m.id}
              p={3}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
              _hover={{ bg: "gray.50" }}
            >
              <Text fontSize="sm" mb={2} lineClamp={4}>
                {m.texto}
              </Text>

              <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {m.status === "pendente de classificacao" ? (
                  <Badge colorPalette="orange" size="sm">
                    Pendente
                  </Badge>
                ) : (
                  <>
                    {m.area_fm && (
                      <Badge colorPalette="blue" size="sm">
                        {m.area_fm}
                      </Badge>
                    )}
                    {m.tipo_crime && (
                      <Badge colorPalette="red" size="sm">
                        {m.tipo_crime}
                      </Badge>
                    )}
                    {m.relevancia && (
                      <Badge colorPalette={relevanciaColor(m.relevancia)} size="sm">
                        Relevância {m.relevancia}
                      </Badge>
                    )}
                    {m.sentimento && (
                      <Badge
                        colorPalette={
                          m.sentimento === "negativo"
                            ? "red"
                            : m.sentimento === "positivo"
                            ? "green"
                            : "gray"
                        }
                        size="sm"
                      >
                        {m.sentimento}
                      </Badge>
                    )}
                  </>
                )}
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Text fontSize="xs" color="gray.400">
                  @{m.autor ?? "—"} ·{" "}
                  {m.data_tweet
                    ? new Date(m.data_tweet).toLocaleDateString("pt-BR")
                    : "—"}
                </Text>
                {m.url && (
                  <Link href={m.url} target="_blank" fontSize="xs" color="blue.500">
                    Ver tweet
                  </Link>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
