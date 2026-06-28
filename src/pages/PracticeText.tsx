import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PracticeWorkspace from "../components/PracticeWorkspace";
import type { PracticeTask } from "../data/tasks";
import { useStageNavRegistration } from "../hooks/useStageNavRegistration";
import { usePracticeData } from "../utils/usePracticeData";
import { sortTasksInCategory } from "../utils/taskSort";

export default function PracticeText() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = usePracticeData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredTasks = useMemo(
    () => sortTasksInCategory(data.tasks.filter((task: PracticeTask) => task.category === categoryKey)),
    [categoryKey, data.tasks],
  );
  const selectedCategory = data.categories.find((category) => category.key === categoryKey);

  useEffect(() => {
    setCurrentIndex(0);
  }, [categoryKey]);

  const selectedTask = filteredTasks[currentIndex];
  const loadError = selectedTask?.loadError;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((value) => Math.min(value + 1, filteredTasks.length - 1));
  }, [filteredTasks.length]);

  useStageNavRegistration(
    currentIndex + 1,
    filteredTasks.length,
    currentIndex > 0,
    currentIndex < filteredTasks.length - 1,
    handlePrevious,
    handleNext,
  );

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

  const progressPct = Math.round(((currentIndex + 1) / filteredTasks.length) * 100);

  return (
    <div className="practice-page practice-wizard practice-text-page">
      <PracticeWorkspace
        eyebrow={selectedCategory.label}
        title={selectedTask.title}
        meta={`${selectedTask.type} · ${selectedTask.id}`}
        progressPct={progressPct}
        description={selectedTask.description}
        toolbarLabel="Answer"
      >
        {loadError ? (
          <div className="practice-error-message">
            <pre>{loadError}</pre>
          </div>
        ) : (
          <div
            className="practice-answer-html practice-workspace-content"
            dangerouslySetInnerHTML={{
              __html:
                selectedTask.answerHtml ??
                "<p><em>No HTML answer configured for this flashcard.</em></p>",
            }}
          />
        )}
      </PracticeWorkspace>
    </div>
  );
}
