"use client";

import { Box } from "@chakra-ui/react";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { Header } from "./Header";
import { HEADER_HEIGHT, SCREEN_HEIGHT } from "@/lib/responsive";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH={SCREEN_HEIGHT} bg="gray.50">
      <Sidebar />
      <Header />
      <Box
        as="main"
        ml={{ base: 0, md: SIDEBAR_WIDTH }}
        pt={HEADER_HEIGHT}
        minH={SCREEN_HEIGHT}
        minW={0}
      >
        {children}
      </Box>
    </Box>
  );
}
