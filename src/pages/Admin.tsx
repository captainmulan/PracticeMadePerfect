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

interface GradientColorPickerProps {
  label: string;
  // kept for backwards-compatibility but ignored: useGradient, setUseGradient, solidColor, setSolidColor
  useGradient?: boolean;
  setUseGradient?: (value: boolean) => void;
  solidColor?: string;
  setSolidColor?: (value: string) => void;
  gradientStart: string;
  gradientMiddle?: string;
  setGradientMiddle?: (value: string) => void;
  setGradientStart: (value: string) => void;
  gradientEnd: string;
  setGradientEnd: (value: string) => void;
}

function GradientColorPicker({
  label,
  // kept for backwards-compatibility but ignored: useGradient, setUseGradient, solidColor, setSolidColor
  useGradient,
  setUseGradient,
  solidColor,
  setSolidColor,
  gradientStart,
  gradientMiddle,
  setGradientMiddle,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
}: GradientColorPickerProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>{label}</span>
      </div>
      <div className="admin-search-row">
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">Start</span>
          <input
            type="color"
            value={gradientStart}
            onChange={(e) => setGradientStart(e.target.value)}
            className="admin-grid-input"
          />
        </label>
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">Middle</span>
          <input
            type="color"
            value={gradientMiddle ?? gradientStart}
            onChange={(e) => {
              if (typeof setGradientMiddle === "function") setGradientMiddle(e.target.value);
              else if (typeof setGradientStart === "function") setGradientStart(e.target.value);
            }}
            className="admin-grid-input"
          />
        </label>
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">End</span>
          <input
            type="color"
            value={gradientEnd}
            onChange={(e) => setGradientEnd(e.target.value)}
            className="admin-grid-input"
          />
        </label>
      </div>
    </div>
  );
}

interface GradientColorPicker3Props {
  label: string;
  useGradient?: boolean;
  setUseGradient?: (value: boolean) => void;
  solidColor?: string;
  setSolidColor?: (value: string) => void;
  gradientStart: string;
  setGradientStart: (value: string) => void;
  gradientMiddle?: string;
  setGradientMiddle: (value: string) => void;
  gradientEnd: string;
  setGradientEnd: (value: string) => void;
}

