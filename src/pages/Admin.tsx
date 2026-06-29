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
  const [adminTab, setAdminTab] = useState<"home" | "books">("home");

  useEffect(() => {
    const defaultData = loadAdminData();
    setHomeJson(JSON.stringify(defaultData.homePageData, null, 2));
    const { tasks: adminTasks, ...practiceMeta } = defaultData.practicePageData;
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));
    setExpandedSections({ homePageData: false, practicePageData: false });

    async function loadAdminTasks() {
      try {
        let sqlTasks = await loadTasksFromBrowserSqlite();

        // Recover if browser cache was truncated (e.g. old single-row save bug).
        if (sqlTasks.length <= 1) {
          await restoreBundledBrowserDb();
          sqlTasks = await loadTasksFromBrowserSqlite();
        }

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
    resetBrowserDbCache();
    const defaults = loadDefaultAdminData();
    const { tasks: defaultsTasks, ...practiceMeta } = defaults.practicePageData;
    setHomeJson(JSON.stringify(defaults.homePageData, null, 2));
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));
    setTasks(defaultsTasks);
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
          Home Page Data
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
                <button type="button" className="footer-button secondary" onClick={handleReset}>
                  Reset
                </button>
                <button type="button" className="footer-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            {message && <div className="admin-course-message">{message}</div>}

            <div style={{ marginBottom: "16px" }}>
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
