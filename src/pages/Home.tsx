import { useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData, getPracticePageData } from "../utils/contentStore";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { flattenCourseSteps } from "../data/courses";

export default function Home() {
  const [heroCollapsed, setHeroCollapsed] = useState(true);
  const data = getHomePageData();
  const categories = getPracticePageData().categories;
  const { courses, loaded: coursesLoaded } = useCourseCatalog();

  return (
    <div className="page-content page-home">
      <section className={`home-hero panel ${heroCollapsed ? "collapsed" : ""}`}>
        <button
          type="button"
          className="home-hero-toggle"
          onClick={() => setHeroCollapsed((value) => !value)}
          aria-expanded={!heroCollapsed}
        >
          {heroCollapsed ? "+" : "−"}
        </button>
        <div className="home-hero-copy">
          <div className="home-eyebrow">{data.title}</div>
          <h1 className="home-hero-title">{data.headline}</h1>
          {!heroCollapsed && (
            <>
              <p className="home-hero-description">{data.summary}</p>
              <div className="home-hero-features" dangerouslySetInnerHTML={{ __html: data.featureHtml }} />
              <div className="home-hero-actions">
                <Link to="/courses/react-crud" className="hero-cta">
                  Start a course
                </Link>
                <Link to="/practice/react" className="hero-secondary">
                  Practice categories
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="home-categories panel">
        <div className="category-group category-group-courses">
          <div className="category-group-header">Courses</div>
          <p className="category-group-subtitle">Wizard-style lessons built in Admin → Course Builder.</p>
          <div className="home-shelf-grid">
            {!coursesLoaded ? (
              <div className="home-course-loading">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="home-course-loading">No courses yet. Create one in Admin.</div>
            ) : (
              courses.map((course) => {
                const stepCount = flattenCourseSteps(course).length;
                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="category-card-netflix course-card"
                    style={{
                      borderLeftColor: course.color,
                      backgroundColor: `${course.color}15`,
                    }}
                  >
                    <div className="category-netflix-icon">{course.icon}</div>
                    <div className="category-netflix-content">
                      <div className="category-netflix-title">{course.title}</div>
                      <p className="category-netflix-subtitle">{course.description}</p>
                      <p className="course-card-meta">{course.chapters.length} chapters · {stepCount} steps</p>
                    </div>
                    <div className="category-card-cta">Start</div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="category-group">
          <div className="category-group-header">Concept</div>
          <div className="home-shelf-grid">
            {["solid", "angular-concepts"]
              .flatMap((categoryKey) => {
                const c = categories.find((item) => item.key === categoryKey);
                return c ? [c] : [];
              })
              .map((category) => (
                <Link
                  key={category.key}
                  to={`/practice/${category.key}`}
                  className="category-card-netflix"
                  style={{
                    borderLeftColor: category.color,
                    backgroundColor: `${category.color}15`,
                  }}
                >
                  <div className="category-netflix-icon">{category.icon}</div>
                  <div className="category-netflix-content">
                    <div className="category-netflix-title">{category.label}</div>
                    <p className="category-netflix-subtitle">{category.description}</p>
                  </div>
                  <div className="category-card-cta">Explore</div>
                </Link>
              ))}
          </div>
        </div>

        <div className="category-group">
          <div className="category-group-header">Code</div>
          <div className="home-shelf-grid">
            {categories
              .filter((c) => ["react", "angular", "csharp", "sql"].includes(c.key))
              .map((category) => (
                <Link
                  key={category.key}
                  to={`/practice/${category.key}`}
                  className="category-card-netflix"
                  style={{
                    borderLeftColor: category.color,
                    backgroundColor: `${category.color}15`,
                  }}
                >
                  <div className="category-netflix-icon">{category.icon}</div>
                  <div className="category-netflix-content">
                    <div className="category-netflix-title">{category.label}</div>
                    <p className="category-netflix-subtitle">{category.description}</p>
                  </div>
                  <div className="category-card-cta">Explore</div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
