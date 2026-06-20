import type { Category, PracticeTask } from "../data/tasks";

interface PracticeQuestionHeroProps {
  selectedTask: PracticeTask;
  selectedCategory: Category;
  currentIndex: number;
  totalTasks: number;
  heroExpanded: boolean;
  onToggleHero: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PracticeQuestionHero({
  selectedTask,
  selectedCategory,
  currentIndex,
  totalTasks,
  heroExpanded,
  onToggleHero,
  onPrevious,
  onNext,
}: PracticeQuestionHeroProps) {
  return (
    <section className={`hero-banner panel ${heroExpanded ? "expanded" : "collapsed"}`}>
      <div className="hero-banner-header">
        <div className="hero-banner-summary">
          <div className="hero-banner-title-row">
            <div className="hero-title">Question</div>
            <span className="hero-page-index">
              {currentIndex + 1} / {totalTasks}
            </span>
          </div>
        </div>
        <div className="hero-banner-controls">
          <div className="hero-banner-actions">
            <button
              type="button"
              className="action-button practice-header-button practice-nav-button"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous question"
            >
              &lt;
            </button>
            <button
              type="button"
              className="action-button practice-header-button practice-nav-button"
              onClick={onNext}
              disabled={currentIndex >= totalTasks - 1}
              aria-label="Next question"
            >
              &gt;
            </button>
          </div>
          <button type="button" className="panel-toggle" onClick={onToggleHero} aria-expanded={heroExpanded}>
            {heroExpanded ? "−" : "+"}
          </button>
        </div>
      </div>
      {heroExpanded && (
        <div className="hero-banner-body">
          <div className="hero-meta-chips" aria-label="Task metadata">
            <span className="hero-category-tag">{selectedCategory.label}</span>
            <span className="hero-type-tag">{selectedTask.type}</span>
            <span className="hero-task-id" title={selectedTask.id}>
              {selectedTask.id}
            </span>
          </div>
          <p className="practice-description">{selectedTask.description}</p>
        </div>
      )}
    </section>
  );
}
