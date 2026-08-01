import type { BookProgress, UserProgressSnapshot } from "../types/account";

/**
 * Reading progress / favorites — cloud-ready shape, any storage behind the port.
 */
export interface ProgressPort {
  readonly id: string;

  getSnapshot(userId: string): Promise<UserProgressSnapshot>;
  getBookProgress(userId: string, bookId: string): Promise<BookProgress | null>;
  setLastPage(
    userId: string,
    bookId: string,
    input: { lastStepIndex: number; lastPageId?: string | null },
  ): Promise<BookProgress>;
  getFavorites(userId: string): Promise<string[]>;
  setFavorite(userId: string, bookId: string, favorite: boolean): Promise<string[]>;
}
