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
        0.2: "#fee5d9",
        0.4: "#fcae91",
        0.6: "#fb6a4a",
        0.8: "#de2d26",
        1.0: "#a50f15",
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
