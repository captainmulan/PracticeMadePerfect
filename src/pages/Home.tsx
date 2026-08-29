import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readShelfReturn, saveShelfReturn } from "../utils/shelfReturn";
import BookShowcase from "../components/showcase/BookShowcase";
import HomeCourseShelves from "../components/HomeCourseShelves";
import AuthorShelfRow from "../components/AuthorShelfRow";
import HomeLoginPanel from "../components/HomeLoginPanel";
import HomeSpaceDecor from "../components/HomeSpaceDecor";
import ExchangeRatePanel from "../components/ExchangeRatePanel";
import { useBookShowcase } from "../hooks/useBookShowcase";
import { getHomePageData } from "../utils/contentStore";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { resolveBookCoverUrl } from "../utils/bookCoverSeeds";
import {
  createShelfItemFromCourse,
  getAuthorShelfRow,
  getCategoryBrowseRow,
  getCategoryPickerRow,
  getCourseShelfRowForAuthor,
  getHomeCourseShelfRows,
  getPopularCourses,
  getUnpublishedBooksRow,
  type CourseShelfRow,
} from "../utils/courseShelf";
import { AUTHOR_SHELF_ID } from "../utils/bookCategories";
import { canonicalAuthorName } from "../utils/authorName";
import "../styles/home-test-showcase.css";

const HOME_SHELF_TABS = [
  { id: "Search", label: "Search" },
  { id: "Category", label: "Category" },
  { id: "Login", label: "Login" },
] as const;

type HomeShelfTab = (typeof HOME_SHELF_TABS)[number]["id"];

function filterCoursesByQuery(courses: ReturnType<typeof useCourseCatalog>["courses"], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return courses;
  return courses.filter((course) =>
    [course.title, course.description, course.category].some((value) =>
      String(value).toLowerCase().includes(normalized)
    )
  );
}

