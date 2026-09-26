"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  HStack,
  NativeSelect,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { BrandLogo } from "./NavContent";
import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";
import { HEADER_HEIGHT, TOUCH_TARGET, Z_INDEX } from "@/lib/responsive";

export { HEADER_HEIGHT };

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

interface FieldProps {
  delitos: string[];
  anos: number[];
  size: "sm" | "lg";
  inline: boolean;
}

function FilterFields({ delitos, anos, size, inline }: FieldProps) {
  const { filters, setFilter } = useGlobalFilters();

  return (
    <>
      <NativeSelect.Root size={size} maxW={inline ? "120px" : undefined}>
        <NativeSelect.Field
          aria-label="Filtrar por ano"
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

      <NativeSelect.Root size={size} maxW={inline ? "140px" : undefined}>
        <NativeSelect.Field
          aria-label="Filtrar por mês"
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

      <NativeSelect.Root size={size} maxW={inline ? "220px" : undefined}>
        <NativeSelect.Field
          aria-label="Filtrar por delito"
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
    </>
  );
}

function GlobalFilters() {
  const { filters, resetFilters } = useGlobalFilters();
  const [delitos, setDelitos] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetch("/api/geo/ocorrencias/filtros")
      .then((r) => r.json())
      .then((data) => {
        if (data.delitos) setDelitos(data.delitos);
        if (data.anos) setAnos(data.anos);
      })
      .catch(() => {});
  }, []);

  const activeCount = [filters.ano, filters.mes, filters.delito].filter(
    (v) => v !== undefined
  ).length;
  const hasFilters = activeCount > 0;

  return (
    <>
      {/* Desktop: filtros em linha no cabeçalho */}
      <HStack gap={3} flex={1} display={{ base: "none", md: "flex" }}>
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
        <FilterFields delitos={delitos} anos={anos} size="sm" inline />
        {hasFilters && (
          <Button size="xs" variant="ghost" onClick={resetFilters} color="gray.600">
            Limpar
          </Button>
        )}
      </HStack>

      {/* Celular: botão que abre os filtros em um painel inferior */}
      <Box display={{ base: "flex", md: "none" }} flex={1} justifyContent="flex-end">
        <Button
          variant="outline"
          size="md"
          minH={TOUCH_TARGET}
          onClick={() => setSheetOpen(true)}
          aria-label={
            hasFilters ? `Filtros, ${activeCount} ativos` : "Abrir filtros"
          }
        >
          Filtros{hasFilters ? ` (${activeCount})` : ""}
        </Button>

        <Drawer.Root
          open={sheetOpen}
          onOpenChange={(e) => setSheetOpen(e.open)}
          placement="bottom"
        >
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content borderTopRadius="xl">
                <Drawer.Header>
                  <Drawer.Title fontSize="md" color="#0A2E5C">
                    Filtros
                  </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <Stack gap={3}>
                    <FilterFields delitos={delitos} anos={anos} size="lg" inline={false} />
                  </Stack>
                </Drawer.Body>
                <Drawer.Footer gap={2}>
                  {hasFilters && (
                    <Button
                      variant="outline"
                      minH={TOUCH_TARGET}
                      flex={1}
                      onClick={resetFilters}
                    >
                      Limpar
                    </Button>
                  )}
                  <Button
                    colorPalette="blue"
                    minH={TOUCH_TARGET}
                    flex={1}
                    onClick={() => setSheetOpen(false)}
                  >
                    Aplicar
                  </Button>
                </Drawer.Footer>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="lg" position="absolute" top={3} right={3} />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </Box>
    </>
  );
}

export function Header() {
  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={{ base: 0, md: SIDEBAR_WIDTH }}
      right={0}
      h={HEADER_HEIGHT}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={Z_INDEX.header}
      display="flex"
      alignItems="center"
      gap={2}
      px={{ base: 2, md: 6 }}
    >
      <MobileNav />

      {/* Marca: só no celular, onde a sidebar com a marca está escondida */}
      <Box display={{ base: "block", md: "none" }} minW={0}>
        <BrandLogo />
      </Box>

      <Suspense fallback={<Box flex={1} />}>
        <GlobalFilters />
      </Suspense>
    </Box>
  );
}
