import { useEffect, useMemo, useRef, useState } from "react";
import type { Course, CourseChapter, CourseStep } from "../data/courses";
import { resolveImportBookHtmlFolder } from "../utils/htmlStepContent";
import { buildCourseFromEpubPreview, type BookImportChapterPlan, type BookImportPreview } from "../utils/bookImport";
import { buildEpubImportPreview, resolveEpubAssetDirectory, slugify, writeEpubAssetToDirectory, type EpubAssetExportProgress, type EpubImportPreview } from "../utils/epubImport";
import { loadFullCourseById } from "../utils/sqliteBrowserCourses";
import { evictEpubBuffer } from "../utils/epubCache";
import { getBookAssetUrl } from "../config/externalHosting";
import { collectCategoryChildren, collectTopCategoryNames, formatCategoryLabel } from "../utils/bookCategories";

type UploadMode = "new" | "existing";

const CATALOG_LEVELS = [0, 1, 2, 3];

interface AdminEpubUploadPanelProps {
  books: Course[];
  selectedBookId: string | null;
  loadedBook?: Course | null;
  forcedMode?: UploadMode;
  onImported: (course: Course, summary: string, saveImmediately: boolean, keepUploadOpen?: boolean) => void | Promise<void>;
  onCancel: () => void;
}

