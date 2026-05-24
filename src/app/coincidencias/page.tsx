"use client";

import dynamic from "next/dynamic";

const CoincidenciasView = dynamic(
  () =>
    import("@/components/views/CoincidenciasView").then(
      (mod) => mod.CoincidenciasView
    ),
  { ssr: false }
);

export default function CoincidenciasPage() {
  return <CoincidenciasView />;
}
