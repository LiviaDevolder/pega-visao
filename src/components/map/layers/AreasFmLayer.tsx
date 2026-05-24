"use client";

import { GeoJSON, Popup } from "react-leaflet";
import type { AreaFm } from "@/types/geo";
import type { Feature, Geometry } from "geojson";
import type { LeafletMouseEvent, PathOptions } from "leaflet";

interface AreasFmLayerProps {
  areas: AreaFm[];
  onAreaClick: (area: AreaFm) => void;
}

const areaStyle: PathOptions = {
  color: "#3b82f6",
  weight: 2,
  fillColor: "#3b82f6",
  fillOpacity: 0.1,
};

const hoverStyle: PathOptions = {
  fillOpacity: 0.3,
  weight: 3,
};

export function AreasFmLayer({ areas, onAreaClick }: AreasFmLayerProps) {
  return (
    <>
      {areas.map((area) => {
        const feature: Feature<Geometry> = {
          type: "Feature",
          geometry: area.geojson,
          properties: { nome: area.nome_area_fm },
        };

        return (
          <GeoJSON
            key={area.id}
            data={feature}
            style={areaStyle}
            eventHandlers={{
              click: () => onAreaClick(area),
              mouseover: (e: LeafletMouseEvent) => {
                e.target.setStyle(hoverStyle);
              },
              mouseout: (e: LeafletMouseEvent) => {
                e.target.setStyle(areaStyle);
              },
            }}
          >
            <Popup>
              <strong>{area.nome_area_fm}</strong>
              <br />
              Ocorrencias: {area.total_ocorrencias?.toLocaleString("pt-BR")}
              <br />
              Fatores Urbanos: {area.total_fatores}
            </Popup>
          </GeoJSON>
        );
      })}
    </>
  );
}
