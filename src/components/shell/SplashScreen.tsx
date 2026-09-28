"use client";

import { useEffect, useState } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";

const DISPLAY_MS = 1400;
const FADE_MS = 400;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), DISPLAY_MS);
    const removeTimer = setTimeout(() => setVisible(false), DISPLAY_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      bg="#0A2E5C"
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={fadingOut ? 0 : 1}
      pointerEvents="none"
      style={{ transition: `opacity ${FADE_MS}ms ease` }}
    >
      <Stack align="center" gap={4}>
        <Box position="relative" w="96px" h="96px">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            width="96"
            height="96"
            aria-hidden="true"
            style={{ animation: "pv-splash-in 500ms ease-out" }}
          >
            <circle cx="32" cy="32" r="26" stroke="#0080C8" strokeWidth="3" opacity="0.9" />
            <path
              d="M32 2 L32 10 M32 54 L32 62 M2 32 L10 32 M54 32 L62 32"
              stroke="#0080C8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="13" fill="#FCD116" stroke="#0A2E5C" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="5.5" fill="#0A2E5C" />
            <circle cx="34" cy="29.5" r="1.6" fill="#FFFFFF" />
          </svg>
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            border="2px solid #0080C8"
            style={{ animation: "pv-splash-ping 1400ms ease-out infinite" }}
          />
        </Box>
        <Stack gap={0} align="center" style={{ animation: "pv-splash-in 500ms ease-out 150ms both" }}>
          <Text fontSize="xl" fontWeight="800" color="white" letterSpacing="-0.3px">
            Pega Visão
          </Text>
          <Text fontSize="xs" fontWeight="600" color="#0080C8" letterSpacing="2px">
            COMPSTAT RIO
          </Text>
        </Stack>
      </Stack>
      <style>{`
        @keyframes pv-splash-in {
          from { opacity: 0; transform: scale(0.85) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pv-splash-ping {
          0% { transform: scale(0.9); opacity: 0.6; }
          80%, 100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </Box>
  );
}
