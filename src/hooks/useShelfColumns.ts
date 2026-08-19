import { useEffect, useState } from "react";

/**
 * How many books fit on one shelf:
 * phone 2 · large phone/small tablet 3 · tablet 4 · desktop 5.
 */
export function getShelfColumnCount(width = typeof window === "undefined" ? 390 : window.innerWidth): number {
  if (width >= 1280) return 5;
  if (width >= 980) return 4;
  if (width >= 640) return 3;
  return 2;
}

export function useShelfColumns(): number {
  const [columns, setColumns] = useState(() => getShelfColumnCount());

  useEffect(() => {
    const update = () => setColumns(getShelfColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
}
