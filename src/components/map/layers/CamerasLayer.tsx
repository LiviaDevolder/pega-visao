"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { Camera } from "@/types/geo";

interface CamerasLayerProps {
  cameras: Camera[];
}

export function CamerasLayer({ cameras }: CamerasLayerProps) {
  return (
    <>
      {cameras.map((cam) => (
        <CircleMarker
          key={cam.id}
          center={[cam.latitude, cam.longitude]}
          radius={4}
          fillColor="#0ea5e9"
          fillOpacity={0.9}
          color="#0369a1"
          weight={1}
        >
          <Popup>
            <strong>Camera</strong>
            <br />
            Area: {cam.nome_area_fm}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
