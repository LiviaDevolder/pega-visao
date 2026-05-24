"use client";

import dynamic from "next/dynamic";

const CoberturaFmView = dynamic(
  () =>
    import("@/components/views/CoberturaFmView").then(
      (mod) => mod.CoberturaFmView
    ),
  { ssr: false }
);

export default function CoberturaFmPage() {
  return <CoberturaFmView />;
}
