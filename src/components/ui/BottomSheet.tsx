"use client";

import { Box, CloseButton, HStack, Text } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { Z_INDEX } from "@/lib/responsive";

// Estilo aplicado abaixo do breakpoint `md`: painel colado no rodapé, largura total.
const MOBILE_STYLE: Record<string, unknown> = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  top: "auto",
  w: "100%",
  minW: 0,
  maxH: "75%",
  transform: "none",
  borderRadius: "16px 16px 0 0",
};

/**
 * Para cada prop em `desktop`, gera `{ base: <valor mobile>, md: <valor desktop> }`.
 * Props que só existem em um dos lados recebem `unset` no outro, para o estilo
 * de um breakpoint não vazar para o outro.
 */
function mergeResponsive(desktop: Record<string, unknown>) {
  const merged: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(MOBILE_STYLE), ...Object.keys(desktop)]);
  keys.forEach((key) => {
    const base = key in MOBILE_STYLE ? MOBILE_STYLE[key] : "unset";
    const md = key in desktop ? desktop[key] : "unset";
    merged[key] = { base, md };
  });
  return merged;
}

interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  /** Título exibido na barra do painel no celular. */
  title?: string;
  /** Layout do painel a partir de `md`: posição, tamanho e `borderRadius`. Cor e sombra são fixas. */
  desktop?: BoxProps;
  /** Padding interno do conteúdo (celular e desktop). */
  padding?: BoxProps["p"];
}

/**
 * Painel de detalhe sobre o mapa: bottom sheet no celular, painel flutuante no desktop.
 * Deve ficar dentro de um contêiner `position: relative` (como o `MapContainer`).
 */
export function BottomSheet({
  children,
  onClose,
  title,
  desktop = {},
  padding = { base: 4, md: 5 },
}: BottomSheetProps) {
  const responsive = mergeResponsive(desktop as Record<string, unknown>);

  return (
    <Box
      role="dialog"
      aria-label={title}
      zIndex={Z_INDEX.sheet}
      bg="white"
      shadow="xl"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      {...responsive}
    >
      {/* Alça e botão de fechar: só no celular; no desktop cada painel tem o seu cabeçalho. */}
      <Box display={{ base: "block", md: "none" }} flexShrink={0}>
        <Box w="36px" h="4px" bg="gray.300" borderRadius="full" mx="auto" mt={2} />
        <HStack justify="space-between" px={4} pt={1} pb={1}>
          <Text fontSize="sm" fontWeight="700" color="#0A2E5C" truncate>
            {title}
          </Text>
          <CloseButton size="lg" onClick={onClose} aria-label="Fechar painel" />
        </HStack>
      </Box>

      <Box flex={1} minH={0} overflowY="auto" p={padding}>
        {children}
      </Box>
    </Box>
  );
}
