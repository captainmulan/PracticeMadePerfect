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
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean[]>>({});

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
  const verificationValues = verificationResults[selectedTask?.id ?? ""] ?? checklist.map(() => false);

  function verifyCode() {
    if (!selectedTask || !selectedTask.verificationKeywords) {
      setVerificationResults((prev) => ({
        ...prev,
        [selectedTask?.id ?? ""]: checklist.map(() => true),
      }));
      return;
    }

    const code = taskContent.toLowerCase();
    const results = selectedTask.verificationKeywords.map((keywords) => {
      return keywords.every((keyword) => code.includes(keyword.toLowerCase()));
    });

    setVerificationResults((prev) => ({
      ...prev,
      [selectedTask.id]: results,
    }));

    // Auto-update checklist based on verification
    setChecklistState((prev) => ({
      ...prev,
      [selectedTask.id]: results,
    }));
  }

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
    setVerificationResults((prev) => ({ ...prev, [selectedTask.id]: checklist.map(() => false) }));
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

  const allChecklistComplete = checklistValues.every((val) => val);

  return (
    <div className="practice-page practice-wizard">
      {/* Mobile sticky header that shows current task title when top panel is hidden */}
      <div className="practice-mobile-header" aria-hidden={showInstructions ? "false" : "false"}>
        <div className="mobile-title">{selectedTask.title}</div>
      </div>
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
          {allChecklistComplete && <span className="status-badge complete">✓ Complete</span>}
        </div>
      </section>

      <section className={`practice-layout ${showInstructions ? "" : "full-code"}`}>
        <aside className={`practice-left panel ${showInstructions ? "visible" : "hidden"}`}>
          <div className="practice-left-header">
            <div>
              <div className="panel-heading">Instructions & Checklist</div>
              <p className="panel-body">Follow the steps below to complete this task.</p>
            </div>
            <button type="button" className="panel-toggle" onClick={() => setShowInstructions((current) => !current)}>
              {showInstructions ? "Hide" : "Show"}
            </button>
          </div>

          {showInstructions ? (
            <div className="instructions-section">
              {selectedTask.detailedInstructions && (
                <div className="detailed-instructions">
                  <div className="instructions-title">📋 Step-by-step Guide</div>
                  <ol className="instructions-list">
                    {selectedTask.detailedInstructions.map((instruction, index) => (
                      <li key={index} className="instruction-item">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="checklist">
                <div className="checklist-title">✅ Completion Checklist</div>
                {checklist.map((item, index) => (
                  <label key={index} className={`checklist-item ${checklistValues[index] ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checklistValues[index] ?? false}
                      onChange={() => handleToggleChecklist(index)}
                    />
                    <span className="checklist-text">{item}</span>
                    {verificationValues[index] && <span className="verified-badge">✓ Verified</span>}
                  </label>
                ))}
              </div>

              <button type="button" className="verify-button" onClick={verifyCode}>
                🔍 Verify Code
              </button>
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
