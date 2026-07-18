import { useRef, useState } from "react";
import type { Course } from "../data/courses";
import {
  buildBookImportPreview,
  buildCourseFromPreview,
  type BookImportPreview,
} from "../utils/bookImport";

interface AdminBookUploadPanelProps {
  books: Course[];
  onImported: (course: Course, summary: string, saveImmediately: boolean) => void;
  onCancel: () => void;
}

export default function AdminBookUploadPanel({ books, onImported, onCancel }: AdminBookUploadPanelProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BookImportPreview | null>(null);
  const [category, setCategory] = useState("IT");
  const [bookId, setBookId] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  async function handleFolderSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }

    setIsReading(true);
    setError("");

    try {
      const nextPreview = await buildBookImportPreview(
        files,
        books.length,
        books.map((book) => book.id),
      );
      if (!nextPreview) {
        setError("No HTML files found in the selected folder.");
        setPreview(null);
        return;
      }
      setPreview(nextPreview);
      setBookId(nextPreview.bookId);
    } catch (err) {
      setError(String(err));
      setPreview(null);
    } finally {
      setIsReading(false);
    }
  }

  function handleCreateBook(saveImmediately: boolean) {
    if (!preview) return;

    const trimmedId = bookId.trim() || preview.bookId;
    if (!trimmedId) {
      setError("Book id is required.");
      return;
    }

    const course = buildCourseFromPreview(preview, books.length, category, trimmedId);
    const summary = saveImmediately
      ? `Uploaded and saved "${course.title}" with ${preview.pages.length} pages.`
      : `Loaded "${course.title}" with ${preview.pages.length} pages. Review pages, then click Save Book.`;

    onImported(course, summary, saveImmediately);
  }

  return (
    <div className="admin-book-upload panel-bordered">
      <div className="admin-book-upload-header">
        <h3>Upload New Book</h3>
        <button type="button" className="admin-btn admin-btn-book secondary small" onClick={onCancel}>
          Close
        </button>
      </div>

      <p className="admin-book-upload-help">
        Choose a folder of HTML files. The folder name becomes the book title. Files like
        <code>001-intro.html</code> and <code>002-index.html</code> become Page 1, Page 2, and their HTML is copied into each page&apos;s Content HTML field.
      </p>

      <div className="admin-book-upload-actions">
        <input
          ref={folderInputRef}
          type="file"
          accept=".html,.htm,text/html"
          multiple
          {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
          hidden
          onChange={handleFolderSelect}
        />
        <button
          type="button"
          className="admin-btn admin-btn-book small"
          onClick={() => folderInputRef.current?.click()}
          disabled={isReading}
        >
          {isReading ? "Reading folder..." : "Choose Folder"}
        </button>
      </div>

      {error ? <div className="admin-course-message admin-book-upload-error">{error}</div> : null}

      {preview ? (
        <div className="admin-book-upload-preview">
          <div className="admin-book-upload-meta">
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Folder path</span>
              <input value={preview.folderPath} readOnly className="admin-grid-input" />
            </label>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Book name</span>
              <input value={preview.bookTitle} readOnly className="admin-grid-input" />
            </label>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Book id</span>
              <input value={bookId} onChange={(e) => setBookId(e.target.value)} className="admin-grid-input" />
            </label>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-grid-select">
                <option value="IT">IT</option>
                <option value="Kid">Kid</option>
                <option value="Fiction">Fiction</option>
                <option value="Language">Language</option>
              </select>
            </label>
          </div>

          {preview.existingBookId ? (
            <div className="admin-course-message admin-book-upload-warning">
              A book with id &quot;{preview.existingBookId}&quot; already exists. Saving will overwrite it.
            </div>
          ) : null}

          <div className="admin-book-upload-summary">
            {preview.pages.length} HTML pages found
          </div>

          <ul className="admin-book-upload-page-list">
            {preview.pages.slice(0, 12).map((page, index) => (
              <li key={`${page.relativePath}-${index}`}>
                <strong>{page.pageNumber !== Number.MAX_SAFE_INTEGER ? `Page ${page.pageNumber}` : `Page ${index + 1}`}</strong>
                <span>{page.fileName}</span>
                <span>{page.title}</span>
              </li>
            ))}
            {preview.pages.length > 12 ? (
              <li className="admin-book-upload-more">…and {preview.pages.length - 12} more pages</li>
            ) : null}
          </ul>

          <div className="admin-book-upload-footer">
            <button type="button" className="admin-btn admin-btn-book secondary small" onClick={() => handleCreateBook(false)}>
              Load as Draft
            </button>
            <button type="button" className="admin-btn admin-btn-book small" onClick={() => handleCreateBook(true)}>
              Create &amp; Save Book
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
