import { useEffect, useMemo, useState } from "react";
import type { Course } from "../data/courses";
import {
  loadCourseSummariesFromBrowserDb,
  loadFullCourseById,
  persistCourseIndexes,
  persistCourseSummary,
  removeCourse,
} from "../utils/sqliteBrowserCourses";
import { deleteLocalBookAssets, selectProjectAssetDirectory } from "../utils/bookAssetStorage";
import { loadAdminData, saveAdminData } from "../utils/contentStore";
import {
  courseMatchesCategoryPath,
  getCategoryLevels,
  parseCategoryTags,
  serializeCategoryTags,
} from "../utils/bookCategories";
import {
  listShelfCatalogItems,
  type ShelfCatalogItem,
  type ShelfIndexValues,
  type ShelfItemKind,
  authorIndexKey,
  folderIndexKey,
  readFolderIndexes,
  readShelfItemKinds,
  saveShelfItemSettings,
} from "../utils/shelfItemIndexes";

type KindFilter = "all" | ShelfItemKind;

function parseIndex(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

function indexInput(value: number | undefined): string {
  return typeof value === "number" && value > 0 ? String(value) : "";
}

export default function AdminShelfItems({ onEditBook }: { onEditBook: (bookId: string) => void }) {
  const [books, setBooks] = useState<Course[]>([]);
  const [rows, setRows] = useState<ShelfCatalogItem[]>([]);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [folderCovers, setFolderCovers] = useState<Record<string, string>>({});
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [deletingSeriesPath, setDeletingSeriesPath] = useState<string | null>(null);

  useEffect(() => {
    loadCourseSummariesFromBrowserDb()
      .then((data) => {
        setBooks(data);
        setRows(listShelfCatalogItems(data));
        setFolderCovers({ ...(loadAdminData().homePageData.shelfFolderCovers ?? {}) });
        setLoaded(true);
      })
      .catch((err) => setMessage(String(err)));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (kindFilter !== "all" && row.kind !== kindFilter) return false;
      if (!q) return true;
      return `${row.title} ${row.pathLabel} ${row.kind}`.toLowerCase().includes(q);
    });
  }, [kindFilter, query, rows]);

  const updateRow = (key: string, patch: Partial<ShelfIndexValues> & { authorName?: string }) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const updateFolderCover = (path: string[], value: string) => {
    const key = path.filter(Boolean).join("/");
    setFolderCovers((current) => ({ ...current, [key]: value }));
  };

  const updateRowKind = (key: string, kind: Exclude<ShelfItemKind, "author">) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, kind } : row)));
  };

  const handleDeleteBook = async (row: ShelfCatalogItem) => {
    if (!row.bookId || deletingBookId) return;

    let projectRoot: FileSystemDirectoryHandle;
    try {
      projectRoot = await selectProjectAssetDirectory();
    } catch (err) {
      setMessage(String(err));
      return;
    }

    if (!window.confirm(`Delete "${row.title}" and all of its pages? This cannot be undone.`)) return;

    const enteredPassword = window.prompt("Enter admin password to confirm book deletion:", "");
    if (!enteredPassword) return;
    if (enteredPassword !== "admin123") {
      setMessage("Incorrect password. Deletion cancelled.");
      return;
    }

    setDeletingBookId(row.bookId);
    setMessage("Deleting book...");
    try {
      const course = await loadFullCourseById(row.bookId);
      if (!course) throw new Error("Book data could not be loaded; nothing was deleted.");
      await deleteLocalBookAssets(course, projectRoot);
      await removeCourse(row.bookId);
      const refreshed = await loadCourseSummariesFromBrowserDb();
      setBooks(refreshed);
      setRows(listShelfCatalogItems(refreshed));
      setMessage(`Deleted "${row.title}". Other books in its series were not changed.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setDeletingBookId(null);
    }
  };

  const handleDeleteSeries = async (row: ShelfCatalogItem) => {
    if (row.kind !== "series" || row.bookId || deletingSeriesPath) return;
    const pathKey = folderIndexKey(row.browsePath);
    const seriesBooks = books.filter((book) => courseMatchesCategoryPath(book, row.browsePath));
    if (!seriesBooks.length) return;

    if (!window.confirm(`Remove series "${row.title}"? Its ${seriesBooks.length} books will be kept and moved up one category level.`)) return;

    const enteredPassword = window.prompt("Enter admin password to confirm series removal:", "");
    if (!enteredPassword) return;
    if (enteredPassword !== "admin123") {
      setMessage("Incorrect password. Deletion cancelled.");
      return;
    }

    setDeletingSeriesPath(pathKey);
    setMessage(`Removing series "${row.title}"...`);
    try {
      const seriesDepth = row.browsePath.length - 1;
      const seriesTag = row.browsePath[seriesDepth];
      for (const book of seriesBooks) {
        const levels = getCategoryLevels(book);
        const promotedLevels = levels.filter((_, index) => index !== seriesDepth);
        const category = serializeCategoryTags(
          parseCategoryTags(book.category).filter((tag) => tag.toLowerCase() !== seriesTag.toLowerCase()),
        );
        await persistCourseSummary({
          ...book,
          category,
          cat1: promotedLevels[0],
          cat2: promotedLevels[1],
          cat3: promotedLevels[2],
          cat4: promotedLevels[3],
          removedSeriesFolder: seriesTag,
        });
      }

      const prefix = `${pathKey}/`;
      const folderIndexes = Object.fromEntries(
        Object.entries(readFolderIndexes()).filter(([key]) => key !== pathKey && !key.startsWith(prefix)),
      );
      const itemKinds = Object.fromEntries(
        Object.entries(readShelfItemKinds()).filter(
          ([key]) => key !== `folder/${pathKey}` && !key.startsWith(`folder/${pathKey}/`),
        ),
      );
      saveShelfItemSettings({ folderIndexes, itemKinds });

      const adminData = loadAdminData();
      const cleanedCovers = Object.fromEntries(
        Object.entries(adminData.homePageData.shelfFolderCovers ?? {}).filter(
          ([key]) => key !== pathKey && !key.startsWith(prefix),
        ),
      );
      const cleanedIndexes = Object.fromEntries(
        Object.entries(adminData.homePageData.shelfFolderIndexes ?? {}).filter(
          ([key]) => key !== pathKey && !key.startsWith(prefix),
        ),
      );
      const cleanedKinds = Object.fromEntries(
        Object.entries(adminData.homePageData.shelfItemKinds ?? {}).filter(
          ([key]) => key !== `folder/${pathKey}` && !key.startsWith(`folder/${pathKey}/`),
        ),
      );
      saveAdminData({
        ...adminData,
        homePageData: {
          ...adminData.homePageData,
          shelfFolderCovers: cleanedCovers,
          shelfFolderIndexes: cleanedIndexes,
          shelfItemKinds: cleanedKinds,
        },
      });
      setFolderCovers(cleanedCovers);

      const refreshed = await loadCourseSummariesFromBrowserDb();
      setBooks(refreshed);
      setRows(listShelfCatalogItems(refreshed));
      setMessage(`Removed series "${row.title}". Kept ${seriesBooks.length} books and moved them up one category level.`);
    } catch (err) {
      const refreshed = await loadCourseSummariesFromBrowserDb();
      setBooks(refreshed);
      setRows(listShelfCatalogItems(refreshed));
      setMessage(String(err));
    } finally {
      setDeletingSeriesPath(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const folderIndexes: Record<string, ShelfIndexValues> = {};
      const itemKinds: Record<string, Exclude<ShelfItemKind, "author">> = {};
      for (const row of rows) {
        if (row.kind !== "author") itemKinds[row.key] = row.kind;
        const indexes = {
          pIndex: parseIndex(indexInput(row.pIndex)),
          scIndex: parseIndex(indexInput(row.scIndex)),
          sIndex: parseIndex(indexInput(row.sIndex)),
        };
        if (row.bookId) {
          const currentBook = books.find((book) => book.id === row.bookId);
          const authorName = row.authorName?.trim() || undefined;
          if (currentBook && currentBook.authorName !== authorName) {
            await persistCourseSummary({ ...currentBook, authorName });
          }
        }
        if (row.kind === "book" && row.bookId) {
          await persistCourseIndexes(row.bookId, indexes);
        } else if (row.kind === "author") {
          folderIndexes[authorIndexKey(row.title)] = indexes;
        } else {
          folderIndexes[folderIndexKey(row.browsePath)] = indexes;
        }
      }
      const adminData = loadAdminData();
      const cleanedCovers: Record<string, string> = {};
      for (const [key, value] of Object.entries(folderCovers)) {
        if (value.trim()) cleanedCovers[key] = value.trim();
      }
      saveShelfItemSettings({ folderIndexes, itemKinds });
      const currentCovers = adminData.homePageData.shelfFolderCovers ?? {};
      if (JSON.stringify(currentCovers) !== JSON.stringify(cleanedCovers)) {
        saveAdminData({
          ...adminData,
          homePageData: { ...adminData.homePageData, shelfFolderCovers: cleanedCovers },
        });
      }
      const refreshed = await loadCourseSummariesFromBrowserDb();
      setBooks(refreshed);
      setRows(listShelfCatalogItems(refreshed));
      setMessage(`Saved ${rows.length} shelf items.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div className="admin-section-body">Loading shelf items…</div>;
  }

  return (
    <div className="admin-shelf-items">
      <p className="admin-shelf-items-help">
        Every shelf tile is an item: books, subcategories, series, and author names. Set a number to pin and order.
        Leave blank to hide from Popular or keep default order. Popular = home landing. Category = order inside a
        category. Series = order inside a series folder (and among series tiles).
      </p>
      {message ? <div className="admin-course-message">{message}</div> : null}
      <div className="admin-shelf-items-toolbar">
        <input
          className="admin-grid-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or path"
        />
        <select
          className="admin-grid-select"
          value={kindFilter}
          onChange={(event) => setKindFilter(event.target.value as KindFilter)}
        >
          <option value="all">All items ({rows.length})</option>
          <option value="book">Books</option>
          <option value="series">Series</option>
          <option value="subcategory">Subcategories</option>
          <option value="author">Authors</option>
        </select>
        <button type="button" className="admin-btn admin-btn-page" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      <div className="admin-shelf-items-table-wrap">
        <table className="admin-shelf-items-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Item</th>
              <th>Author</th>
              <th>Path</th>
              <th>Popular</th>
              <th>Category</th>
              <th>Series</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.key}>
                <td>
                  {row.kind === "author" ? (
                    row.kind
                  ) : (
                    <select
                      className="admin-grid-select admin-shelf-kind-select"
                      value={row.kind}
                      onChange={(event) => updateRowKind(row.key, event.target.value as Exclude<ShelfItemKind, "author">)}
                      aria-label={`Type for ${row.title}`}
                    >
                      <option value="book">Book</option>
                      <option value="subcategory">Subcategory</option>
                      <option value="series">Series</option>
                    </select>
                  )}
                </td>
                <td>{row.title}</td>
                <td>
                  {row.bookId ? (
                    <input
                      type="text"
                      className="admin-grid-input admin-shelf-author-input"
                      value={row.authorName ?? ""}
                      onChange={(event) => updateRow(row.key, { authorName: event.target.value })}
                      aria-label={`Author for ${row.title}`}
                    />
                  ) : null}
                </td>
                <td>{row.pathLabel}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="admin-grid-input"
                    value={indexInput(row.pIndex)}
                    onChange={(event) => updateRow(row.key, { pIndex: parseIndex(event.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="admin-grid-input"
                    value={indexInput(row.scIndex)}
                    onChange={(event) => updateRow(row.key, { scIndex: parseIndex(event.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="admin-grid-input"
                    value={indexInput(row.sIndex)}
                    onChange={(event) => updateRow(row.key, { sIndex: parseIndex(event.target.value) })}
                  />
                </td>
                <td>
                  {row.bookId ? (
                    <div className="admin-shelf-item-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-book secondary small"
                        onClick={() => onEditBook(row.bookId!)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-book danger small"
                        onClick={() => void handleDeleteBook(row)}
                        disabled={deletingBookId === row.bookId}
                      >
                        {deletingBookId === row.bookId ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ) : row.kind === "series" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn-book danger small"
                      onClick={() => void handleDeleteSeries(row)}
                      disabled={deletingSeriesPath === folderIndexKey(row.browsePath)}
                    >
                      {deletingSeriesPath === folderIndexKey(row.browsePath) ? "Deleting..." : "Delete series"}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="admin-shelf-items-meta">{visible.length} shown · {books.length} books in catalog</p>
    </div>
  );
}