function preloadPopularCovers(courses: ReturnType<typeof useCourseCatalog>["courses"]) {
  const popular = getPopularCourses(courses);
  const targets = popular.length > 0 ? popular : courses.slice(0, 8);
  for (const course of targets) {
    const url = resolveBookCoverUrl(course, { variant: "thumb" });
    if (!url) {
      continue;
    }
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

type HomeProps = {
  showUnpublishedOnly?: boolean;
};

export default function Home({ showUnpublishedOnly = false }: HomeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<HomeShelfTab>("Search");
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shelfReady, setShelfReady] = useState(false);
  const data = getHomePageData();
  const style = data.style;
  const { courses, loaded: coursesLoaded } = useCourseCatalog({
    publishedMode: showUnpublishedOnly ? "unpublished" : "published",
  });
  const rows = useMemo(
    () => (showUnpublishedOnly ? [getUnpublishedBooksRow(courses)] : getHomeCourseShelfRows(courses)),
    [courses, showUnpublishedOnly]
  );
  const authorGroups = useMemo(() => {
    const groups = new Map<string, { authorName: string; authorPicture?: string }>();
    for (const course of courses) {
      const authorName = canonicalAuthorName(course.authorName);
      if (!groups.has(authorName)) {
        groups.set(authorName, { authorName, authorPicture: course.authorPicture });
      }
    }
    return [...groups.values()].sort((a, b) => {
      if (a.authorName === "Unknown" && b.authorName !== "Unknown") return 1;
      if (b.authorName === "Unknown" && a.authorName !== "Unknown") return -1;
      return a.authorName.localeCompare(b.authorName, undefined, { sensitivity: "base" });
    });
  }, [courses]);
  const isSearching = selectedTab === "Search" && searchQuery.trim().length > 0;
  const showcaseEnabled = !showUnpublishedOnly && !heroCollapsed && coursesLoaded && courses.length > 0;
  const {
    selection: showcaseSelection,
    excerpt: showcaseExcerpt,
    loading: showcaseLoading,
    error: showcaseError,
    shuffle: shuffleShowcase,
    setPaused: setShowcasePaused,
  } = useBookShowcase(courses, showcaseEnabled);

  useEffect(() => {
    if (!coursesLoaded || courses.length === 0) {
      return;
    }
    preloadPopularCovers(courses);
  }, [courses, coursesLoaded]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const restore = params.get("restoreShelf") === "1";
    if (restore && !coursesLoaded) return;

    if (restore) {
      const saved = readShelfReturn();
      if (saved?.tab === "Search") {
        setSelectedTab("Search");
        setCategoryPath([]);
        setSelectedAuthorName(null);
        setSearchQuery(saved.searchQuery);
      } else if (saved) {
        setSelectedTab((saved.tab as HomeShelfTab) || "Category");
        setCategoryPath(saved.categoryPath);
        setSelectedAuthorName(saved.selectedAuthorName);
        setSearchQuery("");
      } else {
        setSelectedTab("Category");
      }
      navigate(location.pathname, { replace: true });
    }
    setShelfReady(true);
  }, [coursesLoaded, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!coursesLoaded || selectedTab !== "Category") return;
    if (categoryPath.length === 0) return;
    if (categoryPath[0] === AUTHOR_SHELF_ID) return;
    const row = getCategoryBrowseRow(courses, categoryPath);
    if (row.items.length > 0) return;
    setCategoryPath((path) => path.slice(0, -1));
  }, [categoryPath, courses, coursesLoaded, selectedTab]);

  useEffect(() => {
    if (!shelfReady) return;
    if (new URLSearchParams(location.search).get("restoreShelf") === "1") return;
    if (showUnpublishedOnly) return;
    if (selectedTab === "Login") return;
    saveShelfReturn({
      tab: selectedTab,
      categoryPath,
      selectedAuthorName,
      searchQuery,
    });
  }, [categoryPath, location.search, searchQuery, selectedAuthorName, selectedTab, shelfReady, showUnpublishedOnly]);

  const selectedRow: CourseShelfRow | undefined = useMemo(() => {
    if (selectedTab === "Login") {
      return undefined;
    }
    if (showUnpublishedOnly) {
      if (isSearching) {
        const searchItems = filterCoursesByQuery(courses, searchQuery)
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((course) => createShelfItemFromCourse(course, "Unpublished Books"));
        return { title: "Unpublished Books", items: searchItems };
      }
      return rows[0];
    }
    if (selectedTab === "Category") {
      if (categoryPath.length === 0) {
        return getCategoryPickerRow(courses);
      }
      if (categoryPath[0] === AUTHOR_SHELF_ID) {
        if (selectedAuthorName) {
          return getCourseShelfRowForAuthor(courses, selectedAuthorName);
        }
        return getAuthorShelfRow(authorGroups);
      }
      return getCategoryBrowseRow(courses, categoryPath);
    }
    if (isSearching) {
      const searchItems = filterCoursesByQuery(courses, searchQuery)
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((course) => createShelfItemFromCourse(course, "Selection"));
      return { title: "Selection", items: searchItems };
    }
    return rows.find((row) => row.title === "Selection") || rows[0];
  }, [authorGroups, categoryPath, courses, isSearching, rows, searchQuery, selectedAuthorName, selectedTab, showUnpublishedOnly]);

  const openShowcasedBook = () => {
    if (showcaseSelection?.course.id) {
      navigate(`/courses/${showcaseSelection.course.id}`);
      return;
    }
    const popular = getPopularCourses(courses);
    const fallback = popular[0] ?? courses[0];
    if (fallback) {
      navigate(`/courses/${fallback.id}`);
    }
  };

  return (
    <div className="page-content page-home page-home-showcase">
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

        <div className="home-hero-expanded-layout">
          <div
            className="home-hero-copy"
            style={{
              color: style?.hero?.color ?? style?.main?.color ?? "#0f172a",
              fontFamily: style?.hero?.fontFamily ?? style?.main?.fontFamily,
            }}
          >
            <div className="home-eyebrow" style={{ color: style?.hero?.eyebrowColor ?? "#6b7280" }}>
              {data.title}
            </div>
            <h1 className="home-hero-title" style={{ color: style?.hero?.titleColor ?? "#0f172a" }}>
              {showUnpublishedOnly ? "Unpublished Books" : data.headline}
            </h1>
          </div>

          {!heroCollapsed && (
            <BookShowcase
              excerpt={showcaseExcerpt}
              loading={showcaseLoading}
              error={showcaseError}
              useAdminCover
              onOpen={openShowcasedBook}
              onShuffle={shuffleShowcase}
              onPauseChange={setShowcasePaused}
            />
          )}
        </div>
      </section>

      <section
        className="home-categories panel home-shelf-panel"
        style={{
          background: style?.bookshelf?.useBackgroundColorGradient
            ? `linear-gradient(180deg, ${style.bookshelf.backgroundColorGradientStart} 0%, ${style.bookshelf.backgroundColorGradientEnd} 100%)`
            : (style?.bookshelf?.backgroundColor ?? "#ffffff"),
          borderColor: style?.bookshelf?.borderColor ?? "#e2e8f0",
        }}
      >
        <HomeSpaceDecor />
        <div className="container">
          <nav className="home-tabs">
            {HOME_SHELF_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`home-tab-button ${selectedTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedTab(tab.id);
                  if (tab.id === "Category") {
                    setCategoryPath([]);
                    setSelectedAuthorName(null);
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {selectedTab === "Search" && (
            <div className="home-selection-search">
              <input
                className="home-selection-search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by book name, type, or topic"
              />
              <div className="home-selection-search-meta">
                {isSearching
                  ? selectedRow && selectedRow.items.length > 0
                    ? `${selectedRow.items.length} results`
                    : "No books found"
                  : "Popular picks — search anytime"}
              </div>
            </div>
          )}

          {selectedTab === "Login" ? (
            <HomeLoginPanel />
          ) : !coursesLoaded ? (
            <div className="home-course-loading">Loading books...</div>
          ) : courses.length === 0 ? (
            <div className="home-course-loading">No books yet. Create one in Admin.</div>
          ) : isSearching ? (
            selectedRow && selectedRow.items.length > 0 ? (
              selectedRow.title === "Author" ? (
                <AuthorShelfRow row={selectedRow} onItemClick={(item) => setSelectedAuthorName(item.title)} />
              ) : (
                <HomeCourseShelves row={selectedRow} useCoverImages />
              )
            ) : (
              <div className="home-course-loading">No books matched your search.</div>
            )
          ) : (
            selectedRow && (
              selectedTab === "Category" && categoryPath[0] === AUTHOR_SHELF_ID && !selectedAuthorName ? (
                <AuthorShelfRow
                  row={selectedRow}
                  onItemClick={(item) => {
                    if (item.placeholder) return;
                    setSelectedAuthorName(item.title);
                  }}
                />
              ) : (
                <HomeCourseShelves
                  row={selectedRow}
                  useCoverImages
                  onItemClick={(item) => {
                    if (item.placeholder) return;
                    if (item.actionType === "author") {
                      setSelectedTab("Category");
                      setSelectedAuthorName(item.title);
                      setCategoryPath([AUTHOR_SHELF_ID]);
                      return;
                    }
                    if (item.category === AUTHOR_SHELF_ID && item.actionType === "category") {
                      setSelectedTab("Category");
                      setSelectedAuthorName(null);
                      setCategoryPath([AUTHOR_SHELF_ID]);
                      return;
                    }
                    if ((item.actionType === "language-sub" || item.actionType === "category") && item.category) {
                      setSelectedTab("Category");
                      setSelectedAuthorName(null);
                      if (item.browsePath && item.browsePath.length > 0) {
                        setCategoryPath(item.browsePath);
                      } else {
                        setCategoryPath((current) => [...current, item.category!]);
                      }
                    }
                  }}
                />
              )
            )
          )}
        </div>
      </section>
      <ExchangeRatePanel />
    </div>
  );
}
