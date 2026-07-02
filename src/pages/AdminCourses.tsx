import { useEffect, useMemo, useState, useRef } from "react";
import type { Course, CourseChapter, CourseStep, CourseStepType } from "../data/courses";
import { flattenCourseSteps } from "../data/courses";
import { loadCoursesFromBrowserDb, persistCourse, removeCourse } from "../utils/sqliteBrowserCourses";
import { loadAdminData, saveAdminData } from "../utils/contentStore";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rebuildChaptersFromSteps(courseId: string, steps: CourseStep[]): CourseChapter[] {
  const chapterMap = new Map<string, CourseChapter>();
  steps.forEach((step) => {
    if (!chapterMap.has(step.chapterId)) {
      chapterMap.set(step.chapterId, {
        id: step.chapterId,
        courseId,
        chapterIndex: step.chapterIndex,
        title: step.chapterTitle,
        steps: [],
      });
    }
    chapterMap.get(step.chapterId)!.steps.push(step);
  });
  return [...chapterMap.values()].map((chapter) => ({
    ...chapter,
    steps: chapter.steps.slice().sort((a, b) => a.stepIndex - b.stepIndex),
  }));
}

export default function AdminCourses() {
  const [books, setBooks] = useState<Course[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [draftBook, setDraftBook] = useState<Course | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [bookBuilderTab, setBookBuilderTab] = useState<"book" | "chapter" | "empty-book">("book");
  const [adminData, setAdminData] = useState<any>(null);
  const stepTypeSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    loadCoursesFromBrowserDb()
      .then((data) => {
        setBooks(data);
        if (data.length > 0) setSelectedBookId(data[0].id);
        setLoaded(true);
      })
      .catch((err) => setMessage(String(err)));
      
    const defaultData = loadAdminData();
    setAdminData(defaultData);
  }, []);

  const activeBook = draftBook ?? books.find((c) => c.id === selectedBookId) ?? null;
  const flatSteps = useMemo(() => (activeBook ? flattenCourseSteps(activeBook) : []), [activeBook]);
  const selectedStep = flatSteps.find((step) => step.id === selectedStepId) ?? null;
  
  function updateStyleConfig(key: string, value: string | boolean | number) {
    if (!adminData) return;
    const newAdminData = { ...adminData };
    if (!newAdminData.homePageData) {
      newAdminData.homePageData = {};
    }
    if (!newAdminData.homePageData.style) {
      newAdminData.homePageData.style = {};
    }
    if (!newAdminData.homePageData.style.emptyBook) {
      newAdminData.homePageData.style.emptyBook = {};
    }
    newAdminData.homePageData.style.emptyBook[key] = value;
    setAdminData(newAdminData);
    saveAdminData(newAdminData);
  }

  function startNewBook() {
    const book: Course = {
      id: "",
      title: "New book",
      description: "",
      color: "#2563eb",
      coverColorStart: "#2563eb",
      coverColorMiddle: "#2563eb",
      coverColorEnd: "#2563eb",
      icon: "📘",
      iconColorStart: "#fff",
      iconColorMiddle: "#fff",
      iconColorEnd: "#fff",
      iconSize: 80,
      titleFontSize: 24,
      titleFontWeight: "bold",
      titleColor: "#ffffff",
      titlePosition: "bottom-left",
      titleTextAlign: "left",
      iconPosition: "center-center",
      courseIndex: books.length,
      category: "IT",
      chapters: [],
    };
    setDraftBook(book);
    setSelectedBookId(null);
    setSelectedStepId(null);
    setMessage("");
  }

  function updateActiveBook(updater: (book: Course) => Course) {
    if (!activeBook) return;
    const next = updater(activeBook);
    if (draftBook) {
      setDraftBook(next);
    } else {
      setBooks((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    }
  }

  function updateStep(stepId: string, patch: Partial<CourseStep>) {
    if (!activeBook) return;
    const steps = flattenCourseSteps(activeBook).map((step) =>
      step.id === stepId ? ({ ...step, ...patch } as CourseStep) : step,
    );
    updateActiveBook((book) => ({
      ...book,
      chapters: rebuildChaptersFromSteps(book.id, steps),
    }));
  }

  function addChapter() {
    if (!activeBook) return;
    const chapterIndex = activeBook.chapters.length;
    const chapterId = `${activeBook.id || "book"}-ch-${Date.now()}`;
    const chapter: CourseChapter = {
      id: chapterId,
      courseId: activeBook.id,
      chapterIndex,
      title: `Chapter ${chapterIndex + 1}`,
      steps: [],
    };
    updateActiveBook((book) => ({
      ...book,
      chapters: [...book.chapters, chapter],
    }));
  }

  function addStep(stepType: CourseStepType) {
    if (!activeBook) return;
    const chapter = activeBook.chapters[activeBook.chapters.length - 1];
    if (!chapter) {
      setMessage("Add a chapter first.");
      return;
    }
    const stepIndex = chapter.steps.length;
    const step: CourseStep = {
      id: `${chapter.id}-step-${Date.now()}`,
      courseId: activeBook.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex: chapter.chapterIndex,
      stepIndex,
      stepType,
      title: stepType === "html" ? "Lesson" : stepType === "code-exam" ? "Code exam" : "Quiz",
      description: "",
      contentHtml: stepType === "html" ? "<p>Lesson content</p>" : undefined,
      checklist: stepType === "code-exam" ? ["Meets requirement"] : undefined,
      verificationKeywords: stepType === "code-exam" ? [["export"]] : undefined,
      codeType: "code",
      quizQuestions: stepType === "quiz"
        ? [{
            id: "q1",
            prompt: "Sample question?",
            options: [{ id: "a", text: "Yes" }, { id: "b", text: "No" }],
            correctOptionId: "a",
          }]
        : undefined,
    };
    updateActiveBook((book) => ({
      ...book,
      chapters: book.chapters.map((ch) =>
        ch.id === chapter.id ? { ...ch, steps: [...ch.steps, step] } : ch,
      ),
    }));
    setSelectedStepId(step.id);
    // Reset select
    if (stepTypeSelectRef.current) {
      stepTypeSelectRef.current.value = "";
    }
  }

  async function handleSaveBook() {
    if (!activeBook) return;
    const trimmedId = activeBook.id.trim() || slugify(activeBook.title);
    if (!trimmedId) {
      setMessage("Book id or title is required.");
      return;
    }
    const normalized: Course = {
      ...activeBook,
      id: trimmedId,
      chapters: activeBook.chapters.map((chapter) => ({
        ...chapter,
        courseId: trimmedId,
        steps: chapter.steps.map((step) => ({
          ...step,
          courseId: trimmedId,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: chapter.chapterIndex,
        })),
      })),
    };
    try {
      await persistCourse(normalized);
      const refreshed = await loadCoursesFromBrowserDb();
      setBooks(refreshed);
      setDraftBook(null);
      setSelectedBookId(trimmedId);
      setMessage("Book saved.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  async function handleDeleteBook() {
    if (!activeBook?.id || draftBook) return;
    try {
      await removeCourse(activeBook.id);
      const refreshed = await loadCoursesFromBrowserDb();
      setBooks(refreshed);
      setSelectedBookId(refreshed[0]?.id ?? null);
      setSelectedStepId(null);
      setMessage("Book deleted.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  function handleResetDatabase() {
    if (window.confirm("Are you sure you want to reset the database? This will delete all custom books and restore defaults.")) {
      localStorage.removeItem('magic-library-db');
      window.location.reload();
    }
  }

  if (!loaded) {
    return <div className="admin-section-body">Loading books...</div>;
  }

  return (
    <div className="admin-courses">
      <div className="admin-courses-toolbar">
        <select
          value={draftBook ? "__draft__" : selectedBookId ?? ""}
          onChange={(e) => {
            if (e.target.value === "__draft__") return;
            setDraftBook(null);
            setSelectedBookId(e.target.value);
            setSelectedStepId(null);
          }}
        >
          {draftBook ? <option value="__draft__">New book (draft)</option> : null}
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </select>
        <div className="admin-book-actions">
          <button type="button" className="footer-button secondary small" onClick={handleResetDatabase}>Reset Database</button>
          <button type="button" className="footer-button secondary small" onClick={startNewBook}>New Book</button>
          <button type="button" className="footer-button small" onClick={handleSaveBook}>Save Book</button>
          {!draftBook && activeBook ? (
            <button type="button" className="footer-button secondary small" onClick={handleDeleteBook}>Delete</button>
          ) : null}
        </div>
      </div>

      {message && <div className="admin-course-message">{message}</div>}

      {activeBook ? (
        <div className={`admin-courses-grid ${bookBuilderTab === "book" || bookBuilderTab === "empty-book" ? "admin-courses-grid-book-only" : ""}`}>
          <section className="admin-course-meta panel-bordered">
            <div className="admin-tabs" style={{ marginBottom: "16px" }}>
              <button type="button" className={`admin-tab ${bookBuilderTab === "book" ? "active" : ""}`} onClick={() => setBookBuilderTab("book")}>Book</button>
              <button type="button" className={`admin-tab ${bookBuilderTab === "chapter" ? "active" : ""}`} onClick={() => setBookBuilderTab("chapter")}>Chapter</button>
              <button type="button" className={`admin-tab ${bookBuilderTab === "empty-book" ? "active" : ""}`} onClick={() => setBookBuilderTab("empty-book")}>Empty Book</button>
            </div>
            {bookBuilderTab === "book" ? (
              <>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>General</h4>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">ID</span>
                    <input
                      value={activeBook.id}
                      onChange={(e) => updateActiveBook((c) => ({ ...c, id: e.target.value }))}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Category</span>
                    <select
                      value={activeBook.category}
                      onChange={(e) => updateActiveBook((c) => ({ ...c, category: e.target.value }))}
                      className="admin-grid-select"
                    >
                      <option value="IT">IT</option>
                      <option value="Language">Language</option>
                      <option value="Kid">Kid</option>
                      <option value="Migration">Migration</option>
                      <option value="Fiction">Fiction</option>
                    </select>
                  </label>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Book Index</span>
                    <input
                      type="number"
                      value={activeBook.courseIndex}
                      onChange={(e) => updateActiveBook((c) => ({ ...c, courseIndex: Number(e.target.value) }))}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Description</span>
                    <textarea
                      rows={3}
                      value={activeBook.description}
                      onChange={(e) => updateActiveBook((c) => ({ ...c, description: e.target.value }))}
                      className="admin-grid-input"
                    />
                  </label>
                </div>

                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Title</h4>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Title</span>
                    <input
                      value={activeBook.title}
                      onChange={(e) => updateActiveBook((c) => ({ ...c, title: e.target.value }))}
                      className="admin-grid-input"
                    />
                  </label>
                  <div className="admin-course-meta-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title font size</span>
                      <input
                        type="number"
                        min={12}
                        max={48}
                        value={activeBook.titleFontSize ?? 24}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleFontSize: Number(e.target.value) }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title font weight</span>
                      <select
                        value={activeBook.titleFontWeight ?? "bold"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleFontWeight: e.target.value }))}
                        className="admin-grid-select"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Lighter</option>
                        <option value="bolder">Bolder</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                        <option value="900">900</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title color</span>
                      <input
                        type="color"
                        value={activeBook.titleColor ?? "#0f172a"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleColor: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Cover Colors</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color Start</span>
                      <input
                        type="color"
                        value={activeBook.coverColorStart ?? "#2563eb"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, coverColorStart: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color Middle</span>
                      <input
                        type="color"
                        value={activeBook.coverColorMiddle ?? "#2563eb"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, coverColorMiddle: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color End</span>
                      <input
                        type="color"
                        value={activeBook.coverColorEnd ?? "#2563eb"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, coverColorEnd: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Title</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Font Size</span>
                      <input
                        type="number"
                        min={12}
                        max={48}
                        value={activeBook.titleFontSize ?? 24}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleFontSize: Number(e.target.value) }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Font Weight</span>
                      <select
                        value={activeBook.titleFontWeight ?? "bold"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleFontWeight: e.target.value }))}
                        className="admin-grid-select"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                        <option value="900">900</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Color</span>
                      <input
                        type="color"
                        value={activeBook.titleColor ?? "#0f172a"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleColor: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Position</span>
                      <select
                        value={activeBook.titlePosition ?? "bottom-left"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titlePosition: e.target.value as any }))}
                        className="admin-grid-select"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center-center">Center Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Text Alignment</span>
                      <select
                        value={activeBook.titleTextAlign ?? "left"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, titleTextAlign: e.target.value as any }))}
                        className="admin-grid-select"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="panel panel-bordered" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Icon</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon</span>
                      <input value={activeBook.icon} onChange={(e) => updateActiveBook((c) => ({ ...c, icon: e.target.value }))} className="admin-grid-input" />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon size</span>
                      <input
                        type="number"
                        min={24}
                        max={120}
                        value={activeBook.iconSize ?? 80}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, iconSize: Number(e.target.value) }))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon Color Start</span>
                      <input
                        type="color"
                        value={activeBook.iconColorStart ?? "#fff"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, iconColorStart: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon Color Middle</span>
                      <input
                        type="color"
                        value={activeBook.iconColorMiddle ?? "#fff"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, iconColorMiddle: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon Color End</span>
                      <input
                        type="color"
                        value={activeBook.iconColorEnd ?? "#fff"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, iconColorEnd: e.target.value }))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Icon position</span>
                      <select
                        value={activeBook.iconPosition ?? "center-center"}
                        onChange={(e) => updateActiveBook((c) => ({ ...c, iconPosition: e.target.value as any }))}
                        className="admin-grid-select"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center-center">Center Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </label>
                  </div>
                </div>
              </>
            ) : bookBuilderTab === "empty-book" ? (
              <>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Empty Book</h4>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Title</span>
                    <input
                      value={adminData?.homePageData?.style?.emptyBook?.title ?? "Coming soon"}
                      onChange={(e) => updateStyleConfig("title", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Font Size</span>
                      <input
                        type="number"
                        min={12}
                        max={48}
                        value={adminData?.homePageData?.style?.emptyBook?.titleFontSize ?? 24}
                        onChange={(e) => updateStyleConfig("titleFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Font Weight</span>
                      <select
                        value={adminData?.homePageData?.style?.emptyBook?.titleFontWeight ?? "bold"}
                        onChange={(e) => updateStyleConfig("titleFontWeight", e.target.value)}
                        className="admin-grid-select"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Lighter</option>
                        <option value="bolder">Bolder</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                        <option value="900">900</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Color</span>
                      <input
                        type="color"
                        value={adminData?.homePageData?.style?.emptyBook?.titleColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("titleColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Title Position</span>
                      <select
                        value={adminData?.homePageData?.style?.emptyBook?.titlePosition ?? "center-center"}
                        onChange={(e) => updateStyleConfig("titlePosition", e.target.value)}
                        className="admin-grid-select"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center-center">Center Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Text Alignment</span>
                      <select
                        value={adminData?.homePageData?.style?.emptyBook?.titleTextAlign ?? "center"}
                        onChange={(e) => updateStyleConfig("titleTextAlign", e.target.value)}
                        className="admin-grid-select"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="panel panel-bordered" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Cover Colors</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color Start</span>
                      <input
                        type="color"
                        value={adminData?.homePageData?.style?.emptyBook?.coverColorStart ?? "#f1f5f9"}
                        onChange={(e) => updateStyleConfig("coverColorStart", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color Middle</span>
                      <input
                        type="color"
                        value={adminData?.homePageData?.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9"}
                        onChange={(e) => updateStyleConfig("coverColorMiddle", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Cover Color End</span>
                      <input
                        type="color"
                        value={adminData?.homePageData?.style?.emptyBook?.coverColorEnd ?? "#f1f5f9"}
                        onChange={(e) => updateStyleConfig("coverColorEnd", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="admin-course-step-actions" style={{ marginBottom: "16px" }}>
                  <button type="button" className="footer-button secondary small" onClick={addChapter}>Add Chapter</button>
                  <div className="add-step-group">
                    <label className="admin-task-editor-label" style={{ marginRight: "8px" }}>Type:</label>
                    <select
                      ref={stepTypeSelectRef}
                      className="admin-grid-select small"
                      onChange={(e) => addStep(e.target.value as CourseStepType)}
                      defaultValue=""
                    >
                      <option value="" disabled>Add Step...</option>
                      <option value="html">Plain HTML</option>
                      <option value="code-exam">Code Editor</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                </div>
                <div className="admin-course-step-list">
                  {flatSteps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      className={`admin-course-step-item ${selectedStepId === step.id ? "selected" : ""}`}
                      onClick={() => setSelectedStepId(step.id)}
                    >
                      <span>{step.stepIndex}</span>
                      <span>{step.title}</span>
                      <span>{step.stepType}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {bookBuilderTab === "chapter" && (
            <section className="admin-course-step-editor panel-bordered">
              {selectedStep ? (
                <>
                  <h3>Chapter</h3>
                  <div className="admin-step-meta-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Chapter Index</span>
                      <input
                        type="number"
                        value={selectedStep.stepIndex}
                        onChange={(e) => updateStep(selectedStep.id, { stepIndex: Number(e.target.value) })}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Title</span>
                    <input value={selectedStep.title} onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })} className="admin-grid-input" />
                  </label>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Type</span>
                    <select
                      value={selectedStep.stepType}
                      onChange={(e) => updateStep(selectedStep.id, { stepType: e.target.value as CourseStepType })}
                      className="admin-grid-select"
                    >
                      <option value="html">html</option>
                      <option value="code-exam">code-exam</option>
                      <option value="quiz">quiz</option>
                    </select>
                  </label>
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Description</span>
                    <textarea rows={2} value={selectedStep.description} onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })} className="admin-grid-input" />
                  </label>
                  <h3>Content HTML</h3>
                  {selectedStep.stepType === "html" ? (
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Content HTML</span>
                      <textarea rows={12} value={selectedStep.contentHtml ?? ""} onChange={(e) => updateStep(selectedStep.id, { contentHtml: e.target.value })} className="admin-grid-input" />
                    </label>
                  ) : null}
                  {selectedStep.stepType === "code-exam" ? (
                    <>
                      <label className="admin-task-editor-field admin-task-editor-full">
                        <span className="admin-task-editor-label">Checklist (one per line)</span>
                        <textarea
                          rows={6}
                          value={(selectedStep.checklist ?? []).join("\n")}
                          onChange={(e) => updateStep(selectedStep.id, { checklist: e.target.value.split(/\r?\n/).filter(Boolean) })}
                          className="admin-grid-input"
                        />
                      </label>
                      <label className="admin-task-editor-field admin-task-editor-full">
                        <span className="admin-task-editor-label">Verification keywords (JSON)</span>
                        <textarea
                          rows={6}
                          value={JSON.stringify(selectedStep.verificationKeywords ?? [], null, 2)}
                          onChange={(e) => {
                            try {
                              updateStep(selectedStep.id, { verificationKeywords: JSON.parse(e.target.value) });
                            } catch {
                              // ignore while typing
                            }
                          }}
                          className="admin-grid-input"
                        />
                      </label>
                    </>
                  ) : null}
                  {selectedStep.stepType === "quiz" ? (
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Quiz JSON</span>
                      <textarea
                        rows={15}
                        value={JSON.stringify(selectedStep.quizQuestions ?? [], null, 2)}
                        onChange={(e) => {
                          try {
                            updateStep(selectedStep.id, { quizQuestions: JSON.parse(e.target.value) });
                          } catch {
                            // ignore while typing
                          }
                        }}
                        className="admin-grid-input"
                      />
                    </label>
                  ) : null}
                </>
              ) : (
                <div className="admin-empty-state">Select a step to view and edit its content.</div>
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="admin-empty-state">No books yet. Create one in Admin.</div>
      )}
    </div>
  );
}
