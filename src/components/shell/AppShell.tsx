"use client";

import { Box } from "@chakra-ui/react";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { Header, HEADER_HEIGHT } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      <Header />
      <Box
        as="main"
        ml={SIDEBAR_WIDTH}
        pt={HEADER_HEIGHT}
        minH="100vh"
      >
        {children}
      </Box>
    </Box>
  );
}
