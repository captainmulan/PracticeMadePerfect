import { useEffect, useMemo, useState } from "react";
import type { Announcement } from "../types/announcement";
import {
  deleteAnnouncement,
  getAnnouncements,
  saveAnnouncement,
} from "../utils/indexedDb";

const EMPTY_DRAFT: Announcement = {
  id: "",
  title: "",
  body: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isActive: true,
  sortOrder: 0,
};

function toIsoDate(value: string): string {
  if (!value) return new Date().toISOString();
  if (value.includes("T")) return value;
  return new Date(`${value}T12:00:00`).toISOString();
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Announcement>(EMPTY_DRAFT);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const sortedAnnouncements = useMemo(
    () =>
      announcements.slice().sort((a, b) => {
        const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [announcements]
  );

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const items = await getAnnouncements();
      setAnnouncements(items);
      setMessage("");
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  const startNew = () => {
    setSelectedId(null);
    setDraft({
      ...EMPTY_DRAFT,
      id: `announcement-${Date.now()}`,
      publishedAt: new Date().toISOString().slice(0, 10),
      sortOrder: announcements.length,
    });
  };

  const selectAnnouncement = (item: Announcement) => {
    setSelectedId(item.id);
    setDraft({
      ...item,
      publishedAt: item.publishedAt.slice(0, 10),
    });
  };

  const updateDraft = <K extends keyof Announcement>(key: K, value: Announcement[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const trimmedTitle = draft.title.trim();
    const trimmedBody = draft.body.trim();
    if (!trimmedTitle || !trimmedBody) {
      setMessage("Title and body are required.");
      return;
    }

    const payload: Announcement = {
      ...draft,
      id: draft.id.trim() || `announcement-${Date.now()}`,
      title: trimmedTitle,
      body: trimmedBody,
      publishedAt: toIsoDate(draft.publishedAt),
      sortOrder: Number.isFinite(draft.sortOrder) ? Number(draft.sortOrder) : 0,
    };

    try {
      await saveAnnouncement(payload);
      await loadAnnouncements();
      setSelectedId(payload.id);
      setDraft({ ...payload, publishedAt: payload.publishedAt.slice(0, 10) });
      setMessage("Announcement saved.");
    } catch (err) {
      setMessage(String(err));
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(selectedId);
      setSelectedId(null);
      setDraft(EMPTY_DRAFT);
      await loadAnnouncements();
      setMessage("Announcement deleted.");
    } catch (err) {
      setMessage(String(err));
    }
  };

  return (
    <div className="admin-announcements">
      <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
        <div className="admin-search-actions-end">
          <button type="button" className="footer-button" onClick={startNew}>
            New Announcement
          </button>
          <button type="button" className="footer-button" onClick={() => void loadAnnouncements()}>
            Refresh
          </button>
        </div>
      </div>

      {message && <div className="admin-course-message">{message}</div>}

      <div className="admin-announcements-layout">
        <aside className="admin-announcements-list panel panel-bordered">
          <h4 style={{ marginTop: 0 }}>Announcements</h4>
          {loading ? (
            <p>Loading...</p>
          ) : sortedAnnouncements.length === 0 ? (
            <p>No announcements yet.</p>
          ) : (
            <ul className="admin-announcements-items">
              {sortedAnnouncements.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`admin-announcements-item ${selectedId === item.id ? "active" : ""}`}
                    onClick={() => selectAnnouncement(item)}
                  >
                    <span className="admin-announcements-item-title">{item.title}</span>
                    <span className="admin-announcements-item-meta">
                      {item.isActive ? "Active" : "Hidden"} · {item.publishedAt.slice(0, 10)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="admin-announcements-editor panel panel-bordered">
          <h4 style={{ marginTop: 0 }}>{selectedId ? "Edit Announcement" : "Create Announcement"}</h4>
          <div className="admin-search-row">
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">ID</span>
              <input
                type="text"
                value={draft.id}
                onChange={(event) => updateDraft("id", event.target.value)}
                className="admin-grid-input"
                disabled={Boolean(selectedId)}
              />
            </label>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Sort Order</span>
              <input
                type="number"
                value={draft.sortOrder ?? 0}
                onChange={(event) => updateDraft("sortOrder", Number(event.target.value))}
                className="admin-grid-input"
              />
            </label>
          </div>
          <label className="admin-task-editor-field admin-task-editor-full">
            <span className="admin-task-editor-label">Title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="admin-grid-input"
            />
          </label>
          <label className="admin-task-editor-field admin-task-editor-full">
            <span className="admin-task-editor-label">Published Date</span>
            <input
              type="date"
              value={draft.publishedAt.slice(0, 10)}
              onChange={(event) => updateDraft("publishedAt", event.target.value)}
              className="admin-grid-input"
            />
          </label>
          <label className="admin-task-editor-field admin-task-editor-full">
            <span className="admin-task-editor-label">Body</span>
            <textarea
              rows={8}
              value={draft.body}
              onChange={(event) => updateDraft("body", event.target.value)}
              className="admin-grid-input"
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => updateDraft("isActive", event.target.checked)}
            />
            <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Show on home page</span>
          </label>
          <div className="admin-search-actions-end">
            <button type="button" className="footer-button" onClick={() => void handleSave()}>
              Save Announcement
            </button>
            {selectedId && (
              <button type="button" className="footer-button" onClick={() => void handleDelete()}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
