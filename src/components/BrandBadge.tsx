"use client";

import { Box, HStack, Text, Stack } from "@chakra-ui/react";

export function BrandBadge() {
  return (
    <Box
      position="absolute"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      bg="white"
      borderRadius="lg"
      px={4}
      py={2}
      shadow="lg"
    >
      <HStack gap={3}>
        <Box as="span" w="32px" h="32px" flexShrink={0}>
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
          <Text
            fontSize="md"
            fontWeight="800"
            color="#0A2E5C"
            lineHeight="1.1"
            letterSpacing="-0.3px"
          >
            Pega Visão
          </Text>
          <Text
            fontSize="2xs"
            fontWeight="600"
            color="#0080C8"
            lineHeight="1.1"
            letterSpacing="1.5px"
          >
            INTELIGÊNCIA · COMPSTAT RIO
          </Text>
        </Stack>
      </HStack>
    </Box>
  );
}
