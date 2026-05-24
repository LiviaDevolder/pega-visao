"use client";

import { GeoJSON, Popup } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { PathOptions, LeafletMouseEvent } from "leaflet";
import type { RiskScore } from "@/lib/risk-queries";

interface RiskZonesLayerProps {
  areas: RiskScore[];
  onAreaClick: (area: RiskScore) => void;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "alto":
      return "#ef4444";
    case "medio":
      return "#f59e0b";
    case "baixo":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

function countLayers(area: RiskScore): number {
  let count = 0;
  if (area.ocorrencias_count > 0) count++;
  if (area.fatores_count > 0) count++;
  if (area.denuncias_count > 0) count++;
  return count;
}

export function RiskZonesLayer({ areas, onAreaClick }: RiskZonesLayerProps) {
  return (
    <>
      {areas.map((area) => {
        const color = getRiskColor(area.risk_level);
        const layers = countLayers(area);
        const isBingo = layers >= 2;
        const style: PathOptions = {
          color,
          weight: isBingo ? 3 : 2,
          fillColor: color,
          fillOpacity: 0.3,
        };

        const feature: Feature<Geometry> = {
          type: "Feature",
          geometry: JSON.parse(area.geojson),
          properties: { nome: area.nome_area_fm },
        };

        return (
          <GeoJSON
            key={`risk-${area.id}`}
            data={feature}
            style={style}
            eventHandlers={{
              click: () => onAreaClick(area),
              mouseover: (e: LeafletMouseEvent) => {
                e.target.setStyle({ fillOpacity: 0.5, weight: isBingo ? 4 : 3 });
              },
              mouseout: (e: LeafletMouseEvent) => {
                e.target.setStyle(style);
              },
            }}
          >
            <Popup>
              <strong>{area.nome_area_fm}</strong>
              <br />
              {isBingo && (
                <>
                  <strong style={{ color: "#dc2626" }}>
                    BINGO! {layers}/3 camadas coincidindo
                  </strong>
                  <br />
                </>
              )}
              Risco: <strong style={{ color }}>{area.risk_level.toUpperCase()}</strong>
              <br />
              Score: {area.risk_score.toFixed(2)}
              <br />
              Ocorrencias: {area.ocorrencias_count.toLocaleString("pt-BR")}
              <br />
              Fatores: {area.fatores_count}
              <br />
              Denuncias: {area.denuncias_count.toLocaleString("pt-BR")}
            </Popup>
          </GeoJSON>
        );
      })}
    </>
  );
}
