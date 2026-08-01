import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

const SWIPE_THRESHOLD_PX = 56;
const TAP_SLOP_PX = 14;

const INTERACTIVE_SELECTOR =
  "button,a,input,textarea,select,label,canvas,svg,video,audio,[role='button'],[role='slider'],[contenteditable='true'],.ctrl-btn,.planet-grid,.touch-controls";

interface UsePageSwipeNavigationOptions {
  canPrevious: boolean;
  canNext: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Same-origin book iframe — swipe inside page content also changes steps. */
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  /** Change when iframe content remounts (e.g. step id) so listeners reattach. */
  iframeBindKey?: string | number | null;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

/**
 * Horizontal swipe → previous / next page.
 * Swipe right = previous, swipe left = next (book metaphor).
 */
export function usePageSwipeNavigation({
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  iframeRef,
  iframeBindKey,
}: UsePageSwipeNavigationOptions) {
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const canPreviousRef = useRef(canPrevious);
  const canNextRef = useRef(canNext);
  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);

  useEffect(() => {
    canPreviousRef.current = canPrevious;
    canNextRef.current = canNext;
    onPreviousRef.current = onPrevious;
    onNextRef.current = onNext;
  }, [canPrevious, canNext, onPrevious, onNext]);

  const begin = useCallback((x: number, y: number, id: number, target: EventTarget | null) => {
    if (isInteractiveTarget(target)) {
      pointerStart.current = null;
      return;
    }
    pointerStart.current = { x, y, id };
  }, []);

  const finish = useCallback((x: number, y: number, id: number) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== id) {
      return;
    }

    const dx = x - start.x;
    const dy = y - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < SWIPE_THRESHOLD_PX || absX <= absY + TAP_SLOP_PX) {
      return;
    }

    if (dx < 0 && canNextRef.current) {
      onNextRef.current?.();
    } else if (dx > 0 && canPreviousRef.current) {
      onPreviousRef.current?.();
    }
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      begin(event.clientX, event.clientY, event.pointerId, event.target);
    },
    [begin],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      finish(event.clientX, event.clientY, event.pointerId);
    },
    [finish],
  );

  const onPointerCancel = useCallback(() => {
    pointerStart.current = null;
  }, []);

  useEffect(() => {
    const iframe = iframeRef?.current;
    if (!iframe) {
      return;
    }

    let doc: Document | null = null;
    let cleaned = false;
    const cleanups: Array<() => void> = [];

    const detach = () => {
      cleanups.splice(0).forEach((fn) => fn());
    };

    const attach = () => {
      if (cleaned) {
        return;
      }
      detach();
      try {
        doc = iframe.contentDocument;
      } catch {
        doc = null;
      }
      if (!doc) {
        return;
      }

      const onDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }
        begin(event.clientX, event.clientY, event.pointerId, event.target);
      };
      const onUp = (event: PointerEvent) => {
        finish(event.clientX, event.clientY, event.pointerId);
      };
      const onCancel = () => {
        pointerStart.current = null;
      };

      doc.addEventListener("pointerdown", onDown);
      doc.addEventListener("pointerup", onUp);
      doc.addEventListener("pointercancel", onCancel);
      cleanups.push(() => {
        doc?.removeEventListener("pointerdown", onDown);
        doc?.removeEventListener("pointerup", onUp);
        doc?.removeEventListener("pointercancel", onCancel);
      });
    };

    const onLoad = () => attach();
    iframe.addEventListener("load", onLoad);
    if (iframe.contentDocument?.readyState === "complete") {
      attach();
    }

    return () => {
      cleaned = true;
      iframe.removeEventListener("load", onLoad);
      detach();
    };
  }, [begin, finish, iframeRef, iframeBindKey]);

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
