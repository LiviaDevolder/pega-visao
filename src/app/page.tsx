import { Box, Heading, Text, Badge, Stack } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" p={8}>
      <Stack gap={4} maxW="2xl" mx="auto" mt={16}>
        <Badge colorPalette="blue" w="fit-content">
          CompStat Rio
        </Badge>
        <Heading size="2xl" color="gray.900">
          Plataforma de Inteligência Criminal
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Análise geoespacial integrada de ocorrências, denúncias e fatores
          urbanos para o CompStat Municipal do Rio de Janeiro.
        </Text>
        <Text color="gray.400" fontSize="sm">
          Infraestrutura em configuração — dados sendo importados.
        </Text>
      </Stack>
    </Box>
  );
}
