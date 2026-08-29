import { useCallback, useEffect, useRef, useState } from "react";
import type { Course } from "../data/courses";
import {
  buildQuickShowcaseExcerpt,
  buildShowcaseExcerpt,
  getShowcaseCoursePool,
  getShowcaseEligibleSteps,
  isFilledShowcaseExcerpt,
  pickRandomEligibleStep,
  pickRelatedPreviewStep,
  shuffleCourses,
  type ShowcaseExcerpt,
  type ShowcaseSelection,
} from "../utils/showcasePicker";
import { readShowcaseCache, writeShowcaseCache } from "../utils/homeCatalog";
import { loadCourseOutlineById, loadCourseStepById } from "../utils/sqliteBrowserCourses";

export interface BookShowcaseState {
  selection: ShowcaseSelection | null;
  excerpt: ShowcaseExcerpt | null;
  loading: boolean;
  error: string | null;
}

/** If a popular book has no showcase pages, try the next shuffled titles. */
const MAX_BOOKS_TO_TRY = 12;

function initialFromCache(): BookShowcaseState {
  const cached = readShowcaseCache();
  if (!cached) {
    return { selection: null, excerpt: null, loading: false, error: null };
  }
  return {
    selection: {
      course: { id: cached.courseId, title: cached.excerpt.bookTitle } as Course,
      step: { id: "", title: cached.excerpt.pageTitle } as ShowcaseSelection["step"],
    },
    excerpt: cached.excerpt,
    loading: false,
    error: null,
  };
}

function publish(
  requestId: number,
  requestIdRef: { current: number },
  setState: (value: BookShowcaseState | ((prev: BookShowcaseState) => BookShowcaseState)) => void,
  selection: ShowcaseSelection,
  excerpt: ShowcaseExcerpt,
  loading: boolean,
) {
  if (requestId !== requestIdRef.current) {
    return;
  }
  writeShowcaseCache(selection.course.id, excerpt);
  setState({
    selection,
    excerpt,
    loading,
    error: null,
  });
}

export function useBookShowcase(courses: Course[], enabled: boolean, autoRotateMs = 10000) {
  const [state, setState] = useState<BookShowcaseState>(initialFromCache);
  const [paused, setPaused] = useState(false);
  const requestIdRef = useRef(0);
  const lastCourseIdRef = useRef<string | null>(null);

  const loadShowcase = useCallback(async () => {
    if (!enabled || courses.length === 0) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setState((prev) => ({
      ...prev,
      loading: !prev.excerpt,
      error: null,
    }));

    try {
      const allPopular = shuffleCourses(getShowcaseCoursePool(courses));
      const lastId = lastCourseIdRef.current;
      const rotated =
        allPopular.length > 1 && lastId
          ? [...allPopular.filter((course) => course.id !== lastId), ...allPopular.filter((course) => course.id === lastId)]
          : allPopular;
      const pool = rotated.slice(0, Math.max(MAX_BOOKS_TO_TRY, 1));
      if (pool.length === 0) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.excerpt ? null : "No showcase pages found.",
        }));
        return;
      }

      /* 1) Instant frame from first popular summary (cover + blurb). */
      const lead = pool[0];
      const quickSelection: ShowcaseSelection = {
        course: lead,
        step: {
          id: `${lead.id}-quick`,
          courseId: lead.id,
          chapterId: "",
          chapterTitle: "",
          chapterIndex: 0,
          stepIndex: 0,
          stepType: "html",
          title: lead.title,
          description: lead.description ?? "",
        },
      };
      publish(requestId, requestIdRef, setState, quickSelection, buildQuickShowcaseExcerpt(lead), true);
      lastCourseIdRef.current = lead.id;

      let shownRich = false;

      for (let bookIndex = 0; bookIndex < pool.length; bookIndex += 1) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const summary = pool[bookIndex];
        const outline = await loadCourseOutlineById(summary.id);
        if (!outline) {
          continue;
        }

        const eligible = getShowcaseEligibleSteps(outline);
        if (eligible.length === 0) {
          continue;
        }

        const outlineStep = pickRandomEligibleStep(outline);
        if (!outlineStep) {
          continue;
        }

        const fullStep = await loadCourseStepById(outlineStep.id);
        const step = fullStep ?? outlineStep;
        const selection = { course: outline, step };

        /* 2) Fast page excerpt (no related) — show as soon as ready. */
        const fastExcerpt = await buildShowcaseExcerpt(outline, step, null);
        if (requestId !== requestIdRef.current) {
          return;
        }

        const usable =
          isFilledShowcaseExcerpt(fastExcerpt) ||
          fastExcerpt.excerpt.trim().length >= 40 ||
          Boolean(fastExcerpt.coverImageUrl);
        if (usable) {
          publish(requestId, requestIdRef, setState, selection, fastExcerpt, true);
          shownRich = true;

          /* 3) Lazy enrich with one related Explained page (same book). */
          const relatedOutline = pickRelatedPreviewStep(outline, step);
          if (relatedOutline) {
            const relatedLoaded = await loadCourseStepById(relatedOutline.id);
            const related = relatedLoaded ?? relatedOutline;
            const richExcerpt = await buildShowcaseExcerpt(outline, step, related);
            if (requestId !== requestIdRef.current) {
              return;
            }
            if (
              richExcerpt.excerpt.length > fastExcerpt.excerpt.length ||
              (richExcerpt.previewImageUrl && !fastExcerpt.previewImageUrl)
            ) {
              publish(requestId, requestIdRef, setState, selection, richExcerpt, false);
            } else {
              setState((prev) =>
                requestId === requestIdRef.current ? { ...prev, loading: false } : prev,
              );
            }
          } else {
            setState((prev) =>
              requestId === requestIdRef.current ? { ...prev, loading: false } : prev,
            );
          }

          lastCourseIdRef.current = outline.id;
          /* First successful book is enough — rest stay for rotate later. */
          break;
        }

        /* This book had a weak excerpt — try the next popular book. */
        continue;
      }

      if (!shownRich && requestId === requestIdRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.excerpt ? null : "No showcase pages found.",
        }));
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setState((prev) => ({
        selection: prev.selection,
        excerpt: prev.excerpt,
        loading: false,
        error: prev.excerpt ? null : String(err),
      }));
    }
  }, [courses, enabled]);

  const shuffle = useCallback(() => {
    void loadShowcase();
  }, [loadShowcase]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const start = () => {
      if (!cancelled) {
        void loadShowcase();
      }
    };

    /* Short defer so shelf paints; featured work is now light. */
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const ric = window.requestIdleCallback?.bind(window);
    const cic = window.cancelIdleCallback?.bind(window);
    if (ric) {
      idleId = ric(start, { timeout: 500 });
    } else {
      timeoutId = window.setTimeout(start, 80);
    }

    return () => {
      cancelled = true;
      if (idleId != null) {
        cic?.(idleId);
      }
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, loadShowcase]);

  useEffect(() => {
    if (!enabled || paused || autoRotateMs <= 0 || !state.excerpt) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadShowcase();
    }, autoRotateMs);

    return () => window.clearInterval(timer);
  }, [autoRotateMs, enabled, loadShowcase, paused, state.excerpt]);

  return {
    ...state,
    shuffle,
    setPaused,
  };
}
