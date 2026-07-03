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
      <section
        className={`home-hero panel ${heroCollapsed ? "collapsed" : ""}`}
        style={{
          background: style?.hero?.useBackgroundColorGradient
            ? `linear-gradient(180deg, ${style.hero.backgroundColorGradientStart} 0%, ${style.hero.backgroundColorGradientMiddle ?? style.hero.backgroundColorGradientStart} 50%, ${style.hero.backgroundColorGradientEnd} 100%)`
            : (style?.hero?.backgroundColor ?? "#ffffff"),
        }}
      >
        <button
          type="button"
          className="home-hero-toggle"
          onClick={() => setHeroCollapsed((value) => !value)}
          aria-expanded={!heroCollapsed}
        >
          {heroCollapsed ? "+" : "−"}
        </button>
        <div
          className="home-hero-copy"
          style={{
            color: style?.hero?.color ?? style?.main?.color ?? "#0f172a",
            fontFamily: style?.hero?.fontFamily ?? style?.main?.fontFamily,
          }}
        >
          <div className="home-eyebrow" style={{ color: style?.hero?.eyebrowColor ?? "#6b7280" }}>{data.title}</div>
          <h1 className="home-hero-title" style={{ color: style?.hero?.titleColor ?? "#0f172a" }}>{data.headline}</h1>
          {!heroCollapsed && (
            <>
              <p className="home-hero-description" style={{ color: style?.hero?.descriptionColor ?? "#475569" }}>{data.summary}</p>
              <div className="home-hero-features" style={{ color: style?.hero?.descriptionColor ?? "#475569" }} dangerouslySetInnerHTML={{ __html: data.featureHtml }} />
              <div className="home-hero-actions">
                <Link 
                  to="/courses/react-crud" 
                  className="hero-cta"
                  style={{
                    background: style?.buttons?.usePrimaryBackgroundColorGradient 
                      ? `linear-gradient(180deg, ${style.buttons.primaryBackgroundColorGradientStart} 0%, ${style.buttons.primaryBackgroundColorGradientEnd} 100%)` 
                      : (style?.buttons?.primaryBackgroundColor ?? "#0f172a"),
                    color: style?.buttons?.primaryColor ?? "#ffffff",
                    fontFamily: style?.buttons?.primaryFontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                    fontWeight: style?.buttons?.primaryFontWeight ?? "700",
                  }}
                >
                  Start reading
                </Link>
                <Link 
                  to="/practice/react" 
                  className="hero-secondary"
                  style={{
                    background: style?.buttons?.useSecondaryBackgroundColorGradient 
                      ? `linear-gradient(180deg, ${style.buttons.secondaryBackgroundColorGradientStart} 0%, ${style.buttons.secondaryBackgroundColorGradientEnd} 100%)` 
                      : (style?.buttons?.secondaryBackgroundColor ?? "#e2e8f0"),
                    color: style?.buttons?.secondaryColor ?? "#334155",
                    fontFamily: style?.buttons?.secondaryFontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                    fontWeight: style?.buttons?.secondaryFontWeight ?? "600",
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
          background: style?.bookshelf?.useBackgroundColorGradient 
            ? `linear-gradient(180deg, ${style.bookshelf.backgroundColorGradientStart} 0%, ${style.bookshelf.backgroundColorGradientEnd} 100%)` 
            : (style?.bookshelf?.backgroundColor ?? "#ffffff"),
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
                  background: selectedRow?.title === row.title 
                    ? (style?.tabs?.useActiveBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.tabs.activeBackgroundColorGradientStart} 0%, ${style.tabs.activeBackgroundColorGradientEnd} 100%)` 
                        : (style?.tabs?.activeBackgroundColor ?? "#0f172a")) 
                    : (style?.tabs?.useBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.tabs.backgroundColorGradientStart} 0%, ${style.tabs.backgroundColorGradientEnd} 100%)` 
                        : (style?.tabs?.backgroundColor ?? "#e2e8f0")),
                  color: selectedRow?.title === row.title 
                    ? (style?.tabs?.activeColor ?? "#ffffff") 
                    : (style?.tabs?.color ?? "#334155"),
                  fontFamily: style?.tabs?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                  fontWeight: style?.tabs?.fontWeight ?? "600",
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
