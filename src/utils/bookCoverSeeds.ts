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
};

export function resolveBookCoverUrl(course: { id: string; coverImageUrl?: string | null }): string | undefined {
  if (course.coverImageUrl) {
    return course.coverImageUrl;
  }
  return BOOK_COVER_SEEDS[course.id];
}
