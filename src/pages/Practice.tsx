import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { usePracticeData } from "../utils/usePracticeData";
import { sortTasksInCategory } from "../utils/taskSort";
import PracticeCode from "./PracticeCode";
import PracticeText from "./PracticeText";

export default function Practice() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = usePracticeData();
  const selectedCategory = data.categories.find((category) => category.key === categoryKey);

  const filteredTasks = useMemo(
    () => sortTasksInCategory(data.tasks.filter((task) => task.category === categoryKey)),
    [categoryKey, data.tasks],
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

  if (filteredTasks.length === 0) {
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

  const pageType = selectedCategory.pageType ?? filteredTasks[0]?.type ?? "code";
  if (pageType === "text") {
    return <PracticeText />;
  }

  return <PracticeCode />;
}
