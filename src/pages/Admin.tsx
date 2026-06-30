import { useEffect, useMemo, useState } from "react";
import {
  ContentStoreData,
  loadAdminData,
  loadDefaultAdminData,
  resetAdminData,
  saveAdminData,
} from "../utils/contentStore";
import type { PracticeTask } from "../data/tasks";
import { categoryIndexByKey } from "../data/tasks";
import { loadTasksFromBrowserSqlite } from "../utils/sqliteBrowserTaskSource";
import { compareTasksByIndex } from "../utils/taskSort";
import {
  deleteTaskFromBrowserDb,
  openBrowserDb,
  persistBrowserDbToLocalStorage,
  resetBrowserDbCache,
  restoreBundledBrowserDb,
  saveTasksToBrowserDb,
  TaskRow,
  upsertTaskInBrowserDb,
} from "../utils/sqliteBrowserDb";
import "./Admin.css";
import AdminCourses from "./AdminCourses";

const NEW_TASK_DRAFT_ID = "__draft__";

const EMPTY_DRAFT_TASK: PracticeTask = {
  id: "",
  category: "",
  title: "",
  description: "",
  checklist: [],
  detailedInstructions: [],
  verificationKeywords: [],
  starterCode: "",
  answerHtml: "",
  type: "code",
};

function resolveCategoryIndex(task: PracticeTask): number | undefined {
  if (typeof task.categoryIndex === "number") return task.categoryIndex;
  const mapped = categoryIndexByKey[task.category];
  return typeof mapped === "number" ? mapped : undefined;
}

function resolveTaskIndex(task: PracticeTask): number | undefined {
  if (typeof task.taskIndex === "number") return task.taskIndex;
  if (typeof task.index === "number") return task.index;
  return undefined;
}

function buildTaskRow(task: PracticeTask): TaskRow {
  const categoryIndex = task.categoryIndex ?? categoryIndexByKey[task.category] ?? null;
  const taskIndex = task.taskIndex ?? task.index ?? null;
  const payload = { ...task, categoryIndex, taskIndex };
  if ("index" in payload) {
    delete (payload as { index?: number }).index;
  }

  return {
    id: task.id,
    filename: `${task.id}.json`,
    category: task.category,
    title: task.title,
    raw: JSON.stringify(payload, null, 2),
    categoryIndex,
    taskIndex,
    type: task.type,
  };
}

