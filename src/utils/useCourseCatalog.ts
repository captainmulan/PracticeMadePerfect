import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import { fetchHomeCatalogSummaries } from "./homeCatalog";
import { loadCourseSummariesFromBrowserDb } from "./sqliteBrowserCourses";

/**
 * Home catalog: paint ASAP from tiny home-catalog.json when present,
 * then replace with authoritative IndexedDB summaries (full migrate/sync).
 */
export function useCourseCatalog(options: { publishedMode?: "published" | "unpublished" | "all" } = {}) {
  const { publishedMode = "published" } = options;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterCourses = (items: Course[]) => {
    switch (publishedMode) {
      case "unpublished":
        return items.filter((course) => course.isPublished === false);
      case "all":
        return items;
      case "published":
      default:
        return items.filter((course) => course.isPublished !== false);
    }
  };

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const early = await fetchHomeCatalogSummaries();
        if (active && early && early.length > 0) {
          setCourses(filterCourses(early));
          setLoaded(true);
        }
      } catch {
        /* optional artifact */
      }
    })();

    void (async () => {
      try {
        const data = await loadCourseSummariesFromBrowserDb();
        const filteredData = filterCourses(data);
        if (!active) {
          return;
        }
        /* Don't wipe an early home-catalog paint if IDB is still empty after a failed sync. */
        setCourses((prev) => (filteredData.length > 0 ? filteredData : prev.length > 0 ? prev : filteredData));
        setLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Error loading books:", err);
        if (!active) {
          return;
        }
        setError(String(err));
        setLoaded(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { courses, loaded, error, setCourses };
}
