import { useEffect, useMemo, useState } from "react";
import type { Course } from "../data/courses";
import { loadCourseSummariesFromBrowserDb, persistCourseIndexes } from "../utils/sqliteBrowserCourses";
import {
  listShelfCatalogItems,
  writeFolderIndexes,
  type ShelfCatalogItem,
  type ShelfIndexValues,
  type ShelfItemKind,
  authorIndexKey,
  folderIndexKey,
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

export default function AdminShelfItems() {
  const [books, setBooks] = useState<Course[]>([]);
  const [rows, setRows] = useState<ShelfCatalogItem[]>([]);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCourseSummariesFromBrowserDb()
      .then((data) => {
        setBooks(data);
        setRows(listShelfCatalogItems(data));
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

  const updateRow = (key: string, patch: ShelfIndexValues) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const folderIndexes: Record<string, ShelfIndexValues> = {};
      for (const row of rows) {
        const indexes = {
          pIndex: parseIndex(indexInput(row.pIndex)),
          scIndex: parseIndex(indexInput(row.scIndex)),
          sIndex: parseIndex(indexInput(row.sIndex)),
        };
        if (row.kind === "book" && row.bookId) {
          await persistCourseIndexes(row.bookId, indexes);
        } else if (row.kind === "author") {
          folderIndexes[authorIndexKey(row.title)] = indexes;
        } else {
          folderIndexes[folderIndexKey(row.browsePath)] = indexes;
        }
      }
      writeFolderIndexes(folderIndexes);
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
          {saving ? "Saving…" : "Save indexes"}
        </button>
      </div>
      <div className="admin-shelf-items-table-wrap">
        <table className="admin-shelf-items-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Item</th>
              <th>Path</th>
              <th>Popular</th>
              <th>Category</th>
              <th>Series</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.key}>
                <td>{row.kind}</td>
                <td>{row.title}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="admin-shelf-items-meta">{visible.length} shown · {books.length} books in catalog</p>
    </div>
  );
}
