import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import { fetchHomeCatalogSummaries } from "./homeCatalog";
import { loadCourseSummariesFromBrowserDb } from "./sqliteBrowserCourses";

/**
 * Home catalog: paint ASAP from tiny home-catalog.json when present,
 * then replace with authoritative IndexedDB summaries (full migrate/sync).
 */
export function useCourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const early = await fetchHomeCatalogSummaries();
        if (active && early && early.length > 0) {
          setCourses(early);
          setLoaded(true);
        }
      } catch {
        /* optional artifact */
      }
    })();

    void (async () => {
      try {
        const data = await loadCourseSummariesFromBrowserDb();
        if (!active) {
          return;
        }
        /* Don't wipe an early home-catalog paint if IDB is still empty after a failed sync. */
        setCourses((prev) => (data.length > 0 ? data : prev.length > 0 ? prev : data));
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
