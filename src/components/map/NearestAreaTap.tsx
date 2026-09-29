"use client";

import { useMemo } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import type { AreaFm } from "@/types/geo";

// Raio (px) em volta do toque em que uma área ainda conta como tocada.
const TAP_RADIUS_PX = 28;

type Ring = [number, number][]; // [lng, lat]

function ringsOf(geometry: GeoJSON.Geometry): Ring[] {
  if (geometry.type === "Polygon") return geometry.coordinates as Ring[];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates as Ring[][]).flat();
  return [];
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function insideRing(px: number, py: number, pts: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

interface NearestAreaTapProps {
  areas: AreaFm[];
  /** Só liga em tela de toque: no mouse o clique preciso já basta. */
  enabled: boolean;
  onPick: (area: AreaFm) => void;
}

/**
 * Em telas de toque, áreas pequenas são difíceis de acertar com o dedo. Quando o toque cai no
 * mapa (fora de qualquer área, já que o clique direto numa área não chega aqui), seleciona a
 * área cuja borda esteja a até TAP_RADIUS_PX do ponto tocado.
 */
export function NearestAreaTap({ areas, enabled, onPick }: NearestAreaTapProps) {
  const map = useMap();
  const shapes = useMemo(
    () => areas.map((area) => ({ area, rings: ringsOf(area.geojson) })),
    [areas]
  );

  useMapEvents({
    click(e) {
      if (!enabled) return;
      const { x: px, y: py } = e.containerPoint;
      let best: AreaFm | null = null;
      let bestDist = Infinity;

      for (const { area, rings } of shapes) {
        for (const ring of rings) {
          const pts = ring.map(([lng, lat]) => map.latLngToContainerPoint([lat, lng]));
          let d = insideRing(px, py, pts) ? 0 : Infinity;
          for (let i = 0; i < pts.length - 1 && d > 0; i++) {
            d = Math.min(d, distToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y));
          }
          if (d < bestDist) {
            bestDist = d;
            best = area;
          }
        }
      }

      if (best && bestDist <= TAP_RADIUS_PX) onPick(best);
    },
  });

  return null;
}
