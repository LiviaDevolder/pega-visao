"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface GlobalFilters {
  ano?: number;
  mes?: number;
  delito?: string;
}

export type GlobalFilterKey = keyof GlobalFilters;

export function useGlobalFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<GlobalFilters>(() => {
    const anoStr = searchParams.get("ano");
    const mesStr = searchParams.get("mes");
    const delito = searchParams.get("delito");
    return {
      ano: anoStr ? Number(anoStr) : undefined,
      mes: mesStr ? Number(mesStr) : undefined,
      delito: delito || undefined,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: GlobalFilterKey, value: string | number | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const toQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.ano !== undefined) params.set("ano", String(filters.ano));
    if (filters.mes !== undefined) params.set("mes", String(filters.mes));
    if (filters.delito) params.set("delito", filters.delito);
    return params.toString();
  }, [filters]);

  return { filters, setFilter, resetFilters, toQueryString };
}
