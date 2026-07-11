import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import { loadCoursesFromBrowserDb } from "./sqliteBrowserCourses";

export function useCourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        console.log("loading courses");
        const data = await loadCoursesFromBrowserDb();
        console.log("loaded courses:", data);
        if (!active) return;
        setCourses(data);
        setLoaded(true);
      } catch (err) {
        console.error("Error loading courses:", err);
        if (!active) return;
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
