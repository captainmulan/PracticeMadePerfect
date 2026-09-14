import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LibraryTopBar from "../components/LibraryTopBar";
import HomeCourseShelves from "../components/HomeCourseShelves";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { createShelfItemFromCourse } from "../utils/courseShelf";
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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { courses, loaded } = useCourseCatalog({ publishedMode: "published" });
  const results = useMemo(() => filterCourses(courses, query), [courses, query]);
  const row = useMemo(
    () => ({ title: "Search results", items: results.slice().sort((a, b) => a.title.localeCompare(b.title)).map((course) => createShelfItemFromCourse(course, "Search results")) }),
    [results],
  );

  const openHome = () => {
    navigate("/", { replace: true, state: { homeLoading: true } });
  };

  return (
    <div className="page-content page-home page-home-showcase page-search-showcase">
      <LibraryTopBar onHome={openHome} />
      <main className="search-page-content">
        <label className="search-page-field">
          <span className="search-page-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </label>
        {!loaded ? (
          <div className="home-course-loading">Loading books...</div>
        ) : query.trim() && row.items.length === 0 ? (
          <div className="home-course-loading">No books matched your search.</div>
        ) : (
          <HomeCourseShelves row={row} useCoverImages horizontal horizontalItemsPerRow={3} />
        )}
      </main>
    </div>
  );
}