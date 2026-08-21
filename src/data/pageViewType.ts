/** How a PDF book is shown on mobile / small screens. */
export type PageViewType = "Auto" | "Normal" | "Fit" | "SoftFocus" | "PanelJump";

/** Concrete modes after Auto resolves (never Auto). */
export type ResolvedPageViewType = Exclude<PageViewType, "Auto">;

export const PAGE_VIEW_TYPES: PageViewType[] = [
  "Auto",
  "Normal",
  "Fit",
  "SoftFocus",
  "PanelJump",
];

export const DEFAULT_PAGE_VIEW_TYPE: PageViewType = "Auto";

export function normalizePageViewType(value: unknown): PageViewType {
  const raw = typeof value === "string" ? value.trim() : "";
  if ((PAGE_VIEW_TYPES as string[]).includes(raw)) {
    return raw as PageViewType;
  }
  return DEFAULT_PAGE_VIEW_TYPE;
}

export function isPanelJumpMode(mode: string | null | undefined): boolean {
  return mode === "PanelJump";
}
