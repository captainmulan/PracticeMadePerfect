import type { ProgressPort } from "../ports/progressPort";
import type { BookProgress, UserProgressSnapshot } from "../types/account";

const STORE_KEY = "pmp-progress-v1";

type ProgressStore = Record<string, UserProgressSnapshot>;

function emptySnapshot(userId: string): UserProgressSnapshot {
  return {
    userId,
    favorites: [],
    books: {},
    updatedAt: new Date().toISOString(),
  };
}

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/**
 * Local progress adapter — same portable schema as a future Firestore adapter.
 */
export function createLocalProgressAdapter(): ProgressPort {
  return {
    id: "local-progress",

    async getSnapshot(userId) {
      const store = readStore();
      return store[userId] ?? emptySnapshot(userId);
    },

    async getBookProgress(userId, bookId) {
      const snapshot = await this.getSnapshot(userId);
      return snapshot.books[bookId] ?? null;
    },

    async setLastPage(userId, bookId, input) {
      const store = readStore();
      const snapshot = store[userId] ?? emptySnapshot(userId);
      const next: BookProgress = {
        userId,
        bookId,
        lastPageId: input.lastPageId ?? snapshot.books[bookId]?.lastPageId ?? null,
        lastStepIndex: Math.max(0, Math.floor(input.lastStepIndex)),
        updatedAt: new Date().toISOString(),
      };
      snapshot.books[bookId] = next;
      snapshot.updatedAt = next.updatedAt;
      store[userId] = snapshot;
      writeStore(store);
      return next;
    },

    async getFavorites(userId) {
      const snapshot = await this.getSnapshot(userId);
      return [...snapshot.favorites];
    },

    async setFavorite(userId, bookId, favorite) {
      const store = readStore();
      const snapshot = store[userId] ?? emptySnapshot(userId);
      const set = new Set(snapshot.favorites);
      if (favorite) {
        set.add(bookId);
      } else {
        set.delete(bookId);
      }
      snapshot.favorites = Array.from(set);
      snapshot.updatedAt = new Date().toISOString();
      store[userId] = snapshot;
      writeStore(store);
      return [...snapshot.favorites];
    },
  };
}
