import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Course, CourseStep } from "../data/courses";
import { flattenCourseSteps } from "../data/courses";
import { loadCourseOutlineById, loadCourseStepById } from "../utils/sqliteBrowserCourses";

export function useCourseReader(courseId: string | undefined) {
  const [outline, setOutline] = useState<Course | null>(null);
  const [outlineLoaded, setOutlineLoaded] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepCacheRef = useRef<Map<string, CourseStep>>(new Map());

  useEffect(() => {
    if (!courseId) {
      setOutline(null);
      stepCacheRef.current = new Map();
      setOutlineLoaded(true);
      return;
    }

    let active = true;
    setOutlineLoaded(false);
    setOutline(null);
    stepCacheRef.current = new Map();
    setError(null);

    loadCourseOutlineById(courseId)
      .then((nextOutline) => {
        if (!active) return;
        setOutline(nextOutline);
        setOutlineLoaded(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(String(err));
        setOutlineLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  const steps = useMemo(() => (outline ? flattenCourseSteps(outline) : []), [outline]);

  const loadStep = useCallback(async (step: CourseStep): Promise<CourseStep> => {
    const cached = stepCacheRef.current.get(step.id);
    if (cached) {
      return cached;
    }

    setStepLoading(true);
    try {
      const fullStep = await loadCourseStepById(step.id);
      const resolved = fullStep ?? step;
      stepCacheRef.current.set(resolved.id, resolved);
      return resolved;
    } finally {
      setStepLoading(false);
    }
  }, []);

  return {
    outline,
    steps,
    outlineLoaded,
    stepLoading,
    error,
    loadStep,
  };
}
