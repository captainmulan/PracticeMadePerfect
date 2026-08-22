/** How a PDF book is shown on mobile / small screens. */
export type PageViewType =
  | "Auto"
  | "ComicView"
  | "NormalView"
  | "MediumView"
  | "LargeView"
  | "ExtraLargeView"
  | "Normal"
  | "Fit"
  | "SoftFocus"
  | "NormalFocus"
  | "BasicFocus"
  | "MediumFocus"
  | "HardFocus"
  | "PanelJump";

/** Concrete modes after Auto resolves (never Auto). */
export type ResolvedPageViewType = Exclude<PageViewType, "Auto">;

export const PAGE_VIEW_TYPES: PageViewType[] = [
  "Auto",
  "ComicView",
  "NormalView",
  "MediumView",
  "LargeView",
  "ExtraLargeView",
  "Normal",
  "Fit",
  "SoftFocus",
  "NormalFocus",
  "BasicFocus",
  "MediumFocus",
  "HardFocus",
  "PanelJump",
];

/** Named reading sizes — default zoom on narrow screens only. */
export const PAGE_VIEW_TYPE_ZOOM: Partial<Record<PageViewType, number>> = {
  ComicView: 140,
  NormalView: 100,
  MediumView: 125,
  LargeView: 150,
  ExtraLargeView: 175,
};

/** Focus modes that trim PDF white padding (includes zoom presets). */
export const FOCUS_PAGE_VIEW_TYPES: PageViewType[] = [
  "ComicView",
  "NormalView",
  "MediumView",
  "LargeView",
  "ExtraLargeView",
  "SoftFocus",
  "NormalFocus",
  "BasicFocus",
  "MediumFocus",
  "HardFocus",
];

export const DEFAULT_PAGE_VIEW_TYPE: PageViewType = "NormalView";

export function normalizePageViewType(value: unknown): PageViewType {
  const raw = typeof value === "string" ? value.trim() : "";
  if ((PAGE_VIEW_TYPES as string[]).includes(raw)) {
    return raw as PageViewType;
  }
  return DEFAULT_PAGE_VIEW_TYPE;
}

export function defaultZoomForPageViewType(mode: PageViewType): number {
  return PAGE_VIEW_TYPE_ZOOM[mode] ?? 100;
}

export function isFocusPageViewMode(mode: string | null | undefined): boolean {
  return (FOCUS_PAGE_VIEW_TYPES as string[]).includes(String(mode || ""));
}

export function isPanelJumpMode(mode: string | null | undefined): boolean {
  return mode === "PanelJump";
}
