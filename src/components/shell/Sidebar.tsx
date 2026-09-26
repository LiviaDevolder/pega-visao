"use client";

import { Box } from "@chakra-ui/react";
import { Z_INDEX } from "@/lib/responsive";
import { BrandLogo, NavList } from "./NavContent";

export const SIDEBAR_WIDTH = "240px";

// Sidebar fixa: só a partir de `md`. No celular a navegação fica na gaveta (MobileNav).
export function Sidebar() {
  return (
    <Box
      as="nav"
      aria-label="Navegação principal"
      display={{ base: "none", md: "block" }}
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      w={SIDEBAR_WIDTH}
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      zIndex={Z_INDEX.sidebar}
      overflowY="auto"
    >
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <BrandLogo />
      </Box>
      <NavList />
    </Box>
  );
}
