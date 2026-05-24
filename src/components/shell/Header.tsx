"use client";

import { Suspense, useEffect, useState } from "react";
import { Box, HStack, Text, Button, NativeSelect } from "@chakra-ui/react";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";

export const HEADER_HEIGHT = "56px";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function GlobalFiltersBar() {
  const { filters, setFilter, resetFilters } = useGlobalFilters();
  const [delitos, setDelitos] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/geo/ocorrencias/filtros")
      .then((r) => r.json())
      .then((data) => {
        if (data.delitos) setDelitos(data.delitos);
        if (data.anos) setAnos(data.anos);
      })
      .catch(() => {});
  }, []);

  const hasFilters =
    filters.ano !== undefined ||
    filters.mes !== undefined ||
    filters.delito !== undefined;

  return (
    <HStack gap={3} flex={1}>
      <Text
        fontSize="xs"
        color="gray.500"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="0.6px"
        whiteSpace="nowrap"
      >
        Filtros
      </Text>

      <NativeSelect.Root size="sm" maxW="120px">
        <NativeSelect.Field
          value={filters.ano ?? ""}
          onChange={(e) =>
            setFilter("ano", e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Ano: todos</option>
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <NativeSelect.Root size="sm" maxW="140px">
        <NativeSelect.Field
          value={filters.mes ?? ""}
          onChange={(e) =>
            setFilter("mes", e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Mês: todos</option>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <NativeSelect.Root size="sm" maxW="220px">
        <NativeSelect.Field
          value={filters.delito ?? ""}
          onChange={(e) => setFilter("delito", e.target.value || undefined)}
        >
          <option value="">Delito: todos</option>
          {delitos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {hasFilters && (
        <Button size="xs" variant="ghost" onClick={resetFilters} color="gray.600">
          Limpar
        </Button>
      )}
    </HStack>
  );
}

export function Header() {
  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={SIDEBAR_WIDTH}
      right={0}
      h={HEADER_HEIGHT}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={1050}
      display="flex"
      alignItems="center"
      px={6}
    >
      <Suspense fallback={<Box flex={1} />}>
        <GlobalFiltersBar />
      </Suspense>
    </Box>
  );
}
