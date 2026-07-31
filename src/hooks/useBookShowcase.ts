import { useCallback, useEffect, useRef, useState } from "react";
import type { Course } from "../data/courses";
import {
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
import { loadCourseOutlineById, loadCourseStepById } from "../utils/sqliteBrowserCourses";

export interface BookShowcaseState {
  selection: ShowcaseSelection | null;
  excerpt: ShowcaseExcerpt | null;
  loading: boolean;
  error: string | null;
}

const MAX_STEP_TRIES_PER_BOOK = 4;

export function useBookShowcase(courses: Course[], enabled: boolean, autoRotateMs = 10000) {
  const [state, setState] = useState<BookShowcaseState>({
    selection: null,
    excerpt: null,
    loading: false,
    error: null,
  });
  const [paused, setPaused] = useState(false);
  const requestIdRef = useRef(0);

  const loadShowcase = useCallback(async () => {
    if (!enabled || courses.length === 0) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pool = shuffleCourses(getShowcaseCoursePool(courses));
      let best: { selection: ShowcaseSelection; excerpt: ShowcaseExcerpt } | null = null;

      for (const summary of pool) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const outline = await loadCourseOutlineById(summary.id);
        if (!outline) {
          continue;
        }

        const eligible = getShowcaseEligibleSteps(outline);
        if (eligible.length === 0) {
          continue;
        }

        const tried = new Set<string>();
        for (let attempt = 0; attempt < Math.min(MAX_STEP_TRIES_PER_BOOK, eligible.length); attempt += 1) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          const outlineStep = pickRandomEligibleStep(outline);
          if (!outlineStep || tried.has(outlineStep.id)) {
            continue;
          }
          tried.add(outlineStep.id);

          const fullStep = await loadCourseStepById(outlineStep.id);
          const step = fullStep ?? outlineStep;

          let relatedFull: typeof step | null = null;
          let relatedScore = -1;
          const relatedTried = new Set<string>([step.id]);
          for (let p = 0; p < 5; p += 1) {
            const relatedOutline = pickRelatedPreviewStep(outline, step);
            if (!relatedOutline || relatedTried.has(relatedOutline.id)) {
              continue;
            }
            relatedTried.add(relatedOutline.id);
            const loaded = await loadCourseStepById(relatedOutline.id);
            const candidate = loaded ?? relatedOutline;
            const probe = await buildShowcaseExcerpt(outline, candidate);
            const score =
              Math.min(probe.excerpt.length, 680) +
              (probe.previewImageUrl ? 40 : 0) +
              (/explained/i.test(candidate.title) ? 80 : 0);
            if (score > relatedScore) {
              relatedScore = score;
              relatedFull = candidate;
            }
            if (probe.excerpt.length >= 220) {
              break;
            }
          }

          const selection = { course: outline, step };
          const excerpt = await buildShowcaseExcerpt(outline, step, relatedFull);

          if (isFilledShowcaseExcerpt(excerpt)) {
            best = { selection, excerpt };
            break;
          }

          if (!best || excerpt.excerpt.length > best.excerpt.excerpt.length) {
            best = { selection, excerpt };
          }
        }

        if (best && isFilledShowcaseExcerpt(best.excerpt)) {
          break;
        }
      }

      if (!best) {
        if (requestId !== requestIdRef.current) return;
        setState({ selection: null, excerpt: null, loading: false, error: "No showcase pages found." });
        return;
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        selection: best.selection,
        excerpt: best.excerpt,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setState({
        selection: null,
        excerpt: null,
        loading: false,
        error: String(err),
      });
    }
  }, [courses, enabled]);

  const shuffle = useCallback(() => {
    void loadShowcase();
  }, [loadShowcase]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadShowcase();
  }, [enabled, loadShowcase]);

  useEffect(() => {
    if (!enabled || paused || autoRotateMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadShowcase();
    }, autoRotateMs);

    return () => window.clearInterval(timer);
  }, [autoRotateMs, enabled, loadShowcase, paused]);

  return {
    ...state,
    shuffle,
    setPaused,
  };
}
