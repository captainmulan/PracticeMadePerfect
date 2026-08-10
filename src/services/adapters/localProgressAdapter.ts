import type { ProgressPort } from "../ports/progressPort";
import type { BookBookmark, BookProgress, UserProgressSnapshot } from "../types/account";

const STORE_KEY = "pmp-progress-v1";

type ProgressStore = Record<string, UserProgressSnapshot>;

function emptySnapshot(userId: string): UserProgressSnapshot {
  return {
    userId,
    favorites: [],
    books: {},
    bookmarks: [],
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

function bookmarkId(bookId: string, stepIndex: number): string {
  return `${bookId}::step::${stepIndex}`;
}

function sortBookmarks(list: BookBookmark[]): BookBookmark[] {
  return [...list].sort((a, b) => a.stepIndex - b.stepIndex);
}

/**
 * Local progress adapter — same portable schema as a future Firestore adapter.
 */
export function createLocalProgressAdapter(): ProgressPort {
  return {
    id: "local-progress",

    async getSnapshot(userId) {
      const store = readStore();
      const snap = store[userId] ?? emptySnapshot(userId);
      if (!Array.isArray(snap.bookmarks)) snap.bookmarks = [];
      if (!snap.books || typeof snap.books !== "object") snap.books = {};
      if (!Array.isArray(snap.favorites)) snap.favorites = [];
      return snap;
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

    async getBookmarks(userId, bookId) {
      const snapshot = await this.getSnapshot(userId);
      const list = Array.isArray(snapshot.bookmarks) ? snapshot.bookmarks : [];
      const filtered = bookId ? list.filter((b) => b.bookId === bookId) : list;
      return sortBookmarks(filtered);
    },

    async toggleBookmark(userId, input) {
      const store = readStore();
      const snapshot = store[userId] ?? emptySnapshot(userId);
      if (!Array.isArray(snapshot.bookmarks)) snapshot.bookmarks = [];
      const id = bookmarkId(input.bookId, input.stepIndex);
      const existing = snapshot.bookmarks.find((b) => b.id === id);
      if (existing) {
        snapshot.bookmarks = snapshot.bookmarks.filter((b) => b.id !== id);
        snapshot.updatedAt = new Date().toISOString();
        store[userId] = snapshot;
        writeStore(store);
        return {
          created: null,
          deleted: true,
          list: sortBookmarks(snapshot.bookmarks.filter((b) => !input.bookId || b.bookId === input.bookId)),
        };
      }
      const created: BookBookmark = {
        id,
        bookId: input.bookId,
        stepIndex: Math.max(0, Math.floor(input.stepIndex)),
        stepTitle: input.stepTitle ?? null,
        note: input.note ?? null,
        createdAt: new Date().toISOString(),
      };
      snapshot.bookmarks.push(created);
      snapshot.updatedAt = created.createdAt;
      store[userId] = snapshot;
      writeStore(store);
      return {
        created,
        deleted: false,
        list: sortBookmarks(snapshot.bookmarks.filter((b) => b.bookId === input.bookId)),
      };
    },

    async removeBookmark(userId, bookmarkIdInput) {
      const store = readStore();
      const snapshot = store[userId] ?? emptySnapshot(userId);
      if (!Array.isArray(snapshot.bookmarks)) snapshot.bookmarks = [];
      snapshot.bookmarks = snapshot.bookmarks.filter((b) => b.id !== bookmarkIdInput);
      snapshot.updatedAt = new Date().toISOString();
      store[userId] = snapshot;
      writeStore(store);
      return sortBookmarks(snapshot.bookmarks);
    },
  };
}
