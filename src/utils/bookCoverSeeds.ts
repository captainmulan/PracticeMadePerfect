/** Default cover image URLs for courses (applied when coverImageUrl is not set). */
export const BOOK_COVER_SEEDS: Record<string, string> = {
  solarsystem: "/book_covers/solarsystem.webp",
  myfirst100mmwords: "/book_covers/myfirst100mmwords.webp",
  "little-programmer": "/book_covers/little-programmer.webp",
  oceanadventure: "/book_covers/oceanadventure.webp",
  continents: "/book_covers/continents.webp",
  "myanmar-letters": "/book_covers/myanmar-letters.webp",
  "react-crud": "/book_covers/react-crud.webp",
  "new-book": "/book_covers/it-newspaper.webp",
  "tharapasa-nidana": "/book_covers/tharapasa-nidana.webp",
  "react-interview-practice": "/book_covers/react-interview.webp",
  "solid-interview-practice": "/book_covers/solid-interview.webp",
  "angular-interview-practice": "/book_covers/angular-interview.webp",
  "csharp-interview-practice": "/book_covers/csharp-interview.webp",
  "sql-interview-practice": "/book_covers/sql-interview.webp",
  "kuku-the-bird-english-pdf": "/book_covers/Kuku the bird.webp",
  "my-hero-is-you-too-eng-pdf": "/book_covers/My Hero is You Too.webp",
  "tone-tone-eng-pdf": "/book_covers/Tone Tone.webp",
  "wine-wine-eng-pdf": "/book_covers/Wine Wine.webp",
};

function isInlineCoverData(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("blob:");
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
    return url;
  }
  return `${url.slice(0, idx)}${marker}thumbs/${rest.replace(/\.(png|jpe?g)$/i, ".webp")}`.replace(/ /g, "%20");
}

export function resolveBookCoverUrl(
  course: { id: string; coverImageUrl?: string | null },
  options?: { variant?: "full" | "thumb" },
): string | undefined {
  const seeded = BOOK_COVER_SEEDS[course.id];
  const raw = course.coverImageUrl?.trim() || "";
  const full = (!raw || isInlineCoverData(raw) ? seeded : raw) || raw || undefined;
  if (!full) {
    return undefined;
  }
  if (options?.variant === "thumb") {
    return toCoverThumbUrl(full);
  }
  return full.replace(/ /g, "%20");
}
