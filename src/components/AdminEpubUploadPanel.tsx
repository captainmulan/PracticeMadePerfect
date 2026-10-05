import { useEffect, useMemo, useRef, useState } from "react";
import type { Course, CourseChapter, CourseStep } from "../data/courses";
import { resolveImportBookHtmlFolder } from "../utils/htmlStepContent";
import { buildCourseFromPreview, type BookImportPreview } from "../utils/bookImport";
import { buildEpubImportPreview, resolveEpubAssetDirectory, writeEpubAssetToDirectory, type EpubAssetExportProgress, type EpubImportPreview } from "../utils/epubImport";
import { loadFullCourseById } from "../utils/sqliteBrowserCourses";
import { getBookAssetUrl } from "../config/externalHosting";

type UploadMode = "new" | "existing";

interface AdminEpubUploadPanelProps {
  books: Course[];
  selectedBookId: string | null;
  loadedBook?: Course | null;
  forcedMode?: UploadMode;
  onImported: (course: Course, summary: string, saveImmediately: boolean) => void;
  onCancel: () => void;
}

function buildEpubReplacementCourse(course: Course, preview: EpubImportPreview, folder: string): Course {
  const epubUrl = getBookAssetUrl(`${folder}/${preview.epubFileName}`);
  const chapters: CourseChapter[] = preview.pages.map((page, index) => {
    const pageNumber = page.pageNumber !== Number.MAX_SAFE_INTEGER ? page.pageNumber : index + 1;
    const title = page.title?.trim() || `Page ${pageNumber}`;
    const chapterIndex = index;
    const chapterId = `${course.id}-epub-page-${String(pageNumber).padStart(3, "0")}`;
    const href = page.content.match(/#(.+)$/)?.[1] ?? "";
    const step: CourseStep = {
      id: `${chapterId}-step`,
      courseId: course.id,
      chapterId,
      chapterTitle: title,
      chapterIndex,
      stepIndex: pageNumber,
      stepType: "epub",
      title,
      description: "",
      contentHtml: `${epubUrl}${href ? `#${href}` : ""}`,
    };
    return { id: chapterId, courseId: course.id, chapterIndex, title, steps: [step] };
  });

  return {
    ...course,
    bookHtmlFolder: folder,
    stepCount: chapters.length,
    chapters,
  };
}

export default function AdminEpubUploadPanel({
  books,
  selectedBookId,
  loadedBook = null,
  forcedMode,
  onImported,
  onCancel,
}: AdminEpubUploadPanelProps) {
  const epubInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>(forcedMode ?? "new");
  const [targetBookId, setTargetBookId] = useState(selectedBookId ?? "");
  const [targetBookFull, setTargetBookFull] = useState<Course | null>(null);
  const [targetBookLoading, setTargetBookLoading] = useState(false);
  const [preview, setPreview] = useState<EpubImportPreview | null>(null);
  const [category, setCategory] = useState("IT");
  const [bookId, setBookId] = useState("");
  const [selectedEpub, setSelectedEpub] = useState<File | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isExportingAssets, setIsExportingAssets] = useState(false);
  const [assetExportProgress, setAssetExportProgress] = useState<EpubAssetExportProgress | null>(null);
  const [error, setError] = useState("");

  const targetBookSummary = useMemo(
    () => books.find((book) => book.id === targetBookId) ?? null,
    [books, targetBookId],
  );

  useEffect(() => {
    if (forcedMode && forcedMode !== uploadMode) {
      setUploadMode(forcedMode);
      if (forcedMode === "existing") {
        setTargetBookId(selectedBookId ?? books[0]?.id ?? "");
      }
      setError("");
    }
  }, [forcedMode, uploadMode, selectedBookId, books]);

  useEffect(() => {
    if (uploadMode !== "existing" || !targetBookId) {
      setTargetBookFull(null);
      setTargetBookLoading(false);
      return;
    }

    if (loadedBook?.id === targetBookId && loadedBook.chapters.length > 0) {
      setTargetBookFull(loadedBook);
      setTargetBookLoading(false);
      return;
    }

    let cancelled = false;
    setTargetBookLoading(true);
    loadFullCourseById(targetBookId)
      .then((book) => {
        if (!cancelled) setTargetBookFull(book);
      })
      .catch((err) => {
        if (!cancelled) {
          setTargetBookFull(null);
          setError(String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setTargetBookLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uploadMode, targetBookId, loadedBook]);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsReading(true);
    setError("");
    setSelectedEpub(file);

    try {
      const nextPreview = await buildEpubImportPreview(file, books.length, books.map((book) => book.id), {
        preferredFolder: file.name.replace(/\.epub$/i, ""),
        preferSpine: uploadMode === "existing",
      });
      if (!nextPreview) {
        setError("No pages could be read from the selected EPUB.");
        setPreview(null);
        return;
      }
      setPreview(nextPreview as EpubImportPreview);
      setBookId(nextPreview.bookId);
    } catch (err) {
      setError(String(err));
      setPreview(null);
    } finally {
      setIsReading(false);
    }
  }

  async function handleApply(saveImmediately: boolean) {
    if (!preview || !selectedEpub) {
      setError("Choose an EPUB file before applying.");
      return;
    }

    setError("");
    setIsExportingAssets(true);
    setAssetExportProgress(null);

    try {
      const folder = resolveImportBookHtmlFolder(
        uploadMode === "existing" ? targetBookFull : null,
        preview.folderName,
        category,
      );
      const assetDirectory = await resolveEpubAssetDirectory();
      if (!assetDirectory?.directoryHandle) {
        throw new Error("EPUB was not saved: grant access to the project's book_html folder and retry.");
      }
      const assetCount = 1;
      setAssetExportProgress({ completed: 0, total: assetCount });
      const assetResult = await writeEpubAssetToDirectory(
        assetDirectory.directoryHandle,
        folder,
        preview.epubFileName,
        selectedEpub,
        (progress: EpubAssetExportProgress) => {
          setAssetExportProgress(progress);
        },
      );
      if (assetResult.written !== assetCount || assetResult.errors.length > 0) {
        throw new Error(`EPUB was not saved: ${assetResult.errors.join("; ") || "asset write did not complete."}`);
      }

      if (uploadMode === "existing") {
        if (!targetBookSummary) {
          setError("Select an existing book to update.");
          return;
        }
        if (targetBookLoading || !targetBookFull) {
          setError("Loading book pages for matching. Try again in a moment.");
          return;
        }

        const replacement = buildEpubReplacementCourse(targetBookFull, preview, folder);
        const summary = saveImmediately
          ? `Replaced "${targetBookFull.title}" with ${replacement.stepCount} sequential EPUB page(s).`
          : `Loaded ${replacement.stepCount} sequential EPUB page(s) for "${targetBookFull.title}". Review, then click Save Book.`;

        onImported(replacement, summary, saveImmediately);
        return;
      }

      const trimmedId = bookId.trim() || preview.bookId;
      if (!trimmedId) {
        setError("Book id is required.");
        return;
      }

      const course = buildCourseFromPreview(
        { ...preview, pages: preview.pages.map((page) => ({ ...page, content: page.content, assets: [] })) },
        books.length,
        category,
        trimmedId,
      );
      const summary = saveImmediately
        ? `Uploaded and saved "${course.title}" with ${preview.pages.length} chapter page(s) from EPUB.`
        : `Loaded "${course.title}" with ${preview.pages.length} chapter page(s) from EPUB (table of contents). Review pages, then click Save Book.`;

      onImported({ ...course, bookHtmlFolder: folder }, summary, saveImmediately);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsExportingAssets(false);
    }
  }

  return (
    <div className="admin-book-upload panel-bordered">
      <div className="admin-book-upload-header">
        <h3>EPUB upload</h3>
        <button type="button" className="admin-btn admin-btn-book secondary small" onClick={onCancel}>
          Close
        </button>
      </div>

      {!forcedMode ? (
        <div className="admin-book-upload-mode">
          <label className="admin-book-upload-mode-option">
            <input
              type="radio"
              name="epub-upload-mode"
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
              name="epub-upload-mode"
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
      ) : null}

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
          ? "Choose an EPUB file. The original EPUB is stored in the book folder and rendered through the built-in EPUB viewer."
          : "Choose an EPUB file to update an existing book. The selected book will keep the original EPUB asset and open it through the built-in EPUB viewer."}
      </p>

      <div className="admin-book-upload-actions">
        <input
          ref={epubInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          hidden
          onChange={handleFileSelect}
        />
        <button
          type="button"
          className="admin-btn admin-btn-book small"
          onClick={() => epubInputRef.current?.click()}
          disabled={isReading}
        >
          {isReading ? "Reading EPUB..." : selectedEpub ? selectedEpub.name : "Choose EPUB"}
        </button>
      </div>

      {error ? <div className="admin-course-message admin-book-upload-error">{error}</div> : null}

      {preview ? (
        <div className="admin-book-upload-preview">
          {uploadMode === "new" ? (
            <div className="admin-book-upload-meta">
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
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="admin-grid-input"
                  placeholder="Myanmar, Kid, Comic"
                />
              </label>
            </div>
          ) : (
            <div className="admin-book-upload-meta">
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Target book</span>
                <input value={targetBookSummary?.title ?? "Select a book"} readOnly className="admin-grid-input" />
              </label>
              {targetBookLoading ? (
                <div className="admin-course-message">Loading book pages for matching...</div>
              ) : null}
            </div>
          )}

          <div className="admin-book-upload-summary">
            EPUB ready for built-in viewer
          </div>

          {isExportingAssets && assetExportProgress ? (
            <div className="admin-book-upload-progress" style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "6px" }}>
                <span>Saving original EPUB asset</span>
                <span>{assetExportProgress.completed}/{assetExportProgress.total}</span>
              </div>
              <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                <div style={{ width: `${assetExportProgress.total ? Math.round((assetExportProgress.completed / assetExportProgress.total) * 100) : 0}%`, height: "100%", background: "#2563eb", transition: "width 0.2s ease" }} />
              </div>
            </div>
          ) : null}

          <ul className="admin-book-upload-page-list">
            {preview.pages.slice(0, 12).map((page, index) => (
              <li key={`${page.fileName}-${index}`}>
                <strong>Page {page.pageNumber !== Number.MAX_SAFE_INTEGER ? page.pageNumber : index + 1}</strong>
                <span>{page.fileName}</span>
                <span>{page.title}</span>
              </li>
            ))}
            {preview.pages.length > 12 ? (
              <li className="admin-book-upload-more">…and {preview.pages.length - 12} more pages</li>
            ) : null}
          </ul>

          <div className="admin-book-upload-footer">
            <button type="button" className="admin-btn admin-btn-book secondary small" onClick={() => handleApply(false)} disabled={uploadMode === "existing" && targetBookLoading}>
              {uploadMode === "existing" ? "Apply to Draft" : "Load as Draft"}
            </button>
            <button type="button" className="admin-btn admin-btn-book small" onClick={() => handleApply(true)} disabled={uploadMode === "existing" && targetBookLoading}>
              {uploadMode === "existing" ? "Apply & Save Book" : "Create & Save Book"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