export default function Admin() {
  const [homeJson, setHomeJson] = useState("");
  const [homeData, setHomeData] = useState<any>(null);
  const [practiceMetaJson, setPracticeMetaJson] = useState("");
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [dbLoaded, setDbLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draftTask, setDraftTask] = useState<PracticeTask | null>(null);
  const [adminTab, setAdminTab] = useState<"home" | "wizard-style" | "books">("home");

  useEffect(() => {
    const defaultData = loadAdminData();
    setHomeJson(JSON.stringify(defaultData.homePageData, null, 2));
    setHomeData(defaultData.homePageData);
    const { tasks: adminTasks, ...practiceMeta } = defaultData.practicePageData;
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));
    setExpandedSections({ homePageData: false, practicePageData: false });

    async function loadAdminTasks() {
      try {
        const sqlTasks = await loadTasksFromBrowserSqlite();
        if (sqlTasks.length > 0) {
          setTasks(sqlTasks);
        } else if (adminTasks.length > 0) {
          setTasks(adminTasks);
        } else {
          setTasks([]);
        }
        setDbLoaded(true);
      } catch (error) {
        setDbError(String(error));
        setTasks(adminTasks.length > 0 ? adminTasks : []);
        setDbLoaded(true);
      }
    }

    loadAdminTasks();
  }, []);

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function updateTaskField<K extends keyof PracticeTask>(taskId: string, field: K, value: PracticeTask[K]) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? ({ ...task, [field]: value } as PracticeTask) : task)));
    if (field === "id" && typeof value === "string") {
      setSelectedTaskId(value);
    }
  }

  function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  }

  function addTask() {
    setDraftTask({ ...EMPTY_DRAFT_TASK });
    setSelectedTaskId(NEW_TASK_DRAFT_ID);
    setCurrentPage(1);
    setSearchId("");
    setSearchTitle("");
    setSearchCategory("");
    setMessage("");
  }

  function updateDraftField<K extends keyof PracticeTask>(field: K, value: PracticeTask[K]) {
    setDraftTask((prev) => (prev ? ({ ...prev, [field]: value } as PracticeTask) : prev));
  }

  function clearDraft() {
    setDraftTask(null);
    if (selectedTaskId === NEW_TASK_DRAFT_ID) {
      setSelectedTaskId(null);
    }
  }

  async function handleSave() {
    try {
      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      const practicePageData = { ...practicePageMeta, tasks };

      saveAdminData({ homePageData, practicePageData });

      const db = await openBrowserDb();
      saveTasksToBrowserDb(db, tasks.map(buildTaskRow));
      persistBrowserDbToLocalStorage(db);

      setMessage("Saved task edits to browser SQLite and localStorage.");
      setDbError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`Save failed: ${errorMessage}`);
    }
  }

  async function handleReset() {
    resetAdminData();
    const defaults = loadDefaultAdminData();
    const { tasks: defaultsTasks, ...practiceMeta } = defaults.practicePageData;
    setHomeJson(JSON.stringify(defaults.homePageData, null, 2));
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));
    // Only reset tasks from content store; browser DB is separate and preserved
    // Re-load tasks from browser DB instead of using defaultsTasks
    try {
      const sqlTasks = await loadTasksFromBrowserSqlite();
      if (sqlTasks.length > 0) {
        setTasks(sqlTasks);
      } else {
        setTasks(defaultsTasks);
      }
    } catch {
      setTasks(defaultsTasks);
    }
    setCurrentPage(1);
    setSearchId("");
    setSearchTitle("");
    setSearchCategory("");
    setMessage("Reset to default content.");
    setDbError(null);
  }

  const pageSize = 5;

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (searchId && !task.id.toLowerCase().includes(searchId.toLowerCase())) return false;
          if (searchTitle && !task.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
          if (searchCategory && !task.category.toLowerCase().includes(searchCategory.toLowerCase())) return false;
          return true;
        })
        .sort(compareTasksByIndex),
    [tasks, searchId, searchTitle, searchCategory],
  );

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const currentPageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const pageStart = (currentPageIndex - 1) * pageSize;
  const pageTasks = filteredTasks.slice(pageStart, pageStart + pageSize);

  // Auto-select first matching task when search changes (skip while editing a draft)
  useEffect(() => {
    if (draftTask) return;

    const first = filteredTasks[0];
    if (!first) {
      setSelectedTaskId(null);
      return;
    }
    if (!selectedTaskId || selectedTaskId === NEW_TASK_DRAFT_ID || !filteredTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(first.id);
    }
  }, [searchId, searchTitle, searchCategory, filteredTasks, selectedTaskId, draftTask]);

  function updateStyleConfig(category: string, key: string, value: string) {
    if (!homeData) return;
    const newHomeData = { ...homeData };
    if (!newHomeData.style) {
      newHomeData.style = {
        main: {
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
        },
        topMenu: {
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          color: "#0f172a",
          borderBottomColor: "#e2e8f0",
          logoBackgroundColor: "#0f172a",
          logoColor: "#ffffff",
        },
        buttons: {
          primaryBackgroundColor: "#0f172a",
          primaryColor: "#ffffff",
          secondaryBackgroundColor: "#e2e8f0",
          secondaryColor: "#334155",
        },
        bookshelf: {
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
        },
        tabs: {
          backgroundColor: "#e2e8f0",
          color: "#334155",
          activeBackgroundColor: "#0f172a",
          activeColor: "#ffffff",
        },
        wizardTopInfo: {
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderBottomColor: "#e2e8f0",
          chapterLabelColor: "#64748b",
          chapterLabelFontSize: "0.65rem",
        },
        wizardWorkspace: {
          backgroundColor: "#ffffff",
          panelBackgroundColor: "#ffffff",
          panelBorderColor: "#e2e8f0",
          textColor: "#0f172a",
          descriptionColor: "#64748b",
        },
        wizardButtons: {
          backgroundColor: "#e2e8f0",
          color: "#0f172a",
          hoverBackgroundColor: "#cbd5e1",
          fontSize: "0.78rem",
          fontWeight: "700",
        },
      };
    }
    if (!newHomeData.style[category]) {
      newHomeData.style[category] = {};
    }
    newHomeData.style[category][key] = value;
    setHomeData(newHomeData);
    setHomeJson(JSON.stringify(newHomeData, null, 2));
  }

  async function saveSingleRecord(task: PracticeTask) {
    try {
      const trimmedId = task.id.trim();
      if (!trimmedId) {
        setMessage("ID is required before saving.");
        return;
      }
      if (!task.category.trim()) {
        setMessage("Category is required before saving.");
        return;
      }
      if (!task.title.trim()) {
        setMessage("Title is required before saving.");
        return;
      }

      const savedTask: PracticeTask = { ...task, id: trimmedId };
      const isDraft = selectedTaskId === NEW_TASK_DRAFT_ID;
      let nextTasks: PracticeTask[];

      if (isDraft) {
        if (tasks.some((existing) => existing.id === trimmedId)) {
          setMessage("A task with this ID already exists.");
          return;
        }
        nextTasks = [...tasks, savedTask];
        setTasks(nextTasks);
        setDraftTask(null);
        setSelectedTaskId(trimmedId);
      } else {
        nextTasks = tasks.map((existing) => (existing.id === task.id ? savedTask : existing));
        setTasks(nextTasks);
        if (trimmedId !== task.id) {
          setSelectedTaskId(trimmedId);
        }
      }

      const db = await openBrowserDb();
      if (!isDraft && trimmedId !== task.id) {
        deleteTaskFromBrowserDb(db, task.id);
      }
      upsertTaskInBrowserDb(db, buildTaskRow(savedTask));
      persistBrowserDbToLocalStorage(db);

      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      saveAdminData({ homePageData, practicePageData: { ...practicePageMeta, tasks: nextTasks } });
      setMessage("Saved task to browser SQLite and localStorage.");
      setDbError(null);
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <div className="page-content page-admin">
      <div className="admin-tabs">
        <button type="button" className={`admin-tab ${adminTab === "home" ? "active" : ""}`} onClick={() => setAdminTab("home")}>
          Home Page
        </button>
        <button type="button" className={`admin-tab ${adminTab === "wizard-style" ? "active" : ""}`} onClick={() => setAdminTab("wizard-style")}>
          Chapter Page Style
        </button>
        <button type="button" className={`admin-tab ${adminTab === "books" ? "active" : ""}`} onClick={() => setAdminTab("books")}>
          Book Builder
        </button>
      </div>

      {adminTab === "home" ? (
        <section className="panel admin-editor admin-section">
          <div className="admin-section-body">
            <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
              <div className="admin-search-actions-end">
                <button type="button" className="footer-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            {message && <div className="admin-course-message">{message}</div>}

            {/* Home Page Data JSON */}
            <div style={{ marginBottom: "24px" }}>
              <label className="admin-task-editor-field admin-task-editor-full">
                <span className="admin-task-editor-label">Home Page Data (JSON)</span>
                <textarea
                  rows={10}
                  value={homeJson}
                  onChange={(e) => setHomeJson(e.target.value)}
                  className="admin-grid-input"
                />
              </label>
            </div>

            {/* Main Page */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Main Page</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.main?.backgroundColor ?? "#f8fafc"}
                    onChange={(e) => updateStyleConfig("main", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.main?.color ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("main", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Font Family</span>
                  <input
                    type="text"
                    value={homeData?.style?.main?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                    onChange={(e) => updateStyleConfig("main", "fontFamily", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Top Menu */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Top Main Menu</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.topMenu?.backgroundColor ?? "rgba(255, 255, 255, 0.96)"}
                    onChange={(e) => updateStyleConfig("topMenu", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.topMenu?.color ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("topMenu", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Border Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.topMenu?.borderBottomColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("topMenu", "borderBottomColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Logo Background</span>
                  <input
                    type="color"
                    value={homeData?.style?.topMenu?.logoBackgroundColor ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("topMenu", "logoBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Logo Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.topMenu?.logoColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("topMenu", "logoColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Buttons</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Primary Background</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.primaryBackgroundColor ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("buttons", "primaryBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Primary Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.primaryColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("buttons", "primaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Secondary Background</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.secondaryBackgroundColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("buttons", "secondaryBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Secondary Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.secondaryColor ?? "#334155"}
                    onChange={(e) => updateStyleConfig("buttons", "secondaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Bookshelf */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Bookshelf</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.bookshelf?.backgroundColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("bookshelf", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Border Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.bookshelf?.borderColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("bookshelf", "borderColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Tabs */}
            <div className="panel panel-bordered" style={{ padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Tabs / Submenu</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.backgroundColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("tabs", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.color ?? "#334155"}
                    onChange={(e) => updateStyleConfig("tabs", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Active Background</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.activeBackgroundColor ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("tabs", "activeBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Active Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.activeColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("tabs", "activeColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      ) : adminTab === "wizard-style" ? (
        <section className="panel admin-editor admin-section">
          <div className="admin-section-body">
            <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
              <div className="admin-search-actions-end">
                <button type="button" className="footer-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            {message && <div className="admin-course-message">{message}</div>}

            {/* Wizard Top Info */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Wizard Top Info Section</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardTopInfo?.backgroundColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("wizardTopInfo", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardTopInfo?.color ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("wizardTopInfo", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Border Bottom Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("wizardTopInfo", "borderBottomColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Chapter Label Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardTopInfo?.chapterLabelColor ?? "#64748b"}
                    onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Chapter Label Font Size</span>
                  <input
                    type="text"
                    value={homeData?.style?.wizardTopInfo?.chapterLabelFontSize ?? "0.65rem"}
                    onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelFontSize", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Wizard Workspace */}
            <div className="panel panel-bordered" style={{ marginBottom: "16px", padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Wizard Workspace</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardWorkspace?.backgroundColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("wizardWorkspace", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Panel Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardWorkspace?.panelBackgroundColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("wizardWorkspace", "panelBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Panel Border Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardWorkspace?.panelBorderColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("wizardWorkspace", "panelBorderColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardWorkspace?.textColor ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("wizardWorkspace", "textColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Description Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardWorkspace?.descriptionColor ?? "#64748b"}
                    onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>

            {/* Wizard Buttons */}
            <div className="panel panel-bordered" style={{ padding: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Wizard Buttons</h4>
              <div className="admin-search-row">
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardButtons?.backgroundColor ?? "#e2e8f0"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "backgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardButtons?.color ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Hover Background Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardButtons?.hoverBackgroundColor ?? "#cbd5e1"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "hoverBackgroundColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
              <div className="admin-search-row" style={{ marginTop: "12px" }}>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Font Size</span>
                  <input
                    type="text"
                    value={homeData?.style?.wizardButtons?.fontSize ?? "0.78rem"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "fontSize", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Font Weight</span>
                  <input
                    type="text"
                    value={homeData?.style?.wizardButtons?.fontWeight ?? "700"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "fontWeight", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel admin-editor admin-section">
          <AdminCourses />
        </section>
      )}
    </div>
  );
}
