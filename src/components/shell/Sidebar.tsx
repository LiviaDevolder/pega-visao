"use client";

import { Box, Stack, Text, HStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", icon: "🗺️", label: "Mapa Operacional" },
  { href: "/coincidencias", icon: "🎯", label: "Coincidências" },
  { href: "/cobertura-fm", icon: "👮", label: "Cobertura FM" },
  { href: "/plano-acao", icon: "🏗️", label: "Plano de Ação" },
  { href: "/relints", icon: "📄", label: "RELINTs" },
  { href: "/redes-sociais", icon: "📡", label: "Redes Sociais" },
];

export const SIDEBAR_WIDTH = "240px";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      w={SIDEBAR_WIDTH}
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      zIndex={1100}
      overflowY="auto"
    >
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack gap={3}>
          <Box w="32px" h="32px" flexShrink={0}>
            <svg viewBox="0 0 64 64" fill="none" width="32" height="32" aria-hidden="true">
              <circle cx="32" cy="32" r="26" stroke="#0080C8" strokeWidth="4" />
              <path
                d="M32 2 L32 10 M32 54 L32 62 M2 32 L10 32 M54 32 L62 32"
                stroke="#0080C8"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="32" cy="32" r="13" fill="#FCD116" stroke="#0A2E5C" strokeWidth="1.5" />
              <circle cx="32" cy="32" r="5.5" fill="#0A2E5C" />
              <circle cx="34" cy="29.5" r="1.6" fill="#FFFFFF" />
            </svg>
          </Box>
          <Stack gap={0}>
            <Text fontSize="md" fontWeight="800" color="#0A2E5C" lineHeight="1.1" letterSpacing="-0.3px">
              Pega Visão
            </Text>
            <Text fontSize="2xs" fontWeight="600" color="#0080C8" lineHeight="1.1" letterSpacing="1.5px">
              COMPSTAT RIO
            </Text>
          </Stack>
        </HStack>
      </Box>

      <Stack gap={1} p={2}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <HStack
                gap={3}
                px={3}
                py={2.5}
                borderRadius="md"
                bg={active ? "#0A2E5C" : "transparent"}
                color={active ? "white" : "gray.700"}
                _hover={active ? {} : { bg: "gray.100" }}
                transition="background 0.15s"
              >
                <Text fontSize="lg" lineHeight="1">
                  {item.icon}
                </Text>
                <Text fontSize="sm" fontWeight={active ? "600" : "500"}>
                  {item.label}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </Stack>
    </Box>
  );
}
