/** Display name for Ko Ei Maung / KoEiMaung / koeimaung. */
export const KO_EI_MAUNG = "Ko Ei Maung";

function compactAuthorKey(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u1000-\u109f]/g, "");
}

/** One shelf label per person. Empty / missing → Unknown. */
export function canonicalAuthorName(raw?: string | null): string {
  const trimmed = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return "Unknown";
  }
  if (compactAuthorKey(trimmed) === "koeimaung") {
    return KO_EI_MAUNG;
  }
  return trimmed;
}
