import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PracticeQuestionHero from "../components/PracticeQuestionHero";
import type { PracticeTask } from "../data/tasks";
import { usePracticeData } from "../utils/usePracticeData";
import { sortTasksInCategory } from "../utils/taskSort";

export default function PracticeText() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = usePracticeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(false);

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
    <div className="practice-page practice-wizard practice-text-page">      <PracticeQuestionHero
        selectedTask={selectedTask}
        selectedCategory={selectedCategory}
        currentIndex={currentIndex}
        totalTasks={filteredTasks.length}
        heroExpanded={heroExpanded}
        onToggleHero={() => setHeroExpanded((value) => !value)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <section className="practice-layout full-code">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">Answer</div>
          </div>
          {loadError ? (
            <div className="practice-error-message">
              <pre>{loadError}</pre>
            </div>
          ) : (
            <div
              className="practice-answer-html"
              dangerouslySetInnerHTML={{
                __html:
                  selectedTask.answerHtml ??
                  "<p><em>No HTML answer configured for this flashcard.</em></p>",
              }}
            />
          )}
        </section>
      </section>
    </div>
  );
}
