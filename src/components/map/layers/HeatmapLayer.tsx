"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { HeatPoint } from "@/types/geo";

interface HeatmapLayerProps {
  points: HeatPoint[];
}

export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.weight,
    ]);

    const heat = (L as unknown as { heatLayer: typeof import("leaflet.heat").heatLayer }).heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.2: "#ffffb2",
        0.4: "#fecc5c",
        0.6: "#fd8d3c",
        0.8: "#f03b20",
        1.0: "#bd0026",
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
