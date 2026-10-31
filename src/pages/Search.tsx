import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LibraryTopBar from "../components/LibraryTopBar";
import HomeCourseShelves from "../components/HomeCourseShelves";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { createShelfItemFromCourse } from "../utils/courseShelf";
import { courseMatchesCategoryPath } from "../utils/bookCategories";
import { getLibraryAudience, saveLibraryAudience, type LibraryAudience } from "../utils/libraryAudience";
import { readShelfReturn, saveShelfReturn } from "../utils/shelfReturn";
import "../styles/home-test-showcase.css";

function filterCourses(courses: ReturnType<typeof useCourseCatalog>["courses"], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return courses.filter((course) =>
    [course.title, course.description, course.category].some((value) =>
      String(value).toLowerCase().includes(normalized),
    ),
  );
}

export default function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => {
    const saved = readShelfReturn();
    return saved?.source === "search" ? saved.searchQuery : "";
  });
  const [selectedAudience, setSelectedAudience] = useState<LibraryAudience>(getLibraryAudience);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const { courses, loaded } = useCourseCatalog({ publishedMode: "published" });
  const audienceCourses = useMemo(
    () => selectedAudience === "Kid" ? courses.filter((course) => courseMatchesCategoryPath(course, ["Kid"])) : courses,
    [courses, selectedAudience],
  );
  const results = useMemo(() => filterCourses(audienceCourses, query), [audienceCourses, query]);
  const row = useMemo(
    () => ({ title: t("search.results"), items: results.slice().sort((a, b) => a.title.localeCompare(b.title)).map((course) => createShelfItemFromCourse(course, t("search.results"))) }),
    [results, t],
  );

  const openHome = () => {
    navigate("/", { replace: true, state: { homeLoading: true } });
  };

  useEffect(() => {
    if (!audienceLoading) return;
    const timeoutId = window.setTimeout(() => setAudienceLoading(false), 260);
    return () => window.clearTimeout(timeoutId);
  }, [audienceLoading]);

  useEffect(() => {
    saveShelfReturn({
      tab: "Search",
      source: "search",
      categoryPath: [],
      selectedAuthorName: null,
      searchQuery: query,
    });
  }, [query]);

  return (
    <div className="page-content page-home page-home-showcase page-search-showcase">
      {audienceLoading ? (
        <div className="home-return-loader" role="status" aria-live="polite">
          <span className="home-return-loader-emoji" aria-hidden="true">📚</span>
          <span>{t("practice.loadingShelf")}</span>
          <span className="home-return-loader-dots" aria-hidden="true">...</span>
        </div>
      ) : null}
      <LibraryTopBar
        onHome={openHome}
        showHomeMenu
        selectedAudience={selectedAudience}
        onAudienceChange={(audience) => {
          if (audience === selectedAudience) return;
          saveLibraryAudience(audience);
          setAudienceLoading(true);
          setSelectedAudience(audience);
        }}
      />
      <main className="search-page-content">
        <label className="search-page-field">
          <span className="search-page-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">{t("search.inputLabel")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("search.inputLabel")}
            placeholder={t("search.inputLabel")}
            autoFocus
          />
        </label>
        {!loaded ? (
          <div className="home-course-loading">{t("search.loadingBooks")}</div>
        ) : query.trim() && row.items.length === 0 ? (
          <div className="home-course-loading">{t("search.noResults")}</div>
        ) : (
          <HomeCourseShelves row={row} useCoverImages horizontal horizontalItemsPerRow={5} />
        )}
      </main>
    </div>
  );
}