function GradientColorPicker3({ label, gradientStart, setGradientStart, gradientMiddle, setGradientMiddle, gradientEnd, setGradientEnd }: GradientColorPicker3Props) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>{label}</span>
      </div>
      <div className="admin-search-row">
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">Start</span>
          <input
            type="color"
            value={gradientStart}
            onChange={(e) => setGradientStart(e.target.value)}
            className="admin-grid-input"
          />
        </label>
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">Middle</span>
          <input
            type="color"
            value={gradientMiddle}
            onChange={(e) => setGradientMiddle(e.target.value)}
            className="admin-grid-input"
          />
        </label>
        <label className="admin-task-editor-field">
          <span className="admin-task-editor-label">End</span>
          <input
            type="color"
            value={gradientEnd}
            onChange={(e) => setGradientEnd(e.target.value)}
            className="admin-grid-input"
          />
        </label>
      </div>
    </div>
  );
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
  const [homeStyleTab, setHomeStyleTab] = useState<"json" | "main" | "hero" | "topmenu" | "buttons" | "bookshelf" | "tabs">("main");
  const [wizardStyleTab, setWizardStyleTab] = useState<"topinfo" | "workspace" | "buttons">("topinfo");
  const [isRestoringDb, setIsRestoringDb] = useState(false);

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

  function updateStyleConfig(category: string, key: string, value: string | boolean | number) {
    if (!homeData) return;
    const newHomeData = { ...homeData };
    if (!newHomeData.style) {
      newHomeData.style = {
        main: {
          backgroundColor: "#f8fafc",
          backgroundGradientStart: "#f8fafc",
          backgroundGradientEnd: "#eef2f7",
          useGradient: true,
          color: "#0f172a",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
        },
        topMenu: {
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backgroundColorGradientStart: "rgba(255, 255, 255, 0.96)",
          backgroundColorGradientEnd: "rgba(245, 245, 245, 0.96)",
          useBackgroundColorGradient: false,
          color: "#0f172a",
          borderBottomColor: "#e2e8f0",
          logoBackgroundColor: "#0f172a",
          logoBackgroundColorGradientStart: "#0f172a",
          logoBackgroundColorGradientEnd: "#1e293b",
          useLogoBackgroundColorGradient: false,
          logoColor: "#ffffff",
        },
        buttons: {
          primaryBackgroundColor: "#0f172a",
          primaryBackgroundColorGradientStart: "#0f172a",
          primaryBackgroundColorGradientEnd: "#1e293b",
          usePrimaryBackgroundColorGradient: false,
          primaryColor: "#ffffff",
          secondaryBackgroundColor: "#e2e8f0",
          secondaryBackgroundColorGradientStart: "#e2e8f0",
          secondaryBackgroundColorGradientEnd: "#cbd5e1",
          useSecondaryBackgroundColorGradient: false,
          secondaryColor: "#334155",
        },
        bookshelf: {
          backgroundColor: "#ffffff",
          backgroundColorGradientStart: "#ffffff",
          backgroundColorGradientEnd: "#f8fafc",
          useBackgroundColorGradient: false,
          borderColor: "#e2e8f0",
        },
        tabs: {
          backgroundColor: "#e2e8f0",
          backgroundColorGradientStart: "#e2e8f0",
          backgroundColorGradientEnd: "#cbd5e1",
          useBackgroundColorGradient: false,
          color: "#334155",
          activeBackgroundColor: "#0f172a",
          activeBackgroundColorGradientStart: "#0f172a",
          activeBackgroundColorGradientEnd: "#1e293b",
          useActiveBackgroundColorGradient: false,
          activeColor: "#ffffff",
        },
        wizardTopInfo: {
          backgroundColor: "#ffffff",
          backgroundColorGradientStart: "#ffffff",
          backgroundColorGradientEnd: "#f8fafc",
          useBackgroundColorGradient: false,
          color: "#0f172a",
          borderBottomColor: "#e2e8f0",
          chapterLabelColor: "#64748b",
          chapterLabelFontSize: "0.65rem",
        },
        wizardWorkspace: {
          backgroundColor: "#ffffff",
          backgroundColorGradientStart: "#ffffff",
          backgroundColorGradientEnd: "#f8fafc",
          useBackgroundColorGradient: false,
          panelBackgroundColor: "#ffffff",
          panelBackgroundColorGradientStart: "#ffffff",
          panelBackgroundColorGradientEnd: "#f8fafc",
          usePanelBackgroundColorGradient: false,
          panelBorderColor: "#e2e8f0",
          textColor: "#0f172a",
          descriptionColor: "#64748b",
        },
        wizardButtons: {
          backgroundColor: "#e2e8f0",
          backgroundColorGradientStart: "#e2e8f0",
          backgroundColorGradientEnd: "#cbd5e1",
          useBackgroundColorGradient: false,
          color: "#0f172a",
          hoverBackgroundColor: "#cbd5e1",
          hoverBackgroundColorGradientStart: "#cbd5e1",
          hoverBackgroundColorGradientEnd: "#94a3b8",
          useHoverBackgroundColorGradient: false,
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

  async function handleRestoreBundledDb() {
    if (isRestoringDb) return;

    const enteredPassword = window.prompt("Enter admin password to restore the bundled database:", "");
    if (enteredPassword === null) {
      setMessage("Database restoration cancelled.");
      return;
    }

    if (enteredPassword !== "admin123") {
      setMessage("Incorrect password. Database restoration cancelled.");
      return;
    }

    setIsRestoringDb(true);
    setMessage("Restoring bundled database...");
    try {
      await restoreBundledBrowserDb();
      setMessage("Bundled database restored. Reloading admin data...");
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`Restore failed: ${errorMessage}`);
    } finally {
      setIsRestoringDb(false);
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

  function handleExport() {
    try {
      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      const payload = { homePageData, practicePageData: { ...practicePageMeta, tasks } };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "admin.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Exported admin data to admin.json (download). Place this file into /deploy/admin.json before running deploy to apply to production.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  async function handleExportDb() {
    try {
      const db = await openBrowserDb();
      const bytes = db.export();
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([new Uint8Array(buffer)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks.db";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Exported the current browser database to tasks.db. Copy it into /deploy/tasks.db before deploying.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  async function handleReset() {
    resetAdminData();
    const defaults = loadDefaultAdminData();
    const { tasks: defaultsTasks, ...practiceMeta } = defaults.practicePageData;
    setHomeJson(JSON.stringify(defaults.homePageData, null, 2));
    setHomeData(defaults.homePageData);
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
      <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
        <div className="admin-search-actions-end">
          <button type="button" className="footer-button" onClick={handleRestoreBundledDb} disabled={isRestoringDb}>
            {isRestoringDb ? "Restoring..." : "Restore bundled database"}
          </button>
        </div>
      </div>

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

      {message && <div className="admin-course-message">{message}</div>}

      {adminTab === "home" ? (
        <section className="panel admin-editor admin-section">
          <div className="admin-section-body">
            <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
              <div className="admin-search-actions-end">
                <button type="button" className="footer-button" onClick={handleExport} style={{ marginRight: 8 }}>
                  Export Admin
                </button>
                <button type="button" className="footer-button" onClick={handleExportDb} style={{ marginRight: 8 }}>
                  Export DB
                </button>
                <button type="button" className="footer-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
            <div className="admin-tabs" style={{ marginBottom: "16px" }}>
              <button type="button" className={`admin-tab ${homeStyleTab === "json" ? "active" : ""}`} onClick={() => setHomeStyleTab("json")}>
                Data (JSON)
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "main" ? "active" : ""}`} onClick={() => setHomeStyleTab("main")}>
                Main Page
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "hero" ? "active" : ""}`} onClick={() => setHomeStyleTab("hero")}> 
                Hero Section
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "topmenu" ? "active" : ""}`} onClick={() => setHomeStyleTab("topmenu")}>
                Top Main Menu
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "buttons" ? "active" : ""}`} onClick={() => setHomeStyleTab("buttons")}>
                Buttons
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "bookshelf" ? "active" : ""}`} onClick={() => setHomeStyleTab("bookshelf")}>
                Bookshelf
              </button>
              <button type="button" className={`admin-tab ${homeStyleTab === "tabs" ? "active" : ""}`} onClick={() => setHomeStyleTab("tabs")}>
                Tabs / Submenu
              </button>
            </div>
            {homeStyleTab === "json" && (
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
            )}
            {homeStyleTab === "main" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Main Page</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.main?.useGradient ?? true}
                      onChange={(e) => updateStyleConfig("main", "useGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Use Background Gradient</span>
                  </label>
                </div>
                {homeData?.style?.main?.useGradient ? (
                  <GradientColorPicker3
                    label="Background Gradient"
                    gradientStart={homeData?.style?.main?.backgroundGradientStart ?? "#f8fafc"}
                    setGradientStart={(v) => updateStyleConfig("main", "backgroundGradientStart", v)}
                    gradientMiddle={homeData?.style?.main?.backgroundGradientMiddle ?? "#f8fafc"}
                    setGradientMiddle={(v) => updateStyleConfig("main", "backgroundGradientMiddle", v)}
                    gradientEnd={homeData?.style?.main?.backgroundGradientEnd ?? "#eef2f7"}
                    setGradientEnd={(v) => updateStyleConfig("main", "backgroundGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.main?.backgroundColor ?? "#f8fafc"}
                        onChange={(e) => updateStyleConfig("main", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <div className="admin-search-row">
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
            )}
            {homeStyleTab === "hero" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Hero Section</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.hero?.useBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("hero", "useBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Use Background Gradient</span>
                  </label>
                </div>
                {homeData?.style?.hero?.useBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Background Gradient"
                    gradientStart={homeData?.style?.hero?.backgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("hero", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.hero?.backgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("hero", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.hero?.backgroundColorGradientEnd ?? "#f8fafc"}
                    setGradientEnd={(v) => updateStyleConfig("hero", "backgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.hero?.backgroundColor ?? "#ffffff"}
                        onChange={(e) => updateStyleConfig("hero", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <div className="admin-search-row">
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Hero Text Color</span>
                    <input
                      type="color"
                      value={homeData?.style?.hero?.color ?? "#0f172a"}
                      onChange={(e) => updateStyleConfig("hero", "color", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Hero Eyebrow Color</span>
                    <input
                      type="color"
                      value={homeData?.style?.hero?.eyebrowColor ?? "#6b7280"}
                      onChange={(e) => updateStyleConfig("hero", "eyebrowColor", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
                <div className="admin-search-row">
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Hero Title Color</span>
                    <input
                      type="color"
                      value={homeData?.style?.hero?.titleColor ?? "#0f172a"}
                      onChange={(e) => updateStyleConfig("hero", "titleColor", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Hero Description Color</span>
                    <input
                      type="color"
                      value={homeData?.style?.hero?.descriptionColor ?? "#475569"}
                      onChange={(e) => updateStyleConfig("hero", "descriptionColor", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Font Family</span>
                    <input
                      type="text"
                      value={homeData?.style?.hero?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                      onChange={(e) => updateStyleConfig("hero", "fontFamily", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
              </div>
            )}
            {homeStyleTab === "topmenu" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Top Main Menu</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.topMenu?.useBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("topMenu", "useBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Use Background Gradient</span>
                  </label>
                </div>
                {homeData?.style?.topMenu?.useBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Background Gradient"
                    gradientStart={homeData?.style?.topMenu?.backgroundColorGradientStart ?? "rgba(255, 255, 255, 0.96)"}
                    setGradientStart={(v) => updateStyleConfig("topMenu", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.topMenu?.backgroundColorGradientMiddle ?? "rgba(255, 255, 255, 0.96)"}
                    setGradientMiddle={(v) => updateStyleConfig("topMenu", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.topMenu?.backgroundColorGradientEnd ?? "rgba(245, 245, 245, 0.96)"}
                    setGradientEnd={(v) => updateStyleConfig("topMenu", "backgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.topMenu?.backgroundColor ?? "rgba(255, 255, 255, 0.96)"}
                        onChange={(e) => updateStyleConfig("topMenu", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <div className="admin-search-row">
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Header Text Color</span>
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
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={homeData?.style?.topMenu?.useLogoBackgroundColorGradient ?? false}
                          onChange={(e) => updateStyleConfig("topMenu", "useLogoBackgroundColorGradient", e.target.checked)}
                        />
                        <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Use Logo Gradient</span>
                      </label>
                    </div>
                    {homeData?.style?.topMenu?.useLogoBackgroundColorGradient ? (
                      <GradientColorPicker3
                        label="Logo Background Gradient"
                        gradientStart={homeData?.style?.topMenu?.logoBackgroundColorGradientStart ?? "#0f172a"}
                        setGradientStart={(v) => updateStyleConfig("topMenu", "logoBackgroundColorGradientStart", v)}
                        gradientMiddle={homeData?.style?.topMenu?.logoBackgroundColorGradientMiddle ?? "#0f172a"}
                        setGradientMiddle={(v) => updateStyleConfig("topMenu", "logoBackgroundColorGradientMiddle", v)}
                        gradientEnd={homeData?.style?.topMenu?.logoBackgroundColorGradientEnd ?? "#1e293b"}
                        setGradientEnd={(v) => updateStyleConfig("topMenu", "logoBackgroundColorGradientEnd", v)}
                      />
                    ) : (
                      <label className="admin-task-editor-field">
                        <span className="admin-task-editor-label">Logo Background Color</span>
                        <input
                          type="color"
                          value={homeData?.style?.topMenu?.logoBackgroundColor ?? "#0f172a"}
                          onChange={(e) => updateStyleConfig("topMenu", "logoBackgroundColor", e.target.value)}
                          className="admin-grid-input"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
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
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Logo Font Family</span>
                    <input
                      type="text"
                      value={homeData?.style?.topMenu?.logoFontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                      onChange={(e) => updateStyleConfig("topMenu", "logoFontFamily", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Logo Font Weight</span>
                    <input
                      type="text"
                      value={homeData?.style?.topMenu?.logoFontWeight ?? "700"}
                      onChange={(e) => updateStyleConfig("topMenu", "logoFontWeight", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Logo Font Size</span>
                    <input
                      type="text"
                      value={homeData?.style?.topMenu?.logoFontSize ?? "18px"}
                      onChange={(e) => updateStyleConfig("topMenu", "logoFontSize", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
              </div>
            )}
            {homeStyleTab === "buttons" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Buttons</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.buttons?.usePrimaryBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("buttons", "usePrimaryBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Primary Button Gradient</span>
                  </label>
                </div>
                {homeData?.style?.buttons?.usePrimaryBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Primary Button Background"
                    gradientStart={homeData?.style?.buttons?.primaryBackgroundColorGradientStart ?? "#0f172a"}
                    setGradientStart={(v) => updateStyleConfig("buttons", "primaryBackgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.buttons?.primaryBackgroundColorGradientMiddle ?? "#0f172a"}
                    setGradientMiddle={(v) => updateStyleConfig("buttons", "primaryBackgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.buttons?.primaryBackgroundColorGradientEnd ?? "#1e293b"}
                    setGradientEnd={(v) => updateStyleConfig("buttons", "primaryBackgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Primary Button Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.buttons?.primaryBackgroundColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("buttons", "primaryBackgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Primary Button Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.primaryColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("buttons", "primaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Primary Button Font Family</span>
                    <input
                      type="text"
                      value={homeData?.style?.buttons?.primaryFontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                      onChange={(e) => updateStyleConfig("buttons", "primaryFontFamily", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Primary Button Font Weight</span>
                    <input
                      type="text"
                      value={homeData?.style?.buttons?.primaryFontWeight ?? "700"}
                      onChange={(e) => updateStyleConfig("buttons", "primaryFontWeight", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.buttons?.useSecondaryBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("buttons", "useSecondaryBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Secondary Button Gradient</span>
                  </label>
                </div>
                {homeData?.style?.buttons?.useSecondaryBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Secondary Button Background"
                    gradientStart={homeData?.style?.buttons?.secondaryBackgroundColorGradientStart ?? "#e2e8f0"}
                    setGradientStart={(v) => updateStyleConfig("buttons", "secondaryBackgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.buttons?.secondaryBackgroundColorGradientMiddle ?? "#e2e8f0"}
                    setGradientMiddle={(v) => updateStyleConfig("buttons", "secondaryBackgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.buttons?.secondaryBackgroundColorGradientEnd ?? "#cbd5e1"}
                    setGradientEnd={(v) => updateStyleConfig("buttons", "secondaryBackgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Secondary Button Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.buttons?.secondaryBackgroundColor ?? "#e2e8f0"}
                        onChange={(e) => updateStyleConfig("buttons", "secondaryBackgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Secondary Button Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.secondaryColor ?? "#334155"}
                    onChange={(e) => updateStyleConfig("buttons", "secondaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Secondary Button Font Family</span>
                    <input
                      type="text"
                      value={homeData?.style?.buttons?.secondaryFontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                      onChange={(e) => updateStyleConfig("buttons", "secondaryFontFamily", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Secondary Button Font Weight</span>
                    <input
                      type="text"
                      value={homeData?.style?.buttons?.secondaryFontWeight ?? "600"}
                      onChange={(e) => updateStyleConfig("buttons", "secondaryFontWeight", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
              </div>
            )}
            {homeStyleTab === "bookshelf" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Bookshelf</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.bookshelf?.useBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("bookshelf", "useBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Use Background Gradient</span>
                  </label>
                </div>
                {homeData?.style?.bookshelf?.useBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Background Gradient"
                    gradientStart={homeData?.style?.bookshelf?.backgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("bookshelf", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.bookshelf?.backgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("bookshelf", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.bookshelf?.backgroundColorGradientEnd ?? "#f8fafc"}
                    setGradientEnd={(v) => updateStyleConfig("bookshelf", "backgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.bookshelf?.backgroundColor ?? "#ffffff"}
                        onChange={(e) => updateStyleConfig("bookshelf", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
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
            )}
            {homeStyleTab === "tabs" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Tabs / Submenu</h4>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.tabs?.useBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("tabs", "useBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Inactive Tab Gradient</span>
                  </label>
                </div>
                {homeData?.style?.tabs?.useBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Inactive Tab Background"
                    gradientStart={homeData?.style?.tabs?.backgroundColorGradientStart ?? "#e2e8f0"}
                    setGradientStart={(v) => updateStyleConfig("tabs", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.tabs?.backgroundColorGradientMiddle ?? "#e2e8f0"}
                    setGradientMiddle={(v) => updateStyleConfig("tabs", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.tabs?.backgroundColorGradientEnd ?? "#cbd5e1"}
                    setGradientEnd={(v) => updateStyleConfig("tabs", "backgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Inactive Tab Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.tabs?.backgroundColor ?? "#e2e8f0"}
                        onChange={(e) => updateStyleConfig("tabs", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Inactive Tab Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.color ?? "#334155"}
                    onChange={(e) => updateStyleConfig("tabs", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Tab Font Family</span>
                    <input
                      type="text"
                      value={homeData?.style?.tabs?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"}
                      onChange={(e) => updateStyleConfig("tabs", "fontFamily", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Tab Font Weight</span>
                    <input
                      type="text"
                      value={homeData?.style?.tabs?.fontWeight ?? "600"}
                      onChange={(e) => updateStyleConfig("tabs", "fontWeight", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={homeData?.style?.tabs?.useActiveBackgroundColorGradient ?? false}
                      onChange={(e) => updateStyleConfig("tabs", "useActiveBackgroundColorGradient", e.target.checked)}
                    />
                    <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>Active Tab Gradient</span>
                  </label>
                </div>
                {homeData?.style?.tabs?.useActiveBackgroundColorGradient ? (
                  <GradientColorPicker3
                    label="Active Tab Background"
                    gradientStart={homeData?.style?.tabs?.activeBackgroundColorGradientStart ?? "#0f172a"}
                    setGradientStart={(v) => updateStyleConfig("tabs", "activeBackgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.tabs?.activeBackgroundColorGradientMiddle ?? "#0f172a"}
                    setGradientMiddle={(v) => updateStyleConfig("tabs", "activeBackgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.tabs?.activeBackgroundColorGradientEnd ?? "#1e293b"}
                    setGradientEnd={(v) => updateStyleConfig("tabs", "activeBackgroundColorGradientEnd", v)}
                  />
                ) : (
                  <div style={{ marginBottom: "16px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Active Tab Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.tabs?.activeBackgroundColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("tabs", "activeBackgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                )}
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Active Tab Text Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.activeColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("tabs", "activeColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            )}
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
            <div className="admin-tabs" style={{ marginBottom: "16px" }}>
              <button type="button" className={`admin-tab ${wizardStyleTab === "topinfo" ? "active" : ""}`} onClick={() => setWizardStyleTab("topinfo")}>
                Wizard Top Info
              </button>
              <button type="button" className={`admin-tab ${wizardStyleTab === "workspace" ? "active" : ""}`} onClick={() => setWizardStyleTab("workspace")}>
                Wizard Workspace
              </button>
              <button type="button" className={`admin-tab ${wizardStyleTab === "buttons" ? "active" : ""}`} onClick={() => setWizardStyleTab("buttons")}>
                Wizard Buttons
              </button>
            </div>
            {wizardStyleTab === "topinfo" && (
              <>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Top Info Background & Border</h4>
                  <GradientColorPicker3
                    label="Background"
                    useGradient={homeData?.style?.wizardTopInfo?.useBackgroundColorGradient ?? false}
                    setUseGradient={(v) => updateStyleConfig("wizardTopInfo", "useBackgroundColorGradient", v)}
                    solidColor={homeData?.style?.wizardTopInfo?.backgroundColor ?? "#ffffff"}
                    setSolidColor={(v) => updateStyleConfig("wizardTopInfo", "backgroundColor", v)}
                    gradientStart={homeData?.style?.wizardTopInfo?.backgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("wizardTopInfo", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.wizardTopInfo?.backgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("wizardTopInfo", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.wizardTopInfo?.backgroundColorGradientEnd ?? "#f8fafc"}
                    setGradientEnd={(v) => updateStyleConfig("wizardTopInfo", "backgroundColorGradientEnd", v)}
                  />
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
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Chapter Label</h4>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Label Text</span>
                    <input
                      value={homeData?.style?.wizardTopInfo?.chapterLabelText ?? "CHAPTER"}
                      onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelText", e.target.value)}
                      className="admin-grid-input"
                    />
                  </label>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.chapterLabelColor ?? "#64748b"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="8"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.chapterLabelFontSize ?? 10}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.chapterLabelFontWeight ?? "700"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterLabelFontWeight", e.target.value)}
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
                  </div>
                </div>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Chapter Number</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="12"
                        max="72"
                        value={homeData?.style?.wizardTopInfo?.chapterNumberFontSize ?? 24}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterNumberFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.chapterNumberFontWeight ?? "700"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterNumberFontWeight", e.target.value)}
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
                      <span className="admin-task-editor-label">Text Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.chapterNumberColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterNumberColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <GradientColorPicker3
                    label="Background"
                    useGradient={homeData?.style?.wizardTopInfo?.chapterNumberUseBackgroundColorGradient ?? false}
                    setUseGradient={(v) => updateStyleConfig("wizardTopInfo", "chapterNumberUseBackgroundColorGradient", v)}
                    solidColor={homeData?.style?.wizardTopInfo?.chapterNumberBackgroundColor ?? "#ffffff"}
                    setSolidColor={(v) => updateStyleConfig("wizardTopInfo", "chapterNumberBackgroundColor", v)}
                    gradientStart={homeData?.style?.wizardTopInfo?.chapterNumberBackgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("wizardTopInfo", "chapterNumberBackgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.wizardTopInfo?.chapterNumberBackgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("wizardTopInfo", "chapterNumberBackgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.wizardTopInfo?.chapterNumberBackgroundColorGradientEnd ?? "#ffffff"}
                    setGradientEnd={(v) => updateStyleConfig("wizardTopInfo", "chapterNumberBackgroundColorGradientEnd", v)}
                  />
                </div>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Book Name</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="12"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.bookNameFontSize ?? 16}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "bookNameFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.bookNameFontWeight ?? "700"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "bookNameFontWeight", e.target.value)}
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
                      <span className="admin-task-editor-label">Text Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.bookNameColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "bookNameColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Chapter Title</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="12"
                        max="64"
                        value={homeData?.style?.wizardTopInfo?.chapterTitleFontSize ?? 20}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterTitleFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.chapterTitleFontWeight ?? "700"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterTitleFontWeight", e.target.value)}
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
                      <span className="admin-task-editor-label">Text Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.chapterTitleColor ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "chapterTitleColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
                <div className="panel panel-bordered" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Chapter Description</h4>
                  <div className="admin-search-row">
                    <GradientColorPicker3
                      label="Description Background"
                      gradientStart={homeData?.style?.wizardTopInfo?.descriptionBackgroundColorGradientStart ?? "#ffffff"}
                      setGradientStart={(v) => updateStyleConfig("wizardTopInfo", "descriptionBackgroundColorGradientStart", v)}
                      gradientMiddle={homeData?.style?.wizardTopInfo?.descriptionBackgroundColorGradientMiddle ?? "#ffffff"}
                      setGradientMiddle={(v) => updateStyleConfig("wizardTopInfo", "descriptionBackgroundColorGradientMiddle", v)}
                      gradientEnd={homeData?.style?.wizardTopInfo?.descriptionBackgroundColorGradientEnd ?? "#f8fafc"}
                      setGradientEnd={(v) => updateStyleConfig("wizardTopInfo", "descriptionBackgroundColorGradientEnd", v)}
                    />
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.descriptionColor ?? "#64748b"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="10"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.descriptionFontSize ?? 16}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.descriptionFontWeight ?? "normal"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionFontWeight", e.target.value)}
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
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Line Height</span>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        step="0.1"
                        value={homeData?.style?.wizardTopInfo?.descriptionLineHeight ?? 1.6}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionLineHeight", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Padding Top</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.descriptionPaddingTop ?? 16}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionPaddingTop", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Padding Bottom</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.descriptionPaddingBottom ?? 16}
                        onChange={(e) => updateStyleConfig("wizardTopInfo", "descriptionPaddingBottom", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            {wizardStyleTab === "workspace" && (
              <>
                <div className="panel panel-bordered" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Workspace & Panel Background</h4>
                  <GradientColorPicker3
                    label="Workspace Background"
                    useGradient={homeData?.style?.wizardWorkspace?.useBackgroundColorGradient ?? false}
                    setUseGradient={(v) => updateStyleConfig("wizardWorkspace", "useBackgroundColorGradient", v)}
                    solidColor={homeData?.style?.wizardWorkspace?.backgroundColor ?? "#ffffff"}
                    setSolidColor={(v) => updateStyleConfig("wizardWorkspace", "backgroundColor", v)}
                    gradientStart={homeData?.style?.wizardWorkspace?.backgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("wizardWorkspace", "backgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.wizardWorkspace?.backgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("wizardWorkspace", "backgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.wizardWorkspace?.backgroundColorGradientEnd ?? "#f8fafc"}
                    setGradientEnd={(v) => updateStyleConfig("wizardWorkspace", "backgroundColorGradientEnd", v)}
                  />
                  <GradientColorPicker
                    label="Panel Background"
                    useGradient={homeData?.style?.wizardWorkspace?.usePanelBackgroundColorGradient ?? false}
                    setUseGradient={(v) => updateStyleConfig("wizardWorkspace", "usePanelBackgroundColorGradient", v)}
                    solidColor={homeData?.style?.wizardWorkspace?.panelBackgroundColor ?? "#ffffff"}
                    setSolidColor={(v) => updateStyleConfig("wizardWorkspace", "panelBackgroundColor", v)}
                    gradientStart={homeData?.style?.wizardWorkspace?.panelBackgroundColorGradientStart ?? "#ffffff"}
                    setGradientStart={(v) => updateStyleConfig("wizardWorkspace", "panelBackgroundColorGradientStart", v)}
                    gradientMiddle={homeData?.style?.wizardWorkspace?.panelBackgroundColorGradientMiddle ?? "#ffffff"}
                    setGradientMiddle={(v) => updateStyleConfig("wizardWorkspace", "panelBackgroundColorGradientMiddle", v)}
                    gradientEnd={homeData?.style?.wizardWorkspace?.panelBackgroundColorGradientEnd ?? "#f8fafc"}
                    setGradientEnd={(v) => updateStyleConfig("wizardWorkspace", "panelBackgroundColorGradientEnd", v)}
                  />
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
              </>
            )}
            {wizardStyleTab === "buttons" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Wizard Buttons</h4>
                <GradientColorPicker
                  label="Button Background"
                  useGradient={homeData?.style?.wizardButtons?.useBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("wizardButtons", "useBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.wizardButtons?.backgroundColor ?? "#e2e8f0"}
                  setSolidColor={(v) => updateStyleConfig("wizardButtons", "backgroundColor", v)}
                  gradientStart={homeData?.style?.wizardButtons?.backgroundColorGradientStart ?? "#e2e8f0"}
                  setGradientStart={(v) => updateStyleConfig("wizardButtons", "backgroundColorGradientStart", v)}
                  gradientMiddle={homeData?.style?.wizardButtons?.backgroundColorGradientMiddle ?? "#e2e8f0"}
                  setGradientMiddle={(v) => updateStyleConfig("wizardButtons", "backgroundColorGradientMiddle", v)}
                  gradientEnd={homeData?.style?.wizardButtons?.backgroundColorGradientEnd ?? "#cbd5e1"}
                  setGradientEnd={(v) => updateStyleConfig("wizardButtons", "backgroundColorGradientEnd", v)}
                />
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Button Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.wizardButtons?.color ?? "#0f172a"}
                    onChange={(e) => updateStyleConfig("wizardButtons", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <GradientColorPicker
                  label="Hover Background"
                  useGradient={homeData?.style?.wizardButtons?.useHoverBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("wizardButtons", "useHoverBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.wizardButtons?.hoverBackgroundColor ?? "#cbd5e1"}
                  setSolidColor={(v) => updateStyleConfig("wizardButtons", "hoverBackgroundColor", v)}
                  gradientStart={homeData?.style?.wizardButtons?.hoverBackgroundColorGradientStart ?? "#cbd5e1"}
                  setGradientStart={(v) => updateStyleConfig("wizardButtons", "hoverBackgroundColorGradientStart", v)}
                  gradientMiddle={homeData?.style?.wizardButtons?.hoverBackgroundColorGradientMiddle ?? "#cbd5e1"}
                  setGradientMiddle={(v) => updateStyleConfig("wizardButtons", "hoverBackgroundColorGradientMiddle", v)}
                  gradientEnd={homeData?.style?.wizardButtons?.hoverBackgroundColorGradientEnd ?? "#94a3b8"}
                  setGradientEnd={(v) => updateStyleConfig("wizardButtons", "hoverBackgroundColorGradientEnd", v)}
                />
                <div className="admin-search-row" style={{ marginTop: "12px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Font Size</span>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={homeData?.style?.wizardButtons?.fontSize ?? 12}
                      onChange={(e) => updateStyleConfig("wizardButtons", "fontSize", Number(e.target.value))}
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
            )}
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
