import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData } from "../utils/contentStore";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { getHomeCourseShelfRows, type CourseShelfRow } from "../utils/courseShelf";
import HomeCourseShelves from "../components/HomeCourseShelves";

export default function Home() {
  const [heroCollapsed, setHeroCollapsed] = useState(true);
  const [selectedTab, setSelectedTab] = useState("IT");
  const data = getHomePageData();
  const style = data.style;
  const { courses, loaded: coursesLoaded } = useCourseCatalog();
  const rows = useMemo(() => getHomeCourseShelfRows(courses), [courses]);
  const selectedRow: CourseShelfRow | undefined = rows.find((row) => row.title === selectedTab) || rows[0];

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
                <Link 
                  to="/courses/react-crud" 
                  className="hero-cta"
                  style={{
                    backgroundColor: style?.buttons?.primaryBackgroundColor ?? "#0f172a",
                    color: style?.buttons?.primaryColor ?? "#ffffff"
                  }}
                >
                  Start reading
                </Link>
                <Link 
                  to="/practice/react" 
                  className="hero-secondary"
                  style={{
                    backgroundColor: style?.buttons?.secondaryBackgroundColor ?? "#e2e8f0",
                    color: style?.buttons?.secondaryColor ?? "#334155"
                  }}
                >
                  Browse books
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section 
        className="home-categories panel home-shelf-panel"
        style={{
          backgroundColor: style?.bookshelf?.backgroundColor ?? "#ffffff",
          borderColor: style?.bookshelf?.borderColor ?? "#e2e8f0"
        }}
      >
        <div className="container">
          <nav className="tabs">
            {rows.map((row) => (
              <button
                key={row.title}
                type="button"
                className={`tab ${selectedRow?.title === row.title ? "active" : ""}`}
                onClick={() => setSelectedTab(row.title)}
                style={{
                  backgroundColor: selectedRow?.title === row.title 
                    ? (style?.tabs?.activeBackgroundColor ?? "#0f172a") 
                    : (style?.tabs?.backgroundColor ?? "#e2e8f0"),
                  color: selectedRow?.title === row.title 
                    ? (style?.tabs?.activeColor ?? "#ffffff") 
                    : (style?.tabs?.color ?? "#334155")
                }}
              >
                {row.title}
              </button>
            ))}
          </nav>

          {!coursesLoaded ? (
            <div className="home-course-loading">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="home-course-loading">No courses yet. Create one in Admin.</div>
          ) : (
            selectedRow && <HomeCourseShelves row={selectedRow} />
          )}
        </div>
      </section>
    </div>
  );
}
