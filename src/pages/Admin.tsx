import { useEffect, useState } from "react";
import {
  ContentStoreData,
  loadAdminData,
  loadDefaultAdminData,
  resetAdminData,
  saveAdminData,
} from "../utils/contentStore";
import type { PracticeTask } from "../data/tasks";

export default function Admin() {
  const [homeJson, setHomeJson] = useState("");
  const [practiceMetaJson, setPracticeMetaJson] = useState("");
  const [taskJsons, setTaskJsons] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const data = loadAdminData();
    setHomeJson(JSON.stringify(data.homePageData, null, 2));

    const { tasks, ...practiceMeta } = data.practicePageData;
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));

    const taskMap = Object.fromEntries(
      data.practicePageData.tasks.map((task) => [task.id, JSON.stringify(task, null, 2)]),
    );
    setTaskJsons(taskMap);

    const sectionKeys = ["homePageData", "practicePageData", ...Object.keys(taskMap)];
    setExpandedSections(Object.fromEntries(sectionKeys.map((key) => [key, false])));
  }, []);

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSave() {
    try {
      const homePageData = JSON.parse(homeJson) as ContentStoreData["homePageData"];
      const practicePageMeta = JSON.parse(practiceMetaJson) as Omit<ContentStoreData["practicePageData"], "tasks">;
      const tasks = Object.values(taskJsons).map((taskJson) => JSON.parse(taskJson) as PracticeTask);
      const practicePageData = {
        ...practicePageMeta,
        tasks,
      };

      saveAdminData({ homePageData, practicePageData });
      setMessage("Saved admin content to browser storage.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`Failed to save: ${errorMessage}`);
    }
  }

  function handleReset() {
    resetAdminData();
    const defaults = loadDefaultAdminData();
    setHomeJson(JSON.stringify(defaults.homePageData, null, 2));
    const { tasks, ...practiceMeta } = defaults.practicePageData;
    setPracticeMetaJson(JSON.stringify(practiceMeta, null, 2));

    const taskMap = Object.fromEntries(tasks.map((task) => [task.id, JSON.stringify(task, null, 2)]));
    setTaskJsons(taskMap);
    setMessage("Reset to default site content.");
  }

  function handleTaskChange(id: string, value: string) {
    setTaskJsons((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="page-content page-admin">
      <section className={`panel admin-panel hero-banner ${descriptionCollapsed ? "collapsed" : "expanded"}`}>
        <button
          type="button"
          className="hero-banner-header"
          onClick={() => setDescriptionCollapsed((s) => !s)}
          aria-expanded={!descriptionCollapsed}
        >
          <div className="hero-banner-summary">
            <div className="hero-banner-title-row">
              <h2 className="hero-title">Admin CMS</h2>
            </div>
          </div>
          <span className="hero-chevron" aria-hidden="true">
            {descriptionCollapsed ? "▸" : "▾"}
          </span>
        </button>
        {!descriptionCollapsed && (
          <div className="hero-banner-body">
            <p className="hero-description">
              Edit the site content and practice task configuration here. Changes persist in browser localStorage so you can update page data without modifying source files.
            </p>
            <div className="admin-actions">
              <button type="button" className="footer-button" onClick={handleSave}>
                Save Changes
              </button>
              <button type="button" className="footer-button secondary" onClick={handleReset}>
                Reset Defaults
              </button>
            </div>
            {message && <p className="admin-message">{message}</p>}
          </div>
        )}
      </section>

      <section className="panel admin-editor admin-section">
        <button
          type="button"
          className="admin-section-header"
          onClick={() => toggleSection("homePageData")}
          aria-expanded={expandedSections["homePageData"] ?? false}
        >
          <span>Home Page Data</span>
          <span>{expandedSections["homePageData"] ? "▾" : "▸"}</span>
        </button>
        {expandedSections["homePageData"] && (
          <div className="admin-section-body">
            <textarea
              className="practice-codearea"
              value={homeJson}
              onChange={(event) => setHomeJson(event.target.value)}
              rows={16}
            />
          </div>
        )}
      </section>

      <section className="panel admin-editor admin-section">
        <button
          type="button"
          className="admin-section-header"
          onClick={() => toggleSection("practicePageData")}
          aria-expanded={expandedSections["practicePageData"] ?? false}
        >
          <span>Practice Page Metadata</span>
          <span>{expandedSections["practicePageData"] ? "▾" : "▸"}</span>
        </button>
        {expandedSections["practicePageData"] && (
          <div className="admin-section-body">
            <textarea
              className="practice-codearea"
              value={practiceMetaJson}
              onChange={(event) => setPracticeMetaJson(event.target.value)}
              rows={16}
            />
          </div>
        )}
      </section>

      {Object.entries(taskJsons).map(([taskId, taskJson]) => {
        const isExpanded = expandedSections[taskId] ?? false;
        return (
          <section key={taskId} className="panel admin-editor admin-section">
            <button
              type="button"
              className="admin-section-header"
              onClick={() => toggleSection(taskId)}
              aria-expanded={isExpanded}
            >
              <span>Task: {taskId}</span>
              <span>{isExpanded ? "▾" : "▸"}</span>
            </button>
            {isExpanded && (
              <div className="admin-section-body">
                <textarea
                  className="practice-codearea"
                  value={taskJson}
                  onChange={(event) => handleTaskChange(taskId, event.target.value)}
                  rows={24}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
