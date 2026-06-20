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
  const [adminTab, setAdminTab] = useState<"tasks" | "courses">("tasks");

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
        <button type="button" className={`admin-tab ${adminTab === "tasks" ? "active" : ""}`} onClick={() => setAdminTab("tasks")}>
          Practice Tasks
        </button>
        <button type="button" className={`admin-tab ${adminTab === "courses" ? "active" : ""}`} onClick={() => setAdminTab("courses")}>
          Course Builder
        </button>
      </div>

      {adminTab === "courses" ? (
        <section className="panel admin-editor admin-section">
          <AdminCourses />
        </section>
      ) : !dbLoaded ? (
        <section className="panel admin-editor admin-section"><div className="admin-section-body">Loading browser SQLite...</div></section>
      ) : (
        <section className="panel admin-editor admin-section admin-single-editor">
          <div className="admin-search-toolbar admin-search-toolbar-top panel-bordered">
            <div className="admin-search-row">
              <input
                id="adminTaskSearchId"
                type="search"
                value={searchId}
                onChange={(event) => { setSearchId(event.target.value); setCurrentPage(1); }}
                placeholder="Search by id"
                aria-label="Search by id"
                className="admin-search-input"
              />
              <input
                id="adminTaskSearchTitle"
                type="search"
                value={searchTitle}
                onChange={(event) => { setSearchTitle(event.target.value); setCurrentPage(1); }}
                placeholder="Search by title"
                aria-label="Search by title"
                className="admin-search-input"
              />
              <input
                id="adminTaskSearchCategory"
                type="search"
                value={searchCategory}
                onChange={(event) => { setSearchCategory(event.target.value); setCurrentPage(1); }}
                placeholder="Search by category"
                aria-label="Search by category"
                className="admin-search-input"
              />
            </div>
            <div className="admin-search-controls">
              <button type="button" className="footer-button secondary" disabled={currentPageIndex === 1} onClick={() => setCurrentPage(currentPageIndex - 1)}>
                Prev
              </button>
              <button type="button" className="footer-button secondary" disabled={currentPageIndex >= totalPages} onClick={() => setCurrentPage(currentPageIndex + 1)}>
                Next
              </button>
            </div>
          </div>
          <div className="admin-toolbar-actions">
            <button type="button" className="footer-button" onClick={addTask}>New Task</button>
          </div>

          <div className="admin-search-results-panel panel-bordered">
            <div className="admin-search-results-header">
              <strong>Results</strong>
              <span className="admin-search-count">
                Showing {Math.min(filteredTasks.length, pageStart + 1)}–{Math.min(filteredTasks.length, pageStart + pageSize)} of {filteredTasks.length}
              </span>
            </div>
            <div className="admin-search-results-list">
              {pageTasks.length === 0 ? (
                <div className="admin-empty-state">No matching tasks. Click New Task to create one.</div>
              ) : null}
              {pageTasks.map((t) => {
                const cIndex = resolveCategoryIndex(t);
                const tIndex = resolveTaskIndex(t);
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`admin-search-result-item ${selectedTaskId === t.id ? "selected" : ""}`}
                    onClick={() => {
                      clearDraft();
                      setSelectedTaskId(t.id);
                    }}
                  >
                    <div className="admin-search-result-title">{t.title || t.id}</div>
                    <div className="admin-search-result-details">
                      <div>C_Index: {cIndex ?? "—"}</div>
                      <div>T_Index: {tIndex ?? "—"}</div>
                      <div>Id: {t.id}</div>
                      <div>Type: {t.type}</div>
                      <div>Category: {t.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-single-editor-body panel-bordered">
            {selectedTaskId ? (
              (() => {
                const isDraft = selectedTaskId === NEW_TASK_DRAFT_ID;
                const task = isDraft ? draftTask : tasks.find((x) => x.id === selectedTaskId);
                if (!task) return <div>Selected task not found.</div>;

                const updateField = <K extends keyof PracticeTask>(field: K, value: PracticeTask[K]) => {
                  if (isDraft) {
                    updateDraftField(field, value);
                  } else {
                    updateTaskField(task.id, field, value);
                  }
                };

                const categoryIndexValue = resolveCategoryIndex(task);
                const taskIndexValue = resolveTaskIndex(task);

                return (
                  <div className="admin-task-editor">
                    {isDraft ? <div className="admin-draft-banner">New task — fill in details and click Save.</div> : null}
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">ID</span>
                      <input
                        type="text"
                        value={task.id}
                        onChange={(e) => updateField("id", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Category Index</span>
                      <input
                        type="number"
                        value={typeof categoryIndexValue === "number" ? String(categoryIndexValue) : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateField(
                            "categoryIndex",
                            v === "" ? (undefined as PracticeTask["categoryIndex"]) : Number(v),
                          );
                        }}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Task Index</span>
                      <input
                        type="number"
                        value={typeof taskIndexValue === "number" ? String(taskIndexValue) : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          const next = v === "" ? undefined : Number(v);
                          updateField("taskIndex", next);
                          updateField("index", next);
                        }}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Category</span>
                      <input
                        type="text"
                        value={task.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Title</span>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Type</span>
                      <select
                        value={task.type}
                        onChange={(e) => updateField("type", e.target.value as PracticeTask["type"])}
                        className="admin-grid-select"
                      >
                        <option value="code">code</option>
                        <option value="sql">sql</option>
                        <option value="text">text</option>
                      </select>
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Description</span>
                      <textarea rows={3} value={task.description ?? ""} onChange={(e) => updateField("description", e.target.value)} className="admin-grid-input" />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Checklist (one per line)</span>
                      <textarea
                        rows={4}
                        value={(task.checklist ?? []).join("\n")}
                        onChange={(e) =>
                          updateField(
                            "checklist",
                            e.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) as PracticeTask["checklist"],
                          )
                        }
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Starter Code</span>
                      <textarea rows={4} value={task.starterCode ?? ""} onChange={(e) => updateField("starterCode", e.target.value)} className="admin-grid-input" />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Detailed Instructions (one per line)</span>
                      <textarea rows={4} value={(task.detailedInstructions ?? []).join("\n")} onChange={(e) => updateField("detailedInstructions", e.target.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean) as PracticeTask["detailedInstructions"])} className="admin-grid-input" />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Answer HTML</span>
                      <textarea rows={4} value={task.answerHtml ?? ""} onChange={(e) => updateField("answerHtml", e.target.value)} className="admin-grid-input" />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Verification Keywords (JSON format - array of arrays)</span>
                      <textarea rows={4} value={JSON.stringify(task.verificationKeywords ?? [], null, 2)} onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateField("verificationKeywords", parsed as PracticeTask["verificationKeywords"]);
                        } catch {
                          // Ignore parse errors while typing
                        }
                      }} className="admin-grid-input" />
                    </label>
                    <div className="admin-single-action-row admin-editor-actions">
                      <button type="button" className="footer-button" onClick={() => saveSingleRecord(task)}>Save</button>
                      {!isDraft ? (
                        <button
                          type="button"
                          className="footer-button"
                          onClick={async () => {
                            deleteTask(task.id);
                            setSelectedTaskId(null);
                            try {
                              const db = await openBrowserDb();
                              deleteTaskFromBrowserDb(db, task.id);
                              persistBrowserDbToLocalStorage(db);
                              const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
                              const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
                              const nextTasks = tasks.filter((existing) => existing.id !== task.id);
                              saveAdminData({ homePageData, practicePageData: { ...practicePageMeta, tasks: nextTasks } });
                              setMessage("Deleted task.");
                            } catch (err) {
                              setMessage(String(err));
                            }
                          }}
                        >
                          Delete
                        </button>
                      ) : null}
                      <button type="button" className="footer-button secondary" onClick={() => { clearDraft(); setMessage(""); }}>Clear</button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="admin-empty-state">No task selected. Use the search box or click New Task to create one.</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
