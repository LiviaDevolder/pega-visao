"use client";

import { useState } from "react";
import { Button, Spinner } from "@chakra-ui/react";
import { TOUCH_TARGET } from "@/lib/responsive";

interface ReportButtonProps {
  areaFmId: number;
  areaName: string;
  /** Largura total com área de toque de 44px (uso em cartões no celular). */
  fullWidth?: boolean;
}

export function ReportButton({ areaFmId, areaName, fullWidth }: ReportButtonProps) {
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
        throw new Error("Erro ao gerar relatório");
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
      w={fullWidth ? { base: "100%", md: "auto" } : undefined}
      minH={fullWidth ? { base: TOUCH_TARGET, md: "auto" } : undefined}
      colorPalette="teal"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? <Spinner size="xs" /> : "Gerar Relatório"}
    </Button>
  );
}
