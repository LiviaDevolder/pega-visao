"use client";

import { useState } from "react";
import { Box, CloseButton, Drawer, IconButton, Portal } from "@chakra-ui/react";
import { TOUCH_TARGET } from "@/lib/responsive";
import { BrandLogo, NavList } from "./NavContent";

// Botão de menu + gaveta de navegação. Visível só abaixo do breakpoint `md`.
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Box display={{ base: "block", md: "none" }}>
      <IconButton
        aria-label="Abrir menu de navegação"
        variant="ghost"
        size="lg"
        minW={TOUCH_TARGET}
        minH={TOUCH_TARGET}
        onClick={() => setOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="#0A2E5C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </IconButton>

      <Drawer.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement="start"
        size="xs"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header borderBottom="1px solid" borderColor="gray.100">
                <Drawer.Title asChild>
                  <div>
                    <BrandLogo />
                  </div>
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body p={0}>
                <nav aria-label="Navegação principal">
                  <NavList onNavigate={() => setOpen(false)} />
                </nav>
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="lg" position="absolute" top={3} right={3} />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
