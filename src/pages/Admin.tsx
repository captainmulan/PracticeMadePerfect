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

function GradientColorPicker({
  label,
  useGradient,
  setUseGradient,
  solidColor,
  setSolidColor,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
}: {
  label: string;
  useGradient: boolean;
  setUseGradient: (v: boolean) => void;
  solidColor: string;
  setSolidColor: (v: string) => void;
  gradientStart: string;
  setGradientStart: (v: string) => void;
  gradientEnd: string;
  setGradientEnd: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <input
          type="checkbox"
          checked={useGradient}
          onChange={(e) => setUseGradient(e.target.checked)}
        />
        <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>{label}</span>
      </label>
      {useGradient ? (
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
            <span className="admin-task-editor-label">End</span>
            <input
              type="color"
              value={gradientEnd}
              onChange={(e) => setGradientEnd(e.target.value)}
              className="admin-grid-input"
            />
          </label>
        </div>
      ) : (
        <label className="admin-task-editor-field">
          <input
            type="color"
            value={solidColor}
            onChange={(e) => setSolidColor(e.target.value)}
            className="admin-grid-input"
          />
        </label>
      )}
    </div>
  );
}

function GradientColorPicker3({
  label,
  useGradient,
  setUseGradient,
  solidColor,
  setSolidColor,
  gradientStart,
  setGradientStart,
  gradientMiddle,
  setGradientMiddle,
  gradientEnd,
  setGradientEnd,
}: {
  label: string;
  useGradient: boolean;
  setUseGradient: (v: boolean) => void;
  solidColor: string;
  setSolidColor: (v: string) => void;
  gradientStart: string;
  setGradientStart: (v: string) => void;
  gradientMiddle: string;
  setGradientMiddle: (v: string) => void;
  gradientEnd: string;
  setGradientEnd: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <input
          type="checkbox"
          checked={useGradient}
          onChange={(e) => setUseGradient(e.target.checked)}
        />
        <span className="admin-task-editor-label" style={{ marginBottom: 0 }}>{label}</span>
      </label>
      {useGradient ? (
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
      ) : (
        <label className="admin-task-editor-field">
          <input
            type="color"
            value={solidColor}
            onChange={(e) => setSolidColor(e.target.value)}
            className="admin-grid-input"
          />
        </label>
      )}
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
  const [homeStyleTab, setHomeStyleTab] = useState<"json" | "main" | "topmenu" | "buttons" | "bookshelf" | "tabs">("main");
  const [wizardStyleTab, setWizardStyleTab] = useState<"topinfo" | "workspace" | "buttons">("topinfo");

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

  function updateStyleConfig(category: string, key: string, value: string | boolean) {
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
                <GradientColorPicker
                  label="Background"
                  useGradient={homeData?.style?.main?.useGradient ?? true}
                  setUseGradient={(v) => updateStyleConfig("main", "useGradient", v)}
                  solidColor={homeData?.style?.main?.backgroundColor ?? "#f8fafc"}
                  setSolidColor={(v) => updateStyleConfig("main", "backgroundColor", v)}
                  gradientStart={homeData?.style?.main?.backgroundGradientStart ?? "#f8fafc"}
                  setGradientStart={(v) => updateStyleConfig("main", "backgroundGradientStart", v)}
                  gradientEnd={homeData?.style?.main?.backgroundGradientEnd ?? "#eef2f7"}
                  setGradientEnd={(v) => updateStyleConfig("main", "backgroundGradientEnd", v)}
                />
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
            {homeStyleTab === "topmenu" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Top Main Menu</h4>
                <GradientColorPicker
                  label="Background"
                  useGradient={homeData?.style?.topMenu?.useBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("topMenu", "useBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.topMenu?.backgroundColor ?? "rgba(255, 255, 255, 0.96)"}
                  setSolidColor={(v) => updateStyleConfig("topMenu", "backgroundColor", v)}
                  gradientStart={homeData?.style?.topMenu?.backgroundColorGradientStart ?? "rgba(255, 255, 255, 0.96)"}
                  setGradientStart={(v) => updateStyleConfig("topMenu", "backgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.topMenu?.backgroundColorGradientEnd ?? "rgba(245, 245, 245, 0.96)"}
                  setGradientEnd={(v) => updateStyleConfig("topMenu", "backgroundColorGradientEnd", v)}
                />
                <div className="admin-search-row">
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
                  <GradientColorPicker
                    label="Logo Background"
                    useGradient={homeData?.style?.topMenu?.useLogoBackgroundColorGradient ?? false}
                    setUseGradient={(v) => updateStyleConfig("topMenu", "useLogoBackgroundColorGradient", v)}
                    solidColor={homeData?.style?.topMenu?.logoBackgroundColor ?? "#0f172a"}
                    setSolidColor={(v) => updateStyleConfig("topMenu", "logoBackgroundColor", v)}
                    gradientStart={homeData?.style?.topMenu?.logoBackgroundColorGradientStart ?? "#0f172a"}
                    setGradientStart={(v) => updateStyleConfig("topMenu", "logoBackgroundColorGradientStart", v)}
                    gradientEnd={homeData?.style?.topMenu?.logoBackgroundColorGradientEnd ?? "#1e293b"}
                    setGradientEnd={(v) => updateStyleConfig("topMenu", "logoBackgroundColorGradientEnd", v)}
                  />
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
            )}
            {homeStyleTab === "buttons" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Buttons</h4>
                <GradientColorPicker
                  label="Primary Button Background"
                  useGradient={homeData?.style?.buttons?.usePrimaryBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("buttons", "usePrimaryBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.buttons?.primaryBackgroundColor ?? "#0f172a"}
                  setSolidColor={(v) => updateStyleConfig("buttons", "primaryBackgroundColor", v)}
                  gradientStart={homeData?.style?.buttons?.primaryBackgroundColorGradientStart ?? "#0f172a"}
                  setGradientStart={(v) => updateStyleConfig("buttons", "primaryBackgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.buttons?.primaryBackgroundColorGradientEnd ?? "#1e293b"}
                  setGradientEnd={(v) => updateStyleConfig("buttons", "primaryBackgroundColorGradientEnd", v)}
                />
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Primary Button Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.primaryColor ?? "#ffffff"}
                    onChange={(e) => updateStyleConfig("buttons", "primaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <GradientColorPicker
                  label="Secondary Button Background"
                  useGradient={homeData?.style?.buttons?.useSecondaryBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("buttons", "useSecondaryBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.buttons?.secondaryBackgroundColor ?? "#e2e8f0"}
                  setSolidColor={(v) => updateStyleConfig("buttons", "secondaryBackgroundColor", v)}
                  gradientStart={homeData?.style?.buttons?.secondaryBackgroundColorGradientStart ?? "#e2e8f0"}
                  setGradientStart={(v) => updateStyleConfig("buttons", "secondaryBackgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.buttons?.secondaryBackgroundColorGradientEnd ?? "#cbd5e1"}
                  setGradientEnd={(v) => updateStyleConfig("buttons", "secondaryBackgroundColorGradientEnd", v)}
                />
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Secondary Button Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.buttons?.secondaryColor ?? "#334155"}
                    onChange={(e) => updateStyleConfig("buttons", "secondaryColor", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
              </div>
            )}
            {homeStyleTab === "bookshelf" && (
              <div className="panel panel-bordered" style={{ padding: "16px" }}>
                <h4 style={{ marginTop: 0 }}>Bookshelf</h4>
                <GradientColorPicker
                  label="Background"
                  useGradient={homeData?.style?.bookshelf?.useBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("bookshelf", "useBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.bookshelf?.backgroundColor ?? "#ffffff"}
                  setSolidColor={(v) => updateStyleConfig("bookshelf", "backgroundColor", v)}
                  gradientStart={homeData?.style?.bookshelf?.backgroundColorGradientStart ?? "#ffffff"}
                  setGradientStart={(v) => updateStyleConfig("bookshelf", "backgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.bookshelf?.backgroundColorGradientEnd ?? "#f8fafc"}
                  setGradientEnd={(v) => updateStyleConfig("bookshelf", "backgroundColorGradientEnd", v)}
                />
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
                <GradientColorPicker
                  label="Inactive Tab Background"
                  useGradient={homeData?.style?.tabs?.useBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("tabs", "useBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.tabs?.backgroundColor ?? "#e2e8f0"}
                  setSolidColor={(v) => updateStyleConfig("tabs", "backgroundColor", v)}
                  gradientStart={homeData?.style?.tabs?.backgroundColorGradientStart ?? "#e2e8f0"}
                  setGradientStart={(v) => updateStyleConfig("tabs", "backgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.tabs?.backgroundColorGradientEnd ?? "#cbd5e1"}
                  setGradientEnd={(v) => updateStyleConfig("tabs", "backgroundColorGradientEnd", v)}
                />
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Inactive Tab Color</span>
                  <input
                    type="color"
                    value={homeData?.style?.tabs?.color ?? "#334155"}
                    onChange={(e) => updateStyleConfig("tabs", "color", e.target.value)}
                    className="admin-grid-input"
                  />
                </label>
                <GradientColorPicker
                  label="Active Tab Background"
                  useGradient={homeData?.style?.tabs?.useActiveBackgroundColorGradient ?? false}
                  setUseGradient={(v) => updateStyleConfig("tabs", "useActiveBackgroundColorGradient", v)}
                  solidColor={homeData?.style?.tabs?.activeBackgroundColor ?? "#0f172a"}
                  setSolidColor={(v) => updateStyleConfig("tabs", "activeBackgroundColor", v)}
                  gradientStart={homeData?.style?.tabs?.activeBackgroundColorGradientStart ?? "#0f172a"}
                  setGradientStart={(v) => updateStyleConfig("tabs", "activeBackgroundColorGradientStart", v)}
                  gradientEnd={homeData?.style?.tabs?.activeBackgroundColorGradientEnd ?? "#1e293b"}
                  setGradientEnd={(v) => updateStyleConfig("tabs", "activeBackgroundColorGradientEnd", v)}
                />
                <label className="admin-task-editor-field">
                  <span className="admin-task-editor-label">Active Tab Color</span>
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
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardWorkspace?.descriptionColor ?? "#64748b"}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="10"
                        max="48"
                        value={homeData?.style?.wizardWorkspace?.descriptionFontSize ?? 16}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionFontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardWorkspace?.descriptionFontWeight ?? "normal"}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionFontWeight", e.target.value)}
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
                        value={homeData?.style?.wizardWorkspace?.descriptionLineHeight ?? 1.6}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionLineHeight", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Padding Top</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={homeData?.style?.wizardWorkspace?.descriptionPaddingTop ?? 16}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionPaddingTop", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Padding Bottom</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={homeData?.style?.wizardWorkspace?.descriptionPaddingBottom ?? 16}
                        onChange={(e) => updateStyleConfig("wizardWorkspace", "descriptionPaddingBottom", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            {wizardStyleTab === "workspace" && (
              <>
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
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
                <div className="panel panel-bordered" style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Text Color</h4>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Text Color</span>
                    <input
                      type="color"
                      value={homeData?.style?.wizardWorkspace?.textColor ?? "#0f172a"}
                      onChange={(e) => updateStyleConfig("wizardWorkspace", "textColor", e.target.value)}
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
