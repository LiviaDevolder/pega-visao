"use client";

import { Box, Badge, Text, Table } from "@chakra-ui/react";
import type { FmAllocation } from "@/lib/ai/prompts/fm-allocation";

interface FmAllocationTableProps {
  allocation: FmAllocation[];
}

const MODEL_COLORS: Record<string, string> = {
  "a pe": "green",
  "moto": "orange",
  "viatura": "blue",
};

export function FmAllocationTable({ allocation }: FmAllocationTableProps) {
  const sorted = [...allocation].sort((a, b) => b.agentes - a.agentes);

  return (
    <Box overflowX="auto">
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Area FM</Table.ColumnHeader>
            <Table.ColumnHeader>Agentes</Table.ColumnHeader>
            <Table.ColumnHeader>Modelo</Table.ColumnHeader>
            <Table.ColumnHeader>Horarios</Table.ColumnHeader>
            <Table.ColumnHeader>Justificativa</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((item, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Text fontSize="xs" fontWeight="medium">
                  {item.area}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="xs" fontWeight="bold">
                  {item.agentes}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={MODEL_COLORS[item.modelo_emprego] || "gray"}
                  size="sm"
                >
                  {item.modelo_emprego}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="xs">{item.horarios_prioridade}</Text>
              </Table.Cell>
              <Table.Cell maxW="200px">
                <Text fontSize="xs" color="gray.600" truncate>
                  {item.justificativa}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
