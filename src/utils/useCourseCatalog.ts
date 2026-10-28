import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import { fetchHomeCatalogSummaries } from "./homeCatalog";
import { loadCourseSummariesFromBrowserDb } from "./sqliteBrowserCourses";

/** Survives Home unmount so Category back does not flash empty placeholder books. */
let catalogCache: Course[] | null = null;
let catalogFromIdb = false;

function applyPublishedFilter(items: Course[], publishedMode: "published" | "unpublished" | "all") {
  switch (publishedMode) {
    case "unpublished":
      return items.filter((course) => course.isPublished === false);
    case "all":
      return items;
    case "published":
    default:
      return items.filter((course) => course.isPublished !== false);
  }
}

/**
 * Home catalog: paint ASAP from tiny home-catalog.json when present,
 * then replace with authoritative IndexedDB summaries (full migrate/sync).
 */
export function useCourseCatalog(options: { publishedMode?: "published" | "unpublished" | "all" } = {}) {
  const { publishedMode = "published" } = options;
  const [courses, setCourses] = useState<Course[]>(() =>
    catalogCache ? applyPublishedFilter(catalogCache, publishedMode) : [],
  );
  const [loaded, setLoaded] = useState(() => Boolean(catalogCache && catalogCache.length > 0));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let dbRefreshVersion = 0;

    const refreshFromBrowserDb = () => {
      const version = ++dbRefreshVersion;
      void loadCourseSummariesFromBrowserDb()
        .then((data) => {
          if (!active || version !== dbRefreshVersion) return;
          if (data.length > 0) {
            catalogFromIdb = true;
            catalogCache = data;
          }
          const refreshed = applyPublishedFilter(catalogCache ?? data, publishedMode);
          setCourses(refreshed);
          setLoaded(true);
          setError(null);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Error refreshing books:", err);
          setError(String(err));
        });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "pmp-course-catalog-updated") refreshFromBrowserDb();
    };
    window.addEventListener("storage", handleStorage);

    void (async () => {
      try {
        const early = await fetchHomeCatalogSummaries();
        if (!active || !early || early.length === 0) return;
        if (!catalogFromIdb) {
          catalogCache = early;
          setCourses(applyPublishedFilter(catalogCache, publishedMode));
          setLoaded(true);
        }
      } catch {
        /* optional artifact */
      }
    })();

    void (async () => {
      const version = dbRefreshVersion;
      try {
        const data = await loadCourseSummariesFromBrowserDb();
        if (!active || version !== dbRefreshVersion) return;
        if (data.length > 0) {
          catalogFromIdb = true;
          catalogCache = data;
        }
        const filteredData = applyPublishedFilter(catalogCache ?? data, publishedMode);
        setCourses((prev) => (filteredData.length > 0 ? filteredData : prev.length > 0 ? prev : filteredData));
        setLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Error loading books:", err);
        if (!active) return;
        setError(String(err));
        setLoaded(Boolean(catalogCache && catalogCache.length > 0));
      }
    })();

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [publishedMode]);

  return { courses, loaded, error, setCourses };
}
