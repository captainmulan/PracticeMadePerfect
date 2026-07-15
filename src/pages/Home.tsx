import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData } from "../utils/contentStore";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { createShelfItemFromCourse, getCourseShelfRowForCategory, getHomeCourseShelfRows, type CourseShelfRow } from "../utils/courseShelf";
import HomeCourseShelves from "../components/HomeCourseShelves";
import ExchangeRatePanel from "../components/ExchangeRatePanel";
import CourseBookCard from "../components/CourseBookCard";

export default function Home() {
  const [heroCollapsed, setHeroCollapsed] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"Selection" | "Search" | "All">("Selection");
  const [selectedAllSubTab, setSelectedAllSubTab] = useState<"Kid" | "IT" | "Fiction" | "Language">("IT");
  const [searchQuery, setSearchQuery] = useState("");
  const data = getHomePageData();
  const style = data.style;
  const { courses, loaded: coursesLoaded } = useCourseCatalog();
  const rows = useMemo(() => getHomeCourseShelfRows(courses), [courses]);
  const selectedRow: CourseShelfRow | undefined = useMemo(() => {
    if (selectedTab === "All") {
      return getCourseShelfRowForCategory(courses, selectedAllSubTab);
    }
    if (selectedTab === "Search") {
      const query = searchQuery.trim().toLowerCase();
      const searchItems = (query
        ? courses.filter((course) => [course.title, course.description, course.category].some((value) => String(value).toLowerCase().includes(query)))
        : courses
      )
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((course) => createShelfItemFromCourse(course, "Search"));
      return { title: "Search", items: searchItems };
    }
    return rows.find((row) => row.title === selectedTab) || rows[0];
  }, [courses, rows, searchQuery, selectedAllSubTab, selectedTab]);

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
        <div className="rocket-container"></div>
        <div className="container">
          <nav className="home-tabs">
            {["Selection", "Search", "All"].map((tabTitle) => (
              <button
                key={tabTitle}
                type="button"
                className={`home-tab-button ${selectedTab === tabTitle ? "active" : ""}`}
                onClick={() => setSelectedTab(tabTitle as "Selection" | "Search" | "All")}
              >
                {tabTitle}
              </button>
            ))}
          </nav>

          {selectedTab === "All" && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {(["Kid", "IT", "Fiction", "Language"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`tab ${selectedAllSubTab === category ? "active" : ""}`}
                  onClick={() => setSelectedAllSubTab(category)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: selectedAllSubTab === category
                      ? (style?.tabs?.activeBackgroundColor ?? "#0f172a")
                      : (style?.tabs?.backgroundColor ?? "#e2e8f0"),
                    color: selectedAllSubTab === category ? (style?.tabs?.activeColor ?? "#ffffff") : (style?.tabs?.color ?? "#334155"),
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {selectedTab === "Search" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by book name, type, or topic"
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  maxWidth: "420px",
                }}
              />
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                {selectedRow && selectedRow.items.length > 0 ? `${selectedRow.items.length} results` : "No books found"}
              </div>
            </div>
          )}

          {!coursesLoaded ? (
            <div className="home-course-loading">Loading books...</div>
          ) : courses.length === 0 ? (
            <div className="home-course-loading">No books yet. Create one in Admin.</div>
          ) : selectedTab === "Search" ? (
            selectedRow && selectedRow.items.length > 0 ? (
              <HomeCourseShelves row={selectedRow} />
            ) : (
              <div className="home-course-loading">No books matched your search.</div>
            )
          ) : (
            selectedRow && <HomeCourseShelves row={selectedRow} />
          )}
        </div>
      </section>
      <ExchangeRatePanel />
    </div>
  );
}
