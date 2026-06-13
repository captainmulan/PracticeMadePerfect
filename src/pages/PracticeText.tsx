import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PracticeTask } from "../data/tasks";
import { getPracticePageData } from "../utils/contentStore";

export default function PracticeText() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = getPracticePageData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(true);

  const filteredTasks = useMemo(
    () => data.tasks.filter((task: PracticeTask) => task.category === categoryKey),
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
    <div className="practice-page practice-wizard">
      <section className={`hero-banner panel ${heroExpanded ? "expanded" : "collapsed"}`}>
        <div className="hero-banner-header">
          <div className="hero-banner-title-row">
            <div className="hero-title">Question</div>
            <div className="hero-category-tag">{selectedCategory.label}</div>
            <div className="task-type-badge">{selectedTask.type.toUpperCase()}</div>
            <div className="hero-page-index">
              {currentIndex + 1}/{filteredTasks.length}
            </div>
          </div>
          <button
            type="button"
            className="panel-toggle"
            onClick={() => setHeroExpanded((value) => !value)}
          >
            {heroExpanded ? "−" : "+"}
          </button>
        </div>
        {heroExpanded && (
          <div className="hero-banner-body">
            <p className="practice-description">{selectedTask.description}</p>
          </div>
        )}
      </section>

      <section className="practice-layout full-code">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">Answer</div>
            <div className="practice-header-actions">
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={() => setHeroExpanded((value) => !value)}
              >
                {heroExpanded ? "Hide Question" : "Show Question"}
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={handleNext}
                disabled={currentIndex === filteredTasks.length - 1}
              >
                Next
              </button>
            </div>
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
