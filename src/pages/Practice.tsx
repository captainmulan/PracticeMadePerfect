import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { practicePageData } from "../pageData/practicePage";
import type { PracticeTask } from "../data/tasks";

export default function Practice() {
  const navigate = useNavigate();
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = practicePageData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});

  const filteredTasks = useMemo(
    () => data.tasks.filter((task) => task.category === categoryKey),
    [categoryKey, data.tasks],
  );

  const selectedCategory = data.categories.find((category) => category.key === categoryKey);

  useEffect(() => {
    setCurrentIndex(0);
  }, [categoryKey]);

  const selectedTask = filteredTasks[currentIndex];
  const taskContent = drafts[selectedTask?.id ?? ""] ?? selectedTask?.starterCode ?? "";
  const checklist = selectedTask?.checklist ?? [];
  const checklistValues = checklistState[selectedTask?.id ?? ""] ?? checklist.map(() => false);

  function handleDraftChange(value: string) {
    if (!selectedTask) return;
    setDrafts((prev) => ({ ...prev, [selectedTask.id]: value }));
  }

  function handleToggleChecklist(index: number) {
    if (!selectedTask) return;
    setChecklistState((prev) => {
      const current = prev[selectedTask.id] ?? checklist.map(() => false);
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [selectedTask.id]: next };
    });
  }

  function handleReset() {
    if (!selectedTask) return;
    setDrafts((prev) => ({ ...prev, [selectedTask.id]: selectedTask.starterCode ?? "" }));
    setChecklistState((prev) => ({ ...prev, [selectedTask.id]: checklist.map(() => false) }));
  }

  function handleNext() {
    setCurrentIndex((value) => Math.min(value + 1, filteredTasks.length - 1));
  }

  function handlePrevious() {
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }

  if (!selectedCategory) {
    return (
      <div className="practice-page panel">
        <div className="panel-heading">Category not found</div>
        <div className="panel-body">
          <p>Pick a valid practice type from the home screen.</p>
          <Link to="/" className="primary-button">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="practice-page panel">
        <div className="panel-heading">No tasks available</div>
        <div className="panel-body">
          <p>There are no tasks configured for this category yet.</p>
          <Link to="/" className="primary-button">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page practice-wizard">
      <section className="practice-top-panel panel">
        <div className="practice-top-copy">
          <p className="page-tag">{selectedCategory.label}</p>
          <h2 className="practice-title">{selectedTask.title}</h2>
          <p className="practice-description">{selectedTask.description}</p>
        </div>
        <div className="practice-status">
          <span className="task-count">
            {currentIndex + 1} / {filteredTasks.length}
          </span>
          <span>{selectedTask.type.toUpperCase()}</span>
        </div>
      </section>

      <section className={`practice-layout ${showInstructions ? "" : "full-code"}`}>
        <aside className={`practice-left panel ${showInstructions ? "visible" : "hidden"}`}>
          <div className="practice-left-header">
            <div>
              <div className="panel-heading">Instructions</div>
              <p className="panel-body">Review the checklist and expand the workspace as needed.</p>
            </div>
            <button type="button" className="panel-toggle" onClick={() => setShowInstructions((current) => !current)}>
              {showInstructions ? "Hide" : "Show"}
            </button>
          </div>

          {showInstructions ? (
            <div className="checklist">
              {checklist.map((item, index) => (
                <label key={index} className="checklist-item">
                  <input type="checkbox" checked={checklistValues[index] ?? false} onChange={() => handleToggleChecklist(index)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="panel-body">Instructions hidden. Tap show to review the checklist.</div>
          )}
        </aside>

        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">
              {selectedTask.type === "text"
                ? "Answer area"
                : selectedTask.type === "sql"
                ? "SQL editor"
                : "Code editor"}
            </div>
            {!showInstructions && (
              <button type="button" className="panel-toggle" onClick={() => setShowInstructions(true)}>
                Show Instructions
              </button>
            )}
          </div>

          <label className="practice-text-label">
            {selectedTask.type === "text"
              ? "Free text answer"
              : selectedTask.type === "sql"
              ? "SQL query"
              : "Starter code"}
            <textarea
              className={selectedTask.type === "text" ? "practice-textarea" : "practice-codearea"}
              value={taskContent}
              onChange={(event) => handleDraftChange(event.target.value)}
              placeholder={data.placeholder}
            />
          </label>
        </section>
      </section>

      <footer className="practice-footer panel">
        <div className="practice-footer-row">
          <button type="button" className="footer-button secondary" onClick={() => navigate("/")}>Exit</button>
          <button type="button" className="footer-button" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
          <button type="button" className="footer-button" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="footer-button" onClick={handleNext} disabled={currentIndex === filteredTasks.length - 1}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
