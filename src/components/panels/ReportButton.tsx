"use client";

import { useState } from "react";
import { Button, Spinner } from "@chakra-ui/react";

interface ReportButtonProps {
  areaFmId: number;
  areaName: string;
}

export function ReportButton({ areaFmId, areaName }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area_fm_id: areaFmId }),
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar relatorio");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      const code = areaName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      a.href = url;
      a.download = `RELINT_${code}_${date}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro no download:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      colorPalette="teal"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? <Spinner size="xs" /> : "Gerar Relatorio"}
    </Button>
  );
}
