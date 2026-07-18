import { useEffect, useMemo, useRef, useState } from "react";
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
  getTasks,
  saveTask,
  deleteTask as deleteTaskFromDb,
  saveTasks,
  migrateFromSqlJs,
  exportIndexedDb,
  clearDatabase,
  importIndexedDb
} from "../utils/indexedDb";
import {
  loadSqlJs,
  restoreBundledBrowserDb,
  resetBrowserDbCache,
  shouldUsePersistedBrowserDb,
  LOCAL_STORAGE_DB_KEY
} from "../utils/sqliteBrowserDb";
import "./Admin.css";
import AdminCourses from "./AdminCourses";
import AdminDataSync from "./AdminDataSync";

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

interface TaskRow {
  id: string;
  filename: string;
  category: string;
  title: string;
  raw: string;
  categoryIndex: number | null;
  taskIndex: number | null;
  type: string;
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

export default function Admin({ onLogout }: { onLogout: () => void }) {
  const [homeJson, setHomeJson] = useState("");
  const [homeData, setHomeData] = useState<any>(null);
  const [practiceMetaJson, setPracticeMetaJson] = useState("");
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  const [adminTab, setAdminTab] = useState<"home" | "wizard-style" | "books" | "data-sync">("home");
  const [homeStyleTab, setHomeStyleTab] = useState<"json" | "main" | "hero" | "topmenu" | "buttons" | "bookshelf" | "tabs">("main");
  const [wizardStyleTab, setWizardStyleTab] = useState<"topinfo" | "workspace" | "buttons">("topinfo");
  const [wizardTopInfoSubTab, setWizardTopInfoSubTab] = useState<"background" | "navButtons" | "homeButton" | "chapterLabel" | "label" | "number" | "bookname" | "title" | "description">("background");
  const [isRestoringDb, setIsRestoringDb] = useState(false);
  const [isImportingDb, setIsImportingDb] = useState(false);
  const [isImportingJsonDb, setIsImportingJsonDb] = useState(false);
  const dbFileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonDbFileInputRef = useRef<HTMLInputElement | null>(null);

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

  async function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    await deleteTaskFromDb(taskId);
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

  function updateStyleConfig(path: string, keyOrValue: string | boolean | number, maybeValue?: string | boolean | number) {
    if (!homeData) return;
    const newHomeData = { ...homeData };
    let current: any = newHomeData;
    let key: string;
    let value: string | boolean | number;
    
    if (maybeValue !== undefined) {
      key = keyOrValue as string;
      value = maybeValue;
      const parts = path.split('.');
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = {};
        if (i === parts.length - 1) {
          current = current[part];
        } else {
          current = current[part];
        }
      }
    } else {
      key = path;
      value = keyOrValue;
    }

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
          navButton: {
            backgroundColor: "#e2e8f0",
            border: "none",
            color: "#0f172a",
            disabledColor: "#94a3b8",
            fontSize: 24,
            fontWeight: "bold"
          },
          homeButton: {
            backgroundColor: "#e2e8f0",
            border: "none",
            color: "#0f172a",
            fontSize: 18
          },
          chapterLabel: {
            backgroundColor: "rgba(15,23,42,0.05)",
            border: "none",
            color: "#64748b",
            fontSize: 14,
            fontWeight: "700"
          }
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
    if (maybeValue === undefined) {
      // Legacy case: path is category, keyOrValue is key
      if (!newHomeData.style[path]) {
        newHomeData.style[path] = {};
      }
      newHomeData.style[path][key] = value;
    } else {
      // New case: nested path, key is last part, current is the nested object
      // Wait, wait, let's fix this logic: for paths like "wizardTopInfo.navButton", we need to go into style first!
      let current2: any = newHomeData.style;
      const parts = path.split('.');
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current2[part]) current2[part] = {};
        if (i === parts.length - 1) {
          break;
        }
        current2 = current2[part];
      }
      // Now current2 is the object that should have the key
      current2[parts[parts.length - 1]][key] = value;
    }
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

  function resetDbFileInput() {
    if (dbFileInputRef.current) {
      dbFileInputRef.current.value = "";
    }
  }

  function resetJsonDbFileInput() {
    if (jsonDbFileInputRef.current) {
      jsonDbFileInputRef.current.value = "";
    }
  }

  async function handleImportJsonDb(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const enteredPassword = window.prompt("Enter admin password to import IndexedDB JSON file:", "");
    if (enteredPassword === null) {
      setMessage("Database import cancelled.");
      resetJsonDbFileInput();
      return;
    }

    if (enteredPassword !== "admin123") {
      setMessage("Incorrect password. Database import cancelled.");
      resetJsonDbFileInput();
      return;
    }

    setIsImportingJsonDb(true);
    setMessage("Importing IndexedDB JSON...");
    try {
      const text = await file.text();
      await clearDatabase();
      await importIndexedDb(text);
      setMessage("IndexedDB JSON imported. Reloading admin data...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`Import failed: ${errorMessage}`);
    } finally {
      setIsImportingJsonDb(false);
      resetJsonDbFileInput();
    }
  }

  async function handleImportDb(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const enteredPassword = window.prompt("Enter admin password to import a database file:", "");
    if (enteredPassword === null) {
      setMessage("Database import cancelled.");
      resetDbFileInput();
      return;
    }

    if (enteredPassword !== "admin123") {
      setMessage("Incorrect password. Database import cancelled.");
      resetDbFileInput();
      return;
    }

    setIsImportingDb(true);
    setMessage("Importing database...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const db = new (await loadSqlJs()).Database(bytes);
      
      // Now replace the browser DB with this imported one
      resetBrowserDbCache();
      if (shouldUsePersistedBrowserDb()) {
        try {
          window.localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(Array.from(db.export())));
        } catch (e) {
          console.warn("Failed to save imported database to localStorage (quota exceeded)", e);
        }
      }
      
      setMessage("Database imported. Reloading admin data...");
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`Import failed: ${errorMessage}`);
    } finally {
      setIsImportingDb(false);
      resetDbFileInput();
    }
  }

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImportAdminJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<ContentStoreData> & { style?: any };
      let imported = false;
      const importedHomePageData = "homePageData" in parsed
        ? parsed.homePageData
        : parsed && typeof parsed === "object" && "style" in parsed
          ? (parsed as ContentStoreData["homePageData"])
          : undefined;

      if (importedHomePageData) {
        setHomeData(importedHomePageData);
        setHomeJson(JSON.stringify(importedHomePageData, null, 2));
        imported = true;
      }

      let importedPracticePageData: ContentStoreData["practicePageData"] | undefined;
      if (parsed.practicePageData) {
        importedPracticePageData = parsed.practicePageData as ContentStoreData["practicePageData"];
        const { tasks: importedTasks, ...meta } = importedPracticePageData;
        if (Array.isArray(importedTasks)) {
          setTasks(importedTasks);
        }
        setPracticeMetaJson(JSON.stringify(meta, null, 2));
        imported = true;
      }

      if (!imported) {
        setMessage("Uploaded JSON did not contain expected admin data.");
      } else {
        const payload: ContentStoreData = {
          homePageData: importedHomePageData ?? loadDefaultAdminData().homePageData,
          practicePageData: importedPracticePageData ?? loadDefaultAdminData().practicePageData,
        };
        saveAdminData(payload);
        setMessage("Imported admin.json and saved it locally. The theme will now apply in the app.");
      }
    } catch (error) {
      setMessage(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      resetFileInput();
    }
  }

  async function handleSave() {
    try {
      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      const practicePageData = { ...practicePageMeta, tasks };

      saveAdminData({ homePageData, practicePageData });

      await saveTasks(tasks);

      setMessage("Saved task edits to IndexedDB.");
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
      const blob = await exportIndexedDb();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indexeddb-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Exported IndexedDB data to indexeddb-export.json. This contains all courses and tasks.");
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
          await deleteTaskFromDb(task.id);
          setSelectedTaskId(trimmedId);
        }
      }

      await saveTask(savedTask);

      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      saveAdminData({ homePageData, practicePageData: { ...practicePageMeta, tasks: nextTasks } });
      setMessage("Saved task to IndexedDB.");
      setDbError(null);
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <div className="page-content page-admin">
      <div className="admin-top-toolbar">
        <div className="admin-top-group">
          <button type="button" className={`admin-btn admin-btn-nav ${adminTab === "home" ? "active" : ""}`} onClick={() => setAdminTab("home")}>
            Home Page
          </button>
          <button type="button" className={`admin-btn admin-btn-nav ${adminTab === "wizard-style" ? "active" : ""}`} onClick={() => setAdminTab("wizard-style")}>
            Page Style
          </button>
          <button type="button" className={`admin-btn admin-btn-nav ${adminTab === "books" ? "active" : ""}`} onClick={() => setAdminTab("books")}>
            Book Builder
          </button>
        </div>

        <div className="admin-top-divider" aria-hidden="true" />

        <div className="admin-top-group">
          <button
            type="button"
            className="admin-btn admin-btn-data"
            onClick={() => dbFileInputRef.current?.click()}
            disabled={isImportingDb}
          >
            {isImportingDb ? "Importing..." : "Import DB"}
          </button>
          <input
            ref={dbFileInputRef}
            type="file"
            accept=".db"
            onChange={handleImportDb}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-data"
            onClick={() => jsonDbFileInputRef.current?.click()}
            disabled={isImportingJsonDb}
          >
            {isImportingJsonDb ? "Importing..." : "Import JSON DB"}
          </button>
          <input
            ref={jsonDbFileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJsonDb}
            style={{ display: "none" }}
          />
          <button type="button" className="admin-btn admin-btn-data" onClick={handleRestoreBundledDb} disabled={isRestoringDb}>
            {isRestoringDb ? "Restoring..." : "Restore Bundled Database"}
          </button>
          <button type="button" className={`admin-btn admin-btn-data ${adminTab === "data-sync" ? "active" : ""}`} onClick={() => setAdminTab("data-sync")}>
            Data Sync
          </button>
        </div>

        <div className="admin-top-divider" aria-hidden="true" />

        <div className="admin-top-group admin-top-group-auth">
          <button type="button" className="admin-btn admin-btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {message && <div className="admin-course-message">{message}</div>}

      {adminTab === "home" ? (
        <section className="panel admin-editor admin-section">
          <div className="admin-section-body">
            <div className="admin-search-actions" style={{ marginBottom: "16px" }}>
              <div className="admin-search-actions-end">
                <button type="button" className="footer-button" onClick={() => fileInputRef.current?.click()} style={{ marginRight: 8 }}>
                  Import admin.json
                </button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportAdminJson}
              style={{ display: "none" }}
            />
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
                <div style={{ marginBottom: "16px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Hero Theme</span>
                    <select
                      value={homeData?.style?.heroTheme?.selectedTheme ?? "space"}
                      onChange={(e) => {
                        const selectedTheme = e.target.value;
                        updateStyleConfig("heroTheme", "selectedTheme", selectedTheme);
                        // Only apply preset values if not custom
                        if (selectedTheme !== "custom") {
                          const preset = homeData?.style?.themePresets?.[selectedTheme as keyof typeof homeData.style.themePresets];
                          if (preset && preset.hero) {
                            // Apply hero styles from preset
                            updateStyleConfig("hero", "backgroundColor", preset.hero.backgroundColor);
                            updateStyleConfig("hero", "backgroundColorGradientStart", preset.hero.backgroundColorGradientStart);
                            updateStyleConfig("hero", "backgroundColorGradientMiddle", preset.hero.backgroundColorGradientMiddle);
                            updateStyleConfig("hero", "backgroundColorGradientEnd", preset.hero.backgroundColorGradientEnd);
                            updateStyleConfig("hero", "useBackgroundColorGradient", preset.hero.useBackgroundColorGradient);
                            updateStyleConfig("hero", "color", preset.hero.color);
                            updateStyleConfig("hero", "eyebrowColor", preset.hero.eyebrowColor);
                            updateStyleConfig("hero", "titleColor", preset.hero.titleColor);
                            updateStyleConfig("hero", "descriptionColor", preset.hero.descriptionColor);
                          }
                        }
                      }}
                      className="admin-grid-input"
                    >
                      {(homeData?.style?.heroTheme?.availableThemes ?? ["space", "ocean", "dinosaur", "custom"]).map((theme: string) => (
                        <option key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {homeData?.style?.heroTheme?.selectedTheme === "custom" && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
                      Use the gradient controls below to customize your hero theme
                    </div>
                  )}
                </div>
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
                <div style={{ marginBottom: "16px" }}>
                  <label className="admin-task-editor-field">
                    <span className="admin-task-editor-label">Theme Preset</span>
                    <select
                      value={homeData?.style?.bookshelfTheme?.selectedTheme ?? "space"}
                      onChange={(e) => {
                        const selectedTheme = e.target.value;
                        updateStyleConfig("bookshelfTheme", "selectedTheme", selectedTheme);
                        // Only apply preset values if not custom
                        if (selectedTheme !== "custom") {
                          const preset = homeData?.style?.themePresets?.[selectedTheme as keyof typeof homeData.style.themePresets];
                          if (preset) {
                            // Apply bookshelf background
                            updateStyleConfig("bookshelf", "backgroundColor", preset.backgroundColor);
                            updateStyleConfig("bookshelf", "backgroundColorGradientStart", preset.backgroundColorGradientStart);
                            updateStyleConfig("bookshelf", "backgroundColorGradientMiddle", preset.backgroundColorGradientMiddle);
                            updateStyleConfig("bookshelf", "backgroundColorGradientEnd", preset.backgroundColorGradientEnd);
                            updateStyleConfig("bookshelf", "useBackgroundColorGradient", preset.useBackgroundColorGradient);
                            updateStyleConfig("bookshelf", "borderColor", preset.borderColor);
                            
                            // Apply tabs styles
                            if (preset.tabs) {
                              updateStyleConfig("tabs", "backgroundColor", preset.tabs.backgroundColor);
                              updateStyleConfig("tabs", "backgroundColorGradientStart", preset.tabs.backgroundColorGradientStart);
                              updateStyleConfig("tabs", "backgroundColorGradientMiddle", preset.tabs.backgroundColorGradientMiddle);
                              updateStyleConfig("tabs", "backgroundColorGradientEnd", preset.tabs.backgroundColorGradientEnd);
                              updateStyleConfig("tabs", "useBackgroundColorGradient", preset.tabs.useBackgroundColorGradient);
                              updateStyleConfig("tabs", "color", preset.tabs.color);
                              updateStyleConfig("tabs", "activeBackgroundColor", preset.tabs.activeBackgroundColor);
                              updateStyleConfig("tabs", "activeBackgroundColorGradientStart", preset.tabs.activeBackgroundColorGradientStart);
                              updateStyleConfig("tabs", "activeBackgroundColorGradientMiddle", preset.tabs.activeBackgroundColorGradientMiddle);
                              updateStyleConfig("tabs", "activeBackgroundColorGradientEnd", preset.tabs.activeBackgroundColorGradientEnd);
                              updateStyleConfig("tabs", "useActiveBackgroundColorGradient", preset.tabs.useActiveBackgroundColorGradient);
                              updateStyleConfig("tabs", "activeColor", preset.tabs.activeColor);
                            }
                            
                            // Apply hero styles
                            if (preset.hero) {
                              updateStyleConfig("hero", "backgroundColor", preset.hero.backgroundColor);
                              updateStyleConfig("hero", "backgroundColorGradientStart", preset.hero.backgroundColorGradientStart);
                              updateStyleConfig("hero", "backgroundColorGradientMiddle", preset.hero.backgroundColorGradientMiddle);
                              updateStyleConfig("hero", "backgroundColorGradientEnd", preset.hero.backgroundColorGradientEnd);
                              updateStyleConfig("hero", "useBackgroundColorGradient", preset.hero.useBackgroundColorGradient);
                              updateStyleConfig("hero", "color", preset.hero.color);
                              updateStyleConfig("hero", "eyebrowColor", preset.hero.eyebrowColor);
                              updateStyleConfig("hero", "titleColor", preset.hero.titleColor);
                              updateStyleConfig("hero", "descriptionColor", preset.hero.descriptionColor);
                            }
                          }
                        }
                      }}
                      className="admin-grid-input"
                    >
                      {(homeData?.style?.bookshelfTheme?.availableThemes ?? ["space", "dinosaur", "ocean", "gradient", "custom"]).map((theme: string) => (
                        <option key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {homeData?.style?.bookshelfTheme?.selectedTheme === "custom" && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
                      Use the gradient controls below to customize your theme
                    </div>
                  )}
                </div>
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
                Navigation Menu
              </button>
              <button type="button" className={`admin-tab ${wizardStyleTab === "workspace" ? "active" : ""}`} onClick={() => setWizardStyleTab("workspace")}>
                Workspace
              </button>
              <button type="button" className={`admin-tab ${wizardStyleTab === "buttons" ? "active" : ""}`} onClick={() => setWizardStyleTab("buttons")}>
                Wizard Buttons
              </button>
            </div>
            {wizardStyleTab === "topinfo" && (
              <>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "background" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("background")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Background & Border
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "navButtons" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("navButtons")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Navigation Buttons
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "homeButton" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("homeButton")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Home Button
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "chapterLabel" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("chapterLabel")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Chapter Label
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "number" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("number")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Chapter Number
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "bookname" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("bookname")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Book Name
                  </button>
                  <button type="button" className={`admin-tab ${wizardTopInfoSubTab === "title" ? "active" : ""}`} onClick={() => setWizardTopInfoSubTab("title")} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Chapter Title
                  </button>
                </div>

                {/* Description panel - parent level, not sub-tab */}
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Description</h4>
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

                {wizardTopInfoSubTab === "background" && (
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
                )}

                {wizardTopInfoSubTab === "navButtons" && (
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Navigation Buttons</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.navButton?.backgroundColor ?? "#e2e8f0"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Border</span>
                      <input
                        type="text"
                        value={homeData?.style?.wizardTopInfo?.navButton?.border ?? "none"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "border", e.target.value)}
                        className="admin-grid-input"
                        placeholder="e.g. 1px solid #ccc"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Text Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.navButton?.color ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "color", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Disabled Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.navButton?.disabledColor ?? "#94a3b8"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "disabledColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="8"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.navButton?.fontSize ?? 24}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "fontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <input
                        type="text"
                        value={homeData?.style?.wizardTopInfo?.navButton?.fontWeight ?? "bold"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.navButton", "fontWeight", e.target.value)}
                        className="admin-grid-input"
                        placeholder="e.g. bold, 700"
                      />
                    </label>
                  </div>
                </div>
                )}

                {wizardTopInfoSubTab === "homeButton" && (
                <div className="panel panel-bordered" style={{ padding: "16px", marginBottom: "16px" }}>
                  <h4 style={{ marginTop: 0 }}>Home Button</h4>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.homeButton?.backgroundColor ?? "#e2e8f0"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.homeButton", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Border</span>
                      <input
                        type="text"
                        value={homeData?.style?.wizardTopInfo?.homeButton?.border ?? "none"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.homeButton", "border", e.target.value)}
                        className="admin-grid-input"
                        placeholder="e.g. 1px solid #ccc"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Text Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.homeButton?.color ?? "#0f172a"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.homeButton", "color", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row" style={{ marginTop: "12px" }}>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="8"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.homeButton?.fontSize ?? 18}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.homeButton", "fontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                </div>
                )}

                {wizardTopInfoSubTab === "chapterLabel" && (
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
                      <span className="admin-task-editor-label">Background Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.chapterLabel?.backgroundColor ?? "rgba(15,23,42,0.05)"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.chapterLabel", "backgroundColor", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Border</span>
                      <input
                        type="text"
                        value={homeData?.style?.wizardTopInfo?.chapterLabel?.border ?? "none"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.chapterLabel", "border", e.target.value)}
                        className="admin-grid-input"
                        placeholder="e.g. 1px solid #ccc"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Color</span>
                      <input
                        type="color"
                        value={homeData?.style?.wizardTopInfo?.chapterLabel?.color ?? homeData?.style?.wizardTopInfo?.chapterLabelColor ?? "#64748b"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.chapterLabel", "color", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                  </div>
                  <div className="admin-search-row">
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Size</span>
                      <input
                        type="number"
                        min="8"
                        max="48"
                        value={homeData?.style?.wizardTopInfo?.chapterLabel?.fontSize ?? homeData?.style?.wizardTopInfo?.chapterLabelFontSize ?? 14}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.chapterLabel", "fontSize", Number(e.target.value))}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field">
                      <span className="admin-task-editor-label">Font Weight</span>
                      <select
                        value={homeData?.style?.wizardTopInfo?.chapterLabel?.fontWeight ?? homeData?.style?.wizardTopInfo?.chapterLabelFontWeight ?? "700"}
                        onChange={(e) => updateStyleConfig("wizardTopInfo.chapterLabel", "fontWeight", e.target.value)}
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
                )}

                {wizardTopInfoSubTab === "number" && (
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
                )}
                {wizardTopInfoSubTab === "bookname" && (
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
                )}
                {wizardTopInfoSubTab === "title" && (
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
                )}
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
      ) : adminTab === "data-sync" ? (
        <section className="panel admin-editor admin-section">
          <AdminDataSync />
        </section>
      ) : (
        <section className="panel admin-editor admin-section">
          <AdminCourses />
        </section>
      )}
    </div>
  );
}
