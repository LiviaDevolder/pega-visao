"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { FmAllocation } from "@/lib/ai/prompts/fm-allocation";
import type { AreaFm } from "@/types/geo";

interface FmAllocationLayerProps {
  allocation: FmAllocation[];
  areas: AreaFm[];
}

function getModelColor(modelo: string): string {
  switch (modelo) {
    case "a pe":
      return "#22c55e";
    case "moto":
      return "#f59e0b";
    case "viatura":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

// Obter centroide aproximado do GeoJSON de cada area
function getCentroid(geojson: GeoJSON.Geometry): [number, number] {
  if (geojson.type === "MultiPolygon") {
    const coords = geojson.coordinates[0][0];
    let latSum = 0,
      lngSum = 0;
    for (const [lng, lat] of coords) {
      latSum += lat;
      lngSum += lng;
    }
    return [latSum / coords.length, lngSum / coords.length];
  }
  if (geojson.type === "Polygon") {
    const coords = geojson.coordinates[0];
    let latSum = 0,
      lngSum = 0;
    for (const [lng, lat] of coords) {
      latSum += lat;
      lngSum += lng;
    }
    return [latSum / coords.length, lngSum / coords.length];
  }
  return [-22.9068, -43.1729];
}

export function FmAllocationLayer({
  allocation,
  areas,
}: FmAllocationLayerProps) {
  return (
    <>
      {allocation.map((item, i) => {
        const area = areas.find(
          (a) =>
            a.nome_area_fm.toLowerCase() === item.area.toLowerCase()
        );
        if (!area) return null;

        const center = getCentroid(area.geojson);
        const radius = Math.max(8, Math.min(30, item.agentes / 2));

        return (
          <CircleMarker
            key={i}
            center={center}
            radius={radius}
            fillColor={getModelColor(item.modelo_emprego)}
            fillOpacity={0.7}
            color="#fff"
            weight={2}
          >
            <Popup>
              <strong>{item.area}</strong>
              <br />
              Agentes: <strong>{item.agentes}</strong>
              <br />
              Modelo: {item.modelo_emprego}
              <br />
              Horarios: {item.horarios_prioridade}
              <br />
              <em>{item.justificativa}</em>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
