import { useRef } from "react";
import type { PointerEvent } from "react";
import type { ShowcaseExcerpt } from "../../utils/showcasePicker";
import "../../styles/home-test-showcase.css";

interface BookShowcaseProps {
  excerpt: ShowcaseExcerpt | null;
  loading?: boolean;
  error?: string | null;
  useAdminCover?: boolean;
  onOpen?: () => void;
  onShuffle?: () => void;
  onPauseChange?: (paused: boolean) => void;
}

const SWIPE_THRESHOLD_PX = 48;
const TAP_SLOP_PX = 14;

export default function BookShowcase({
  excerpt,
  loading = false,
  error = null,
  useAdminCover = false,
  onOpen,
  onShuffle,
  onPauseChange,
}: BookShowcaseProps) {
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const didSwipe = useRef(false);

  const coverUrl =
    (useAdminCover && excerpt?.coverImageUrl) ||
    excerpt?.coverImageUrl ||
    excerpt?.heroImageUrl ||
    null;

  const previewUrl =
    excerpt?.previewImageUrl ||
    excerpt?.heroImageUrl ||
    excerpt?.coverImageUrl ||
    null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    didSwipe.current = false;
    onPauseChange?.(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > TAP_SLOP_PX && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true;
    }
  };

  const finishPointer = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    pointerStart.current = null;
    onPauseChange?.(false);

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX >= SWIPE_THRESHOLD_PX && absX > absY) {
      didSwipe.current = true;
      onShuffle?.();
      return;
    }

    if (!didSwipe.current && absX < TAP_SLOP_PX && absY < TAP_SLOP_PX) {
      onOpen?.();
    }
  };

  return (
    <div
      className="book-showcase"
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
      onFocus={() => onPauseChange?.(true)}
      onBlur={() => onPauseChange?.(false)}
    >
      {loading && !excerpt ? (
        <div className="book3d book3d--loading" aria-busy="true">
          <div className="book3d-scene">
            <div className="book3d-cover-board" aria-hidden="true" />
            <div className="book3d-spread">
              <div className="book3d-page book3d-page--left" />
              <div className="book3d-gutter" aria-hidden="true" />
              <div className="book3d-page book3d-page--right" />
            </div>
            <div className="book3d-edge book3d-edge--bottom" aria-hidden="true" />
          </div>
          <div className="book3d-shadow" aria-hidden="true" />
        </div>
      ) : error && !excerpt ? (
        <div className="book-showcase-error">{error}</div>
      ) : excerpt ? (
        <div
          className={`book3d ${loading ? "is-refreshing" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={`${excerpt.bookTitle}. Swipe for next book, tap to open.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen?.();
            } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              onShuffle?.();
            }
          }}
        >
          <div className="book3d-scene">
            <div className="book3d-cover-board" aria-hidden="true" />

            <div className="book3d-spread">
              <div className="book3d-page book3d-page--left">
                <div className="book3d-sheet">
                  <div className="book3d-plate book3d-plate--cover">
                    {coverUrl ? (
                      <img
                        className="book3d-cover-img"
                        src={coverUrl}
                        alt=""
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="book3d-cover-fallback"
                        style={{
                          background: `linear-gradient(160deg, ${excerpt.coverColorStart} 0%, ${excerpt.coverColorMiddle} 50%, ${excerpt.coverColorEnd} 100%)`,
                        }}
                      >
                        <span>{excerpt.pageEmoji || excerpt.icon}</span>
                        <strong>{excerpt.bookTitle}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="book3d-gutter" aria-hidden="true" />

              <div className="book3d-page book3d-page--right">
                <div className="book3d-sheet">
                  <div className="book3d-plate book3d-plate--preview">
                    <div className="book3d-crawl-stars" aria-hidden="true" />
                    {previewUrl ? (
                      <img
                        className="book3d-preview-fill"
                        src={previewUrl}
                        alt=""
                        loading="eager"
                        decoding="async"
                        draggable={false}
                      />
                    ) : null}
                    <div className="book3d-scrim" aria-hidden="true" />
                    <div className="book3d-copy">
                      <p className="book3d-kicker">{excerpt.bookTitle}</p>
                      <h3 className="book3d-heading">
                        {excerpt.previewPageTitle || excerpt.pageTitle}
                      </h3>
                      <p className="book3d-excerpt">{excerpt.excerpt}</p>
                      <p className="book3d-hint">Tap to read · Swipe for next</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="book3d-edge book3d-edge--left" aria-hidden="true" />
            <div className="book3d-edge book3d-edge--right" aria-hidden="true" />
            <div className="book3d-edge book3d-edge--bottom" aria-hidden="true" />
          </div>

          <div className="book3d-shadow" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
