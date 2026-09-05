import { ASSETS_HOSTING_URL, USE_EXTERNAL_ASSETS_HOSTING } from "../config/externalHosting";

const BASE_URL = USE_EXTERNAL_ASSETS_HOSTING ? ASSETS_HOSTING_URL : "";

/** Default cover image URLs for courses (applied when coverImageUrl is not set).
 *  Canonical files live under /book_covers/thumbs/ (full-size copies were removed).
 */
export const BOOK_COVER_SEEDS: Record<string, string> = {
  solarsystem: `${BASE_URL}/book_covers/thumbs/solarsystem.webp`,
  myfirst100mmwords: `${BASE_URL}/book_covers/thumbs/myfirst100mmwords.webp`,
  "little-programmer": `${BASE_URL}/book_covers/thumbs/little-programmer.webp`,
  oceanadventure: `${BASE_URL}/book_covers/thumbs/oceanadventure.webp`,
  continents: `${BASE_URL}/book_covers/thumbs/continents.webp`,
  "myanmar-letters": `${BASE_URL}/book_covers/thumbs/myanmar-letters.webp`,
  "react-crud": `${BASE_URL}/book_covers/thumbs/react-crud.webp`,
  "new-book": `${BASE_URL}/book_covers/thumbs/it-newspaper.webp`,
  "tharapasa-nidana": `${BASE_URL}/book_covers/thumbs/tharapasa-nidana.webp`,
  "react-interview-practice": `${BASE_URL}/book_covers/thumbs/react-interview.webp`,
  "solid-interview-practice": `${BASE_URL}/book_covers/thumbs/solid-interview.webp`,
  "angular-interview-practice": `${BASE_URL}/book_covers/thumbs/angular-interview.webp`,
  "csharp-interview-practice": `${BASE_URL}/book_covers/thumbs/csharp-interview.webp`,
  "sql-interview-practice": `${BASE_URL}/book_covers/thumbs/sql-interview.webp`,
  "kuku-the-bird-english-pdf": `${BASE_URL}/book_covers/thumbs/Kuku the bird.webp`,
  "my-hero-is-you-too-eng-pdf": `${BASE_URL}/book_covers/thumbs/My Hero is You Too.webp`,
  "tone-tone-eng-pdf": `${BASE_URL}/book_covers/thumbs/Tone Tone.webp`,
  "wine-wine-eng-pdf": `${BASE_URL}/book_covers/thumbs/Wine Wine.webp`,
  "programming-for-kids": `${BASE_URL}/book_covers/thumbs/Programming-for-Kids.webp`,
  "koeimaung-programming-for-kids": `${BASE_URL}/book_covers/thumbs/Programming-for-Kids.webp`,
};

function isInlineCoverData(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("blob:");
}

/** Ensure shelf cover paths resolve from site root. */
function normalizeCoverPath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || isInlineCoverData(trimmed) || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  let path = trimmed;
  if (trimmed.startsWith("/")) {
    path = trimmed;
  } else if (trimmed.startsWith("book_covers/")) {
    path = `/${trimmed}`;
  } else {
    path = `/${trimmed.replace(/^\/+/, "")}`;
  }
  // Use external hosting for book covers if enabled
  if (USE_EXTERNAL_ASSETS_HOSTING && path.startsWith("/book_covers/")) {
    return `${ASSETS_HOSTING_URL}${path}`;
  }
  return path;
}

/** Map a full cover path to the generated shelf thumbnail. */
export function toCoverThumbUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const marker = "/book_covers/";
  const idx = url.indexOf(marker);
  if (idx < 0) {
    return url;
  }
  const rest = url.slice(idx + marker.length);
  if (rest.startsWith("thumbs/")) {
    return url.replace(/ /g, "%20");
  }
  return `${url.slice(0, idx)}${marker}thumbs/${rest.replace(/\.(png|jpe?g)$/i, ".webp")}`.replace(/ /g, "%20");
}

export function resolveBookCoverUrl(
  course: { id: string; coverImageUrl?: string | null },
  options?: { variant?: "full" | "thumb" },
): string | undefined {
  const seeded = BOOK_COVER_SEEDS[course.id];
  const raw = course.coverImageUrl?.trim() || "";
  const full = normalizeCoverPath((!raw || isInlineCoverData(raw) ? seeded : raw) || raw || "");
  if (!full) {
    return undefined;
  }
  const variant = options?.variant ?? "thumb";
  if (variant === "full") {
    const withoutQuery = full.split("?")[0];
    if (withoutQuery.includes("/book_covers/thumbs/")) {
      return withoutQuery.replace("/book_covers/thumbs/", "/book_covers/");
    }
    return withoutQuery;
  }
  return toCoverThumbUrl(full);
}
