import { useMemo, useRef, useState } from "react";
import type { Course } from "../data/courses";
import {
  buildBookImportPreview,
  buildCourseFromPreview,
  mergeHtmlPagesIntoExistingCourse,
  previewExistingBookPageMappings,
  type BookImportPreview,
} from "../utils/bookImport";

type UploadMode = "new" | "existing";

interface AdminBookUploadPanelProps {
  books: Course[];
  selectedBookId: string | null;
  onImported: (course: Course, summary: string, saveImmediately: boolean) => void;
  onCancel: () => void;
}

export default function AdminBookUploadPanel({
  books,
  selectedBookId,
  onImported,
  onCancel,
}: AdminBookUploadPanelProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("new");
  const [targetBookId, setTargetBookId] = useState(selectedBookId ?? "");
  const [preview, setPreview] = useState<BookImportPreview | null>(null);
  const [category, setCategory] = useState("IT");
  const [bookId, setBookId] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const targetBook = useMemo(
    () => books.find((book) => book.id === targetBookId) ?? null,
    [books, targetBookId],
  );

  const existingMappings = useMemo(() => {
    if (uploadMode !== "existing" || !preview || !targetBook) {
      return [];
    }
    return previewExistingBookPageMappings(targetBook, preview.pages);
  }, [preview, targetBook, uploadMode]);

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

  function handleApply(saveImmediately: boolean) {
    if (!preview) return;

    if (uploadMode === "existing") {
      if (!targetBook) {
        setError("Select an existing book to update.");
        return;
      }

      const result = mergeHtmlPagesIntoExistingCourse(targetBook, preview.pages);
      if (result.updatedCount === 0) {
        setError("No HTML pages matched existing book pages. Use names like 001-intro.html or page1.html.");
        return;
      }

      const unmatchedNote = result.unmatchedFiles.length > 0
        ? ` Skipped ${result.unmatchedFiles.length} file(s): ${result.unmatchedFiles.slice(0, 4).join(", ")}${result.unmatchedFiles.length > 4 ? "…" : ""}.`
        : "";

      const summary = saveImmediately
        ? `Updated ${result.updatedCount} page(s) in "${targetBook.title}".${unmatchedNote}`
        : `Loaded ${result.updatedCount} updated page(s) for "${targetBook.title}". Review pages, then click Save Book.${unmatchedNote}`;

      onImported(result.course, summary, saveImmediately);
      return;
    }

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
        <h3>Upload Book</h3>
        <button type="button" className="admin-btn admin-btn-book secondary small" onClick={onCancel}>
          Close
        </button>
      </div>

      <div className="admin-book-upload-mode">
        <label className="admin-book-upload-mode-option">
          <input
            type="radio"
            name="upload-mode"
            value="new"
            checked={uploadMode === "new"}
            onChange={() => {
              setUploadMode("new");
              setError("");
            }}
          />
          <span>New</span>
        </label>
        <label className="admin-book-upload-mode-option">
          <input
            type="radio"
            name="upload-mode"
            value="existing"
            checked={uploadMode === "existing"}
            onChange={() => {
              setUploadMode("existing");
              setTargetBookId(selectedBookId ?? books[0]?.id ?? "");
              setError("");
            }}
          />
          <span>Existing</span>
        </label>
      </div>

      {uploadMode === "existing" ? (
        <label className="admin-task-editor-field admin-task-editor-full">
          <span className="admin-task-editor-label">Book to update</span>
          <select
            value={targetBookId}
            onChange={(event) => setTargetBookId(event.target.value)}
            className="admin-grid-select"
          >
            <option value="">Select book...</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>{book.title}</option>
            ))}
          </select>
        </label>
      ) : null}

      <p className="admin-book-upload-help">
        {uploadMode === "new"
          ? "Choose a folder of HTML files. The folder name becomes the book title. Files like 001-intro.html become Page 1 and their HTML is copied into each page Content HTML field."
          : "Choose a folder of HTML files to update an existing book. Match files by page number, e.g. 001-intro.html or page1.html updates Page 1 content HTML."}
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
          {uploadMode === "new" ? (
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
          ) : (
            <div className="admin-book-upload-meta">
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Folder path</span>
                <input value={preview.folderPath} readOnly className="admin-grid-input" />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Target book</span>
                <input value={targetBook?.title ?? "Select a book"} readOnly className="admin-grid-input" />
              </label>
            </div>
          )}

          {uploadMode === "new" && preview.existingBookId ? (
            <div className="admin-course-message admin-book-upload-warning">
              A book with id &quot;{preview.existingBookId}&quot; already exists. Saving will overwrite it.
            </div>
          ) : null}

          <div className="admin-book-upload-summary">
            {preview.pages.length} HTML pages found
            {uploadMode === "existing"
              ? ` · ${existingMappings.filter((mapping) => mapping.matched).length} matched to existing pages`
              : ""}
          </div>

          <ul className="admin-book-upload-page-list">
            {(uploadMode === "existing" ? existingMappings : preview.pages).slice(0, 12).map((item, index) => {
              if ("matched" in item) {
                return (
                  <li key={`${item.fileName}-${index}`}>
                    <strong>{item.matched ? `Page ${item.pageNumber}` : "No match"}</strong>
                    <span>{item.fileName}</span>
                    <span>{item.matched ? item.stepTitle ?? "HTML page" : "Could not map to book page"}</span>
                  </li>
                );
              }

              const page = item;
              return (
                <li key={`${page.relativePath}-${index}`}>
                  <strong>{page.pageNumber !== Number.MAX_SAFE_INTEGER ? `Page ${page.pageNumber}` : `Page ${index + 1}`}</strong>
                  <span>{page.fileName}</span>
                  <span>{page.title}</span>
                </li>
              );
            })}
            {(uploadMode === "existing" ? existingMappings : preview.pages).length > 12 ? (
              <li className="admin-book-upload-more">…and {(uploadMode === "existing" ? existingMappings : preview.pages).length - 12} more pages</li>
            ) : null}
          </ul>

          <div className="admin-book-upload-footer">
            <button type="button" className="admin-btn admin-btn-book secondary small" onClick={() => handleApply(false)}>
              {uploadMode === "existing" ? "Apply to Draft" : "Load as Draft"}
            </button>
            <button type="button" className="admin-btn admin-btn-book small" onClick={() => handleApply(true)}>
              {uploadMode === "existing" ? "Apply & Save Book" : "Create & Save Book"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