/** Chapters become reader steppers; every page inside a chapter becomes a step. */
function buildEpubChapters(
  courseId: string,
  preview: EpubImportPreview,
  fallbackTitle: string,
  assetUrl: string,
): CourseChapter[] {
  const contentFor = (href: string | undefined, fallback: string) =>
    href ? `${assetUrl}#${href}` : assetUrl || fallback;

  const plans: BookImportChapterPlan[] = preview.chapters?.length
    ? preview.chapters
    : [
        {
          title: fallbackTitle,
          pages: preview.pages.map((page) => ({
            title: page.title,
            href: page.content.match(/#(.+)$/)?.[1] ?? "",
            content: page.content,
          })),
        },
      ];

  let stepIndex = 0;
  return plans.map((plan, chapterIndex) => {
    const chapterId = `${courseId}-epub-chapter-${String(chapterIndex + 1).padStart(3, "0")}`;
    const steps: CourseStep[] = plan.pages.map((page) => {
      stepIndex += 1;
      const step: CourseStep = {
        id: `${courseId}-epub-page-${String(stepIndex).padStart(3, "0")}`,
        courseId,
        chapterId,
        chapterTitle: plan.title,
        chapterIndex,
        stepIndex,
        stepType: "epub",
        title: page.title,
        description: "",
        contentHtml: contentFor(page.href, page.content),
        ...(page.nextHref ? { epubNextLocation: page.nextHref } : {}),
      };
      return step;
    });

    return { id: chapterId, courseId, chapterIndex, title: plan.title, steps };
  });
}

function buildEpubReplacementCourse(course: Course, preview: EpubImportPreview, folder: string, savedCoverPath?: string): Course {
  const chapters = buildEpubChapters(
    course.id,
    preview,
    course.title,
    getBookAssetUrl(`${folder}/${preview.epubFileName}`),
  );

  return {
    ...course,
    bookHtmlFolder: folder,
    coverImageUrl: savedCoverPath || preview.coverImageUrl || course.coverImageUrl,
    stepCount: chapters.reduce((total, chapter) => total + chapter.steps.length, 0),
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
  const [multipleUpload, setMultipleUpload] = useState(false);
  const [targetBookId, setTargetBookId] = useState(selectedBookId ?? "");
  const [targetBookFull, setTargetBookFull] = useState<Course | null>(null);
  const [targetBookLoading, setTargetBookLoading] = useState(false);
  const [preview, setPreview] = useState<EpubImportPreview | null>(null);
  const [storageRoot, setStorageRoot] = useState<"Other" | "Comic">("Other");
  const [catalogPath, setCatalogPath] = useState<string[]>(["IT", "", "", ""]);
  const [language, setLanguage] = useState<"Eng" | "MM">("Eng");
  const [categoryOverride, setCategoryOverride] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookId, setBookId] = useState("");
  const [selectedEpub, setSelectedEpub] = useState<File | null>(null);
  const [selectedEpubs, setSelectedEpubs] = useState<File[]>([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isExportingAssets, setIsExportingAssets] = useState(false);
  const [assetExportProgress, setAssetExportProgress] = useState<EpubAssetExportProgress | null>(null);
  const [error, setError] = useState("");

  /* Legacy tag column + Comic/Other asset routing both read this value. */
  const category = categoryOverride.trim() || catalogPath.filter(Boolean).join(", ");
  const catalogPathLabel = catalogPath.filter(Boolean).map(formatCategoryLabel).join(" > ");

  const catalogOptions = CATALOG_LEVELS.map((level) =>
    level === 0
      ? collectTopCategoryNames(books)
      : collectCategoryChildren(books, catalogPath.slice(0, level).filter(Boolean)),
  );

  function setCatalogLevel(level: number, value: string) {
    setCatalogPath((current) => {
      const next = [...current];
      next[level] = value.trim();
      /* Deeper levels belong to the previous choice. */
      for (let index = level + 1; index < CATALOG_LEVELS.length; index += 1) next[index] = "";
      return next;
    });
  }

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
    if (multipleUpload && uploadMode === "new") {
      const files = Array.from(event.target.files ?? []).filter((file) =>
        file.name.toLowerCase().endsWith(".epub") || file.type === "application/epub+zip",
      );
      event.target.value = "";
      setSelectedEpubs((current) => {
        const next = [...current];
        for (const file of files) {
          if (!next.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) {
            next.push(file);
          }
        }
        return next;
      });
      setError(files.length ? "" : "Choose one or more EPUB files.");
      return;
    }

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
        preferSpine: false,
      });
      if (!nextPreview) {
        setError("No pages could be read from the selected EPUB.");
        setPreview(null);
        return;
      }
      setPreview(nextPreview as EpubImportPreview);
      setBookTitle(nextPreview.bookTitle);
      setBookId(nextPreview.bookId);
    } catch (err) {
      setError(String(err));
      setPreview(null);
    } finally {
      setIsReading(false);
    }
  }

  async function exportEpubAssets(
    file: File,
    epubPreview: EpubImportPreview,
    safeId: string,
    categoryValue: string,
    storageRootValue: "Other" | "Comic",
    targetCourse: Course | null = null,
  ) {
    const safeEpubFileName = `${slugify((epubPreview.epubFileName || "book").replace(/\.epub$/i, "")) || (epubPreview.epubFileName || "book").replace(/\.epub$/i, "")}.epub`;
    const folder = resolveImportBookHtmlFolder(targetCourse, safeId, categoryValue, storageRootValue);
    const assetDirectory = await resolveEpubAssetDirectory();
    if (!assetDirectory?.directoryHandle) {
      throw new Error("EPUB was not saved: grant access to the project's root folder and retry.");
    }

    const coverFileName = `${safeId}.webp`;
    const coverFolder = "/book_covers/thumbs";
    const assetCount = epubPreview.coverImageUrl?.startsWith("data:") ? 2 : 1;
    if (multipleUpload) setBatchStatus(`Saving EPUB assets: ${file.name}`);
    setAssetExportProgress({ completed: 0, total: assetCount, currentFileName: file.name });
    const assetResult = await writeEpubAssetToDirectory(
      assetDirectory.directoryHandle,
      folder,
      safeEpubFileName,
      epubPreview.modifiedEpubData
        ? new File([epubPreview.modifiedEpubData.buffer as ArrayBuffer], safeEpubFileName, { type: "application/epub+zip" })
        : file,
      epubPreview.coverImageUrl,
      (progress) => setAssetExportProgress({ ...progress, currentFileName: file.name }),
      { folder: coverFolder, fileName: coverFileName },
    );

    if (assetResult.written > 0) {
      evictEpubBuffer(getBookAssetUrl(`${folder}/${safeEpubFileName}`));
    }
    if (assetResult.written !== assetCount || assetResult.errors.length > 0) {
      throw new Error(`EPUB was not saved: ${assetResult.errors.join("; ") || "asset write did not complete."}`);
    }

    return {
      folder,
      safeEpubFileName,
      savedCoverPath: assetResult.written >= assetCount && epubPreview.coverImageUrl?.startsWith("data:")
        ? `${coverFolder}/${coverFileName}`
        : epubPreview.coverImageUrl,
    };
  }

  async function createNewEpubCourse(
    file: File,
    epubPreview: EpubImportPreview,
    title: string,
    id: string,
    courseIndex: number,
    categoryValue: string,
    root: "Other" | "Comic",
    selectedLanguage: "Eng" | "MM",
    selectedCatalogPath: string[],
  ): Promise<Course> {
    const safeId = slugify(id) || id;
    const assets = await exportEpubAssets(file, epubPreview, safeId, categoryValue, root);
    const course = buildCourseFromEpubPreview(
      {
        ...epubPreview,
        bookTitle: title,
        epubFileName: assets.safeEpubFileName,
        pages: epubPreview.pages.map((page) => ({ ...page, assets: [] })),
      },
      courseIndex,
      categoryValue,
      safeId,
      {
        coverImageUrl: assets.savedCoverPath,
        epubAssetUrl: getBookAssetUrl(`${assets.folder}/${assets.safeEpubFileName}`),
        language: selectedLanguage,
        cat1: selectedCatalogPath[0] || undefined,
        cat2: selectedCatalogPath[1] || undefined,
        cat3: selectedCatalogPath[2] || undefined,
        cat4: selectedCatalogPath[3] || undefined,
      },
    );
    return { ...course, bookHtmlFolder: assets.folder };
  }

  function makeUniqueBookId(baseId: string, reservedIds: Set<string>) {
    const safeBaseId = slugify(baseId) || "imported-book";
    let candidate = safeBaseId;
    let suffix = 2;
    while (reservedIds.has(candidate.toLowerCase())) {
      candidate = `${safeBaseId}-${suffix}`;
      suffix += 1;
    }
    reservedIds.add(candidate.toLowerCase());
    return candidate;
  }

  async function handleBatchUpload() {
    if (!selectedEpubs.length || isBatchUploading) return;
    setIsBatchUploading(true);
    setIsExportingAssets(true);
    setError("");
    setBatchStatus("");
    setBatchProgress(0);

    const reservedIds = new Set(books.map((book) => book.id.toLowerCase()));
    const successfulTitles: string[] = [];
    const failures: string[] = [];
    const failedFiles: File[] = [];
    const batchCategory = "Other, Novel";
    const batchCatalogPath = ["Other", "Novel", "", ""];

    try {
      const assetDirectory = await resolveEpubAssetDirectory();
      if (!assetDirectory?.directoryHandle) {
        throw new Error("EPUBs were not saved: grant access to the project's root folder and retry.");
      }
      setBatchStatus("Project folder is ready. Starting EPUB batch...");

      for (let index = 0; index < selectedEpubs.length; index += 1) {
        const file = selectedEpubs[index];
        try {
          setBatchStatus(`Parsing EPUB ${index + 1}/${selectedEpubs.length}: ${file.name}`);
          const parsed = await buildEpubImportPreview(
            file,
            books.length + successfulTitles.length,
            [...reservedIds],
            { preferredFolder: file.name.replace(/\.epub$/i, ""), preferSpine: false, zipOnly: true },
          );
          if (!parsed) throw new Error("No pages could be read from this EPUB.");

          const uniqueId = makeUniqueBookId(parsed.bookId || file.name.replace(/\.epub$/i, ""), reservedIds);
          const course = await createNewEpubCourse(
            file,
            parsed,
            parsed.bookTitle || file.name.replace(/\.epub$/i, ""),
            uniqueId,
            books.length + successfulTitles.length,
            batchCategory,
            "Other",
            "MM",
            batchCatalogPath,
          );
          setBatchStatus(`Saving book ${index + 1}/${selectedEpubs.length}: ${course.title}`);
          await onImported(
            course,
            `Uploaded and saved "${course.title}" with ${course.chapters.length} chapter(s) / ${parsed.pageCount} page(s) from EPUB.`,
            true,
            true,
          );
          successfulTitles.push(course.title);
        } catch (err) {
          failures.push(`${file.name}: ${String(err)}`);
          failedFiles.push(file);
        }
        setBatchProgress(index + 1);
      }

      const result = `${successfulTitles.length} of ${selectedEpubs.length} EPUBs saved.`;
      setBatchStatus(result);
      setError(failures.join("\n"));
      setSelectedEpubs(failedFiles);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsBatchUploading(false);
      setIsExportingAssets(false);
      setAssetExportProgress(null);
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
      const trimmedId = bookId.trim() || preview.bookId;
      if (!trimmedId) {
        setError("Book id is required.");
        return;
      }
      const trimmedTitle = bookTitle.trim();
      if (!trimmedTitle) {
        setError("Book name is required.");
        return;
      }

      if (uploadMode === "existing") {
        const safeId = slugify(trimmedId) || trimmedId;
        if (!targetBookSummary) {
          setError("Select an existing book to update.");
          return;
        }
        if (targetBookLoading || !targetBookFull) {
          setError("Loading book pages for matching. Try again in a moment.");
          return;
        }

        const assets = await exportEpubAssets(selectedEpub, preview, safeId, category, storageRoot, targetBookFull);

        const replacement = buildEpubReplacementCourse(
          targetBookFull,
          { ...preview, epubFileName: assets.safeEpubFileName },
          assets.folder,
          assets.savedCoverPath,
        );
        const summary = saveImmediately
          ? `Replaced "${targetBookFull.title}" with ${replacement.stepCount} sequential EPUB page(s).`
          : `Loaded ${replacement.stepCount} sequential EPUB page(s) for "${targetBookFull.title}". Review, then click Save Book.`;

        await onImported(replacement, summary, saveImmediately);
        return;
      }

      const course = await createNewEpubCourse(
        selectedEpub,
        preview,
        trimmedTitle,
        trimmedId,
        books.length,
        category,
        storageRoot,
        language,
        catalogPath,
      );
      const summary = saveImmediately
        ? `Uploaded and saved "${course.title}" with ${course.chapters.length} chapter(s) / ${preview.pageCount} page(s) from EPUB.`
        : `Loaded "${course.title}" with ${course.chapters.length} chapter(s) / ${preview.pageCount} page(s) from EPUB. Review pages, then click Save Book.`;

      await onImported(course, summary, saveImmediately);
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

      {uploadMode === "new" ? (
        <div className="admin-book-upload-mode" role="group" aria-label="EPUB upload type">
          <button
            type="button"
            className={`admin-btn admin-btn-book small${multipleUpload ? " secondary" : ""}`}
            aria-pressed={!multipleUpload}
            disabled={isBatchUploading}
            onClick={() => {
              setMultipleUpload(false);
              setSelectedEpubs([]);
              setBatchStatus("");
              setError("");
            }}
          >
            Single EPUB
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-book small${multipleUpload ? "" : " secondary"}`}
            aria-pressed={multipleUpload}
            disabled={isBatchUploading}
            onClick={() => {
              setMultipleUpload(true);
              setPreview(null);
              setSelectedEpub(null);
              setBatchStatus("");
              setError("");
            }}
          >
            Multiple EPUBs
          </button>
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
          ? multipleUpload
            ? "Select multiple EPUB files and save them as separate books."
            : "Choose an EPUB file. The original EPUB is stored in the book folder and rendered through the built-in EPUB viewer."
          : "Choose an EPUB file to update an existing book. The selected book will keep the original EPUB asset and open it through the built-in EPUB viewer."}
      </p>

      <div className="admin-book-upload-actions">
        <input
          ref={epubInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          multiple={multipleUpload && uploadMode === "new"}
          hidden
          onChange={handleFileSelect}
        />
        {multipleUpload && uploadMode === "new" ? (
          <>
            <button
              type="button"
              className="admin-btn admin-btn-book small"
              onClick={() => epubInputRef.current?.click()}
              disabled={isBatchUploading}
            >
              Choose EPUB files
            </button>
            <span className="admin-task-editor-hint">
              {selectedEpubs.length ? `${selectedEpubs.length} EPUB file(s) selected` : "Select multiple .epub files in one go."}
            </span>
            <span className="admin-task-editor-hint" style={{ gridColumn: "1 / -1" }}>
              Defaults: Storage Other · Category Other, Novel · Language MM · Catalog Other / Novel
            </span>
          </>
        ) : (
          <button
            type="button"
            className="admin-btn admin-btn-book small"
            onClick={() => epubInputRef.current?.click()}
            disabled={isReading || isExportingAssets}
          >
            {isReading ? "Reading EPUB..." : selectedEpub ? selectedEpub.name : "Choose EPUB"}
          </button>
        )}
      </div>

      {multipleUpload && uploadMode === "new" && selectedEpubs.length ? (
        <div className="admin-book-upload-batch-list" aria-label="Selected EPUB files">
          {selectedEpubs.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
          <button
            type="button"
            className="admin-btn admin-btn-book secondary small"
            onClick={() => epubInputRef.current?.click()}
            disabled={isBatchUploading}
          >
            Add more
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-book secondary small"
            onClick={() => setSelectedEpubs([])}
            disabled={isBatchUploading}
          >
            Clear
          </button>
        </div>
      ) : null}

      {multipleUpload && uploadMode === "new" ? (
        <div className="admin-book-upload-footer">
          <button
            type="button"
            className="admin-btn admin-btn-book small"
            onClick={() => void handleBatchUpload()}
            disabled={!selectedEpubs.length || isBatchUploading}
          >
            {isBatchUploading
              ? `Processing ${Math.min(batchProgress + 1, selectedEpubs.length)}/${selectedEpubs.length}...`
              : selectedEpubs.length
                ? `Upload ${selectedEpubs.length} EPUBs`
                : "Upload EPUBs"}
          </button>
        </div>
      ) : null}

      {batchStatus ? <div className="admin-course-message" role="status">{batchStatus}</div> : null}

      {error ? <div className="admin-course-message admin-book-upload-error">{error}</div> : null}

      {preview ? (
        <div className="admin-book-upload-preview">
          {uploadMode === "new" ? (
            <div className="admin-book-upload-meta">
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Book name</span>
                <input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} className="admin-grid-input" />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Book id</span>
                <input value={bookId} onChange={(e) => setBookId(e.target.value)} className="admin-grid-input" />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Storage Root</span>
                <select
                  value={storageRoot}
                  onChange={(e) => setStorageRoot(e.target.value as "Other" | "Comic")}
                  className="admin-grid-select"
                >
                  <option value="Other">Other</option>
                  <option value="Comic">Comic</option>
                </select>
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Category Tags</span>
                <input
                  value={categoryOverride}
                  onChange={(e) => setCategoryOverride(e.target.value)}
                  className="admin-grid-input"
                  placeholder={catalogPath.filter(Boolean).join(", ")}
                />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "Eng" | "MM")}
                  className="admin-grid-select"
                >
                  <option value="Eng">Eng</option>
                  <option value="MM">MM</option>
                </select>
              </label>
              {CATALOG_LEVELS.map((level) => (
                <label key={level} className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Catalog {level + 1}</span>
                  <input
                    value={catalogPath[level] ?? ""}
                    onChange={(e) => setCatalogLevel(level, e.target.value)}
                    className="admin-grid-input"
                    list={`epub-catalog-${level}`}
                    placeholder={level === 0 ? "Kid" : level === 1 ? "JuniorNovel" : ""}
                  />
                  <datalist id={`epub-catalog-${level}`}>
                    {catalogOptions[level].map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>
              ))}
              <span className="admin-task-editor-hint" style={{ gridColumn: "1 / -1", opacity: 0.75, fontSize: 12 }}>
                Catalog path: {catalogPathLabel || "—"}
              </span>
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
            {preview.coverImageUrl ? (
              <img className="admin-book-upload-cover" src={preview.coverImageUrl} alt="EPUB cover" />
            ) : null}
            <span>
              {preview.chapterCount} chapter(s) · {preview.pageCount} page(s) ready for the built-in viewer
            </span>
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
            {(preview.chapters ?? []).slice(0, 12).map((chapter, index) => (
              <li key={`${chapter.title}-${index}`}>
                <strong>Chapter {index + 1}</strong>
                <span>{chapter.title}</span>
                <span>{chapter.pages.length} page(s)</span>
              </li>
            ))}
            {preview.chapters && preview.chapters.length > 12 ? (
              <li className="admin-book-upload-more">…and {preview.chapters.length - 12} more chapters</li>
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
