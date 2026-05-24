"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { FatorUrbano } from "@/types/geo";

interface FatoresUrbanosLayerProps {
  fatores: FatorUrbano[];
}

const TIPO_COLORS: Record<string, string> = {
  "Iluminacao": "#f59e0b",
  "Vegetacao": "#10b981",
  "Obstrucao": "#ef4444",
  "Lixo": "#8b5cf6",
  "Calçada": "#6366f1",
  "Mobiliario": "#ec4899",
};

function getColor(tipo: string): string {
  for (const [key, color] of Object.entries(TIPO_COLORS)) {
    if (tipo?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#6b7280";
}

export function FatoresUrbanosLayer({ fatores }: FatoresUrbanosLayerProps) {
  return (
    <>
      {fatores.map((f) => (
        <CircleMarker
          key={f.id}
          center={[f.latitude, f.longitude]}
          radius={6}
          fillColor={getColor(f.tipo_ocorrencia_descricao)}
          fillOpacity={0.8}
          color="#fff"
          weight={1}
        >
          <Popup>
            <strong>{f.tipo_ocorrencia_descricao}</strong>
            <br />
            {f.logradouro && <span>{f.logradouro}</span>}
            {f.orgao_responsavel && (
              <>
                <br />
                <em>Orgao: {f.orgao_responsavel}</em>
              </>
            )}
            {f.observacao && (
              <>
                <br />
                <small>{f.observacao}</small>
              </>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
