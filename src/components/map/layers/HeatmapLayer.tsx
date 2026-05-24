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

    // p95 dos weights: top 5% satura no vermelho escuro, restante se
    // distribui na escala. Sem isso o COUNT(*) bruto satura tudo.
    const sortedWeights = points.map((p) => p.weight).sort((a, b) => a - b);
    const p95 = sortedWeights[Math.floor(sortedWeights.length * 0.95)] || 1;

    const heat = (L as unknown as { heatLayer: typeof import("leaflet.heat").heatLayer }).heatLayer(heatData, {
      radius: 15,
      blur: 12,
      max: p95,
      maxZoom: 17,
      minOpacity: 0.25,
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
