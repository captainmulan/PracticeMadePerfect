import type { ShowcaseExcerpt } from "../../utils/showcasePicker";
import "../../styles/home-test-showcase.css";

interface BookShowcaseProps {
  excerpt: ShowcaseExcerpt | null;
  loading?: boolean;
  error?: string | null;
  useAdminCover?: boolean;
  onOpen?: () => void;
  onPauseChange?: (paused: boolean) => void;
}

export default function BookShowcase({
  excerpt,
  loading = false,
  error = null,
  useAdminCover = false,
  onOpen,
  onPauseChange,
}: BookShowcaseProps) {
  const artifactClass = excerpt?.artifactType ?? "book";
  const leftVisualUrl =
    useAdminCover && excerpt?.coverImageUrl
      ? excerpt.coverImageUrl
      : excerpt?.heroImageUrl ?? null;

  return (
    <div
      className={`book-showcase book-showcase--${artifactClass}`}
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
      onFocus={() => onPauseChange?.(true)}
      onBlur={() => onPauseChange?.(false)}
    >
      {loading && !excerpt ? (
        <div className="book-showcase-skeleton" aria-busy="true">
          <div className="book-showcase-open book-showcase-open--loading">
            <div className="book-showcase-page book-showcase-page--left" />
            <div className="book-showcase-gutter" aria-hidden="true" />
            <div className="book-showcase-page book-showcase-page--right" />
          </div>
        </div>
      ) : error && !excerpt ? (
        <div className="book-showcase-error">{error}</div>
      ) : excerpt ? (
        <button type="button" className="book-showcase-open-hit" onClick={onOpen} aria-label={`Open ${excerpt.bookTitle}`}>
          <div className={`book-showcase-open ${loading ? "is-refreshing" : ""}`}>
            <div className="book-showcase-page book-showcase-page--left">
              {leftVisualUrl ? (
                <img
                  className={`book-showcase-hero-img ${useAdminCover && excerpt.coverImageUrl ? "book-showcase-cover-img" : ""}`}
                  src={leftVisualUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="book-showcase-cover-fallback"
                  style={{
                    background: `linear-gradient(160deg, ${excerpt.coverColorStart} 0%, ${excerpt.coverColorMiddle} 50%, ${excerpt.coverColorEnd} 100%)`,
                  }}
                >
                  <span className="book-showcase-cover-icon">{excerpt.pageEmoji || excerpt.icon}</span>
                </div>
              )}
              <div className="book-showcase-page-meta">
                <span className="book-showcase-book-title">{excerpt.bookTitle}</span>
                <span className="book-showcase-chapter">{excerpt.chapterTitle}</span>
              </div>
            </div>

            <div className="book-showcase-gutter" aria-hidden="true" />

            <div className="book-showcase-page book-showcase-page--right">
              <h3 className="book-showcase-page-title">{excerpt.pageTitle}</h3>
              <p className="book-showcase-excerpt">{excerpt.excerpt}</p>
              <span className="book-showcase-tap-hint">Tap to read this book</span>
            </div>
          </div>

          <div className="book-showcase-shadow" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
