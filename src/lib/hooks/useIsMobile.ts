"use client";

import { useSyncExternalStore } from "react";
import { MOBILE_QUERY } from "@/lib/responsive";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

// No servidor não há tela: assume desktop. Para estilo prefira props responsivas do Chakra
// (`{ base, md }`), que não piscam na hidratação; use este hook só para lógica em JS.
function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
