/** Default cover image URLs for courses (applied when coverImageUrl is not set).
 *  Canonical files live under /book_covers/thumbs/ (full-size copies were removed).
 */
export const BOOK_COVER_SEEDS: Record<string, string> = {
  solarsystem: "/book_covers/thumbs/solarsystem.webp",
  myfirst100mmwords: "/book_covers/thumbs/myfirst100mmwords.webp",
  "little-programmer": "/book_covers/thumbs/little-programmer.webp",
  oceanadventure: "/book_covers/thumbs/oceanadventure.webp",
  continents: "/book_covers/thumbs/continents.webp",
  "myanmar-letters": "/book_covers/thumbs/myanmar-letters.webp",
  "react-crud": "/book_covers/thumbs/react-crud.webp",
  "new-book": "/book_covers/thumbs/it-newspaper.webp",
  "tharapasa-nidana": "/book_covers/thumbs/tharapasa-nidana.webp",
  "react-interview-practice": "/book_covers/thumbs/react-interview.webp",
  "solid-interview-practice": "/book_covers/thumbs/solid-interview.webp",
  "angular-interview-practice": "/book_covers/thumbs/angular-interview.webp",
  "csharp-interview-practice": "/book_covers/thumbs/csharp-interview.webp",
  "sql-interview-practice": "/book_covers/thumbs/sql-interview.webp",
  "kuku-the-bird-english-pdf": "/book_covers/thumbs/Kuku the bird.webp",
  "my-hero-is-you-too-eng-pdf": "/book_covers/thumbs/My Hero is You Too.webp",
  "tone-tone-eng-pdf": "/book_covers/thumbs/Tone Tone.webp",
  "wine-wine-eng-pdf": "/book_covers/thumbs/Wine Wine.webp",
  "programming-for-kids": "/book_covers/thumbs/Programming-for-Kids.webp",
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
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  if (trimmed.startsWith("book_covers/")) {
    return `/${trimmed}`;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
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
