import type { ChangeEvent, ReactNode, RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PracticeCodeEditor from "./PracticeCodeEditor";
import { usePageSwipeNavigation } from "../hooks/usePageSwipeNavigation";
import type { BookBookmark } from "../services/types/account";
import { getHomePageData } from "../utils/contentStore";
import "../styles/course.css";

interface PracticeWorkspaceBookmarkProps {
  bookId?: string | null;
  stepIndex?: number | null;
  stepTitle?: string | null;
  bookmarked?: boolean;
  bookmarks?: BookBookmark[];
  onToggleBookmark?: () => void;
  onRemoveBookmark?: (bookmarkId: string) => void;
  onJumpToBookmark?: (stepIndex: number) => void;
}

interface PracticeWorkspaceProps extends PracticeWorkspaceBookmarkProps {
  bookName?: string;
  chapterName?: string;
  chapterNumber?: number;
  pageType?: string;
  pageIndex?: number;
  totalPages?: number;
  pageBrief?: string;
  eyebrow?: string;
  meta?: string;
  progressPct?: number;
  title: string;
  description?: string;
  toolbarLabel?: string;
  value?: string;
  placeholder?: string;
  isText?: boolean;
  loadError?: string;
  showPeek?: boolean;
  isMobileView?: boolean;
  onTogglePeek?: () => void;
  onVerify?: () => void;
  verifyDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  onChange?: (value: string) => void;
  peekCode?: string;
  children?: ReactNode;
  contentIframeRef?: RefObject<HTMLIFrameElement | null>;
  contentIframeBindKey?: string | number | null;
}

export default function PracticeWorkspace({
  bookName,
  chapterName,
  chapterNumber,
  pageType,
  pageIndex,
  totalPages,
  pageBrief,
  eyebrow,
  meta,
  progressPct,
  title,
  description,
  toolbarLabel,
  value = "",
  placeholder = "",
  isText = false,
  loadError,
  showPeek = false,
  isMobileView = false,
  onTogglePeek,
  onVerify,
  verifyDisabled = false,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
  onChange,
  peekCode = "",
  children,
  contentIframeRef,
  contentIframeBindKey,
  bookId,
  stepIndex,
  stepTitle,
  bookmarked,
  bookmarks,
  onToggleBookmark,
  onRemoveBookmark,
  onJumpToBookmark,
}: PracticeWorkspaceProps) {
  const homeData = getHomePageData();
  const hasEditor = Boolean(onChange) && children === undefined;
  const style = homeData.style;
  const swipe = usePageSwipeNavigation({
    canPrevious,
    canNext,
    onPrevious,
    onNext,
    iframeRef: contentIframeRef,
    iframeBindKey: contentIframeBindKey,
  });

  const [showBookmarkDrawer, setShowBookmarkDrawer] = useState(false);
  const bookmarkList = useMemo(() => bookmarks ?? [], [bookmarks]);
  const bookmarkCount = bookmarkList.length;

  useEffect(() => {
    setShowBookmarkDrawer(false);
  }, [bookId, stepIndex]);

  const buildGradient = (start?: string, middle?: string, end?: string, fallback?: string) => {
    const s = start ?? fallback ?? "#ffffff";
    const m = middle ?? null;
    const e = end ?? fallback ?? s;
    if (m) return `linear-gradient(180deg, ${s} 0%, ${m} 50%, ${e} 100%)`;
    return `linear-gradient(180deg, ${s} 0%, ${e} 100%)`;
  };

  return (
    <section
      className={`practice-workspace panel ${showPeek ? "peek-open" : "peek-closed"}`}
      style={{
        background: buildGradient(
          style?.wizardWorkspace?.panelBackgroundColorGradientStart,
          /* middle */ undefined,
          style?.wizardWorkspace?.panelBackgroundColorGradientEnd,
          style?.wizardWorkspace?.panelBackgroundColor ?? "#ffffff",
        ),
        borderColor: style?.wizardWorkspace?.panelBorderColor ?? "#e2e8f0",
        touchAction: "pan-y",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      onPointerDown={swipe.onPointerDown}
      onPointerUp={swipe.onPointerUp}
      onPointerCancel={swipe.onPointerCancel}
    >
      {/* ===========================================================
           TOP BAR — ONLY page navigation, centered compact group
           [ ‹ ]   Page 1 / 125   [ › ]
          =========================================================== */}
      <div
        className="practice-workspace-top-bar practice-workspace-top-nav"
        style={{
          background: style?.wizardTopInfo?.useBackgroundColorGradient
            ? `linear-gradient(180deg, ${style.wizardTopInfo.backgroundColorGradientStart} 0%, ${style.wizardTopInfo.backgroundColorGradientMiddle ?? style.wizardTopInfo.backgroundColorGradientStart} 50%, ${style.wizardTopInfo.backgroundColorGradientEnd} 100%)`
            : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
          borderBottom: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
        }}
      >
        <div className="practice-nav-group-centered">
          <button
            type="button"
            className="practice-nav-arrow practice-nav-arrow-prev"
            disabled={!canPrevious}
            onClick={onPrevious}
            aria-label="Previous page"
            style={{
              width: "44px",
              height: "44px",
              color: canPrevious
                ? (style?.wizardTopInfo?.navButton?.color ?? "#0f172a")
                : (style?.wizardTopInfo?.navButton?.disabledColor ?? "#94a3b8"),
              background: "transparent",
            }}
          >
            ‹
          </button>

          <span
            className="chapter-label practice-page-label"
            style={{
              padding: "0 8px",
              borderRadius: "0",
              background: "transparent",
              border: "none",
              color: style?.wizardTopInfo?.chapterLabel?.color ?? "#0f172a",
              fontSize: `${(style?.wizardTopInfo?.chapterLabel?.fontSize ?? 14) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterLabel?.fontWeight ?? 700,
              opacity: 1,
              textTransform: "none",
              textAlign: "center",
              minWidth: "7.5rem",
            }}
          >
            {`Page ${pageIndex ?? ""}/${totalPages ?? ""}`}
          </span>

          <button
            type="button"
            className="practice-nav-arrow practice-nav-arrow-next"
            disabled={!canNext}
            onClick={onNext}
            aria-label="Next page"
            style={{
              width: "44px",
              height: "44px",
              color: canNext
                ? (style?.wizardTopInfo?.navButton?.color ?? "#0f172a")
                : (style?.wizardTopInfo?.navButton?.disabledColor ?? "#94a3b8"),
              background: "transparent",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Step Brief (between top nav and content) */}
      {pageBrief?.trim() && (
        <div className="practice-workspace-step-header" style={{
          paddingTop: `${(style?.wizardTopInfo?.descriptionPaddingTop ?? 16) / 16}rem`,
          paddingBottom: `${(style?.wizardTopInfo?.descriptionPaddingBottom ?? 16) / 16}rem`,
          paddingLeft: `${(style?.wizardTopInfo?.descriptionPaddingLeft ?? 12) / 16}rem`,
          paddingRight: `${(style?.wizardTopInfo?.descriptionPaddingRight ?? 12) / 16}rem`,
          background: buildGradient(
            style?.wizardTopInfo?.descriptionBackgroundColorGradientStart,
            style?.wizardTopInfo?.descriptionBackgroundColorGradientMiddle,
            style?.wizardTopInfo?.descriptionBackgroundColorGradientEnd,
            style?.wizardTopInfo?.descriptionBackgroundColor ?? "transparent",
          ),
        }}>
          <div
            className="practice-workspace-desc"
            style={{
              color: style?.wizardTopInfo?.descriptionColor ?? "#64748b",
              fontSize: `${(style?.wizardTopInfo?.descriptionFontSize ?? 16) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.descriptionFontWeight ?? "normal",
              lineHeight: style?.wizardTopInfo?.descriptionLineHeight ?? 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: pageBrief }}
          />
        </div>
      )}

      {/* Workspace Body (content area, flexible fill) */}
      <div className="practice-workspace-body practice-workspace-content-area">
        <div className="practice-workspace-editor-shell">
          {loadError ? (
            <div className="practice-error-message">
              <pre>{loadError}</pre>
            </div>
          ) : children ? (
            children
          ) : hasEditor ? (
            <PracticeCodeEditor
              label={toolbarLabel ?? "Answer"}
              value={value}
              placeholder={placeholder}
              isText={isText}
              loadError={loadError}
              showPeek={showPeek}
              isMobileView={isMobileView}
              onTogglePeek={onTogglePeek ?? (() => {})}
              onVerify={onVerify ?? (() => {})}
              onChange={onChange ?? (() => {})}
              peekCode={peekCode}
              verifyDisabled={verifyDisabled}
            />
          ) : null}
        </div>

        {showPeek && onTogglePeek && !isMobileView ? (
          <section className="practice-peek-desktop" aria-label="Example code peek">
            <div className="practice-preview-header">
              <span>Peek Code</span>
              <button
                type="button"
                className="practice-peek-close"
                onClick={onTogglePeek}
                aria-label="Close peek"
              >
                ✕
              </button>
            </div>
            <pre>{peekCode}</pre>
          </section>
        ) : null}
      </div>

      {showPeek && onTogglePeek && isMobileView ? (
        <div className="modal-backdrop practice-peek-mobile-modal" onClick={onTogglePeek}>
          <div className="modal practice-peek-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Peek Code</h3>
              <button type="button" className="modal-close" onClick={onTogglePeek} aria-label="Close peek">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre>{peekCode}</pre>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===========================================================
           BOTTOM BAR — ONLY global actions, centered compact dock
                        [ 🏠 ]   32–40px gap   [ 📑 ]
          =========================================================== */}
      <div
        className="practice-workspace-bottom-bar practice-workspace-bottom-dock"
        style={{
          background: style?.wizardTopInfo?.useBackgroundColorGradient
            ? `linear-gradient(0deg, ${style.wizardTopInfo.backgroundColorGradientStart} 0%, ${style.wizardTopInfo.backgroundColorGradientMiddle ?? style.wizardTopInfo.backgroundColorGradientStart} 50%, ${style.wizardTopInfo.backgroundColorGradientEnd} 100%)`
            : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
          borderTop: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
        }}
      >
        <div className="practice-tool-dock-centered">
          <Link
            to="/"
            className="practice-tool-dock-button"
            aria-label="Home"
            title="Home"
            style={{
              width: "44px",
              height: "44px",
              color: style?.wizardTopInfo?.homeButton?.color ?? "#0f172a",
            }}
          >
            🏠
          </Link>

          {bookId && typeof stepIndex === "number" ? (
            <button
              type="button"
              className="practice-tool-dock-button practice-bookmark-button"
              onClick={() => setShowBookmarkDrawer((v) => !v)}
              aria-label={showBookmarkDrawer ? "Close bookmarks" : "Open bookmarks"}
              title={bookmarked ? "Bookmarked" : `Bookmarks (${bookmarkCount})`}
              style={{
                width: "44px",
                height: "44px",
                color: bookmarked
                  ? "#b45309"
                  : (style?.wizardTopInfo?.navButton?.color ?? "#0f172a"),
                background: bookmarked ? "rgba(253, 230, 138, 0.35)" : "transparent",
                border: bookmarked
                  ? `1px solid ${style?.wizardTopInfo?.navButton?.backgroundColor ?? "#fde68a"}`
                  : "none",
                position: "relative",
              }}
            >
              <span style={{ fontSize: bookmarked ? "22px" : "20px" }}>
                {bookmarked ? "🔖" : "📑"}
              </span>
              {bookmarkCount > 0 ? (
                <span
                  style={{
                    position: "absolute",
                    right: "-2px",
                    top: "-2px",
                    background: "#dc2626",
                    color: "white",
                    borderRadius: "999px",
                    minWidth: "16px",
                    height: "16px",
                    padding: "0 4px",
                    fontSize: "10px",
                    lineHeight: "16px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {bookmarkCount > 99 ? "99+" : String(bookmarkCount)}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>
      </div>

      {/* Bookmark Drawer: Right-side slide-in OVERLAY (no layout shift!) */}
      {showBookmarkDrawer ? (
        <>
          {/* Backdrop: click to close */}
          <div
            className="workspace-bookmark-backdrop"
            onClick={() => setShowBookmarkDrawer(false)}
            aria-hidden="true"
          />
          <div
            className="workspace-bookmark-drawer"
            style={{
              background: style?.wizardTopInfo?.descriptionBackgroundColor ?? "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: style?.wizardTopInfo?.descriptionColor ?? "#0f172a",
                }}
              >
                {bookmarkCount > 0 ? `🔖 Bookmarks (${bookmarkCount})` : "🔖 Bookmarks"}
              </h4>
              <button
                type="button"
                onClick={() => setShowBookmarkDrawer(false)}
                aria-label="Close bookmarks"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: style?.wizardTopInfo?.descriptionColor ?? "#0f172a",
                  fontSize: "18px",
                  lineHeight: 1,
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Current-page bookmark toggle (quick action) */}
            {bookId && typeof stepIndex === "number" && onToggleBookmark ? (
              <div
                style={{
                  padding: "10px 12px",
                  background: bookmarked
                    ? buildGradient(
                        style?.wizardTopInfo?.descriptionBackgroundColorGradientStart,
                        style?.wizardTopInfo?.descriptionBackgroundColorGradientMiddle,
                        style?.wizardTopInfo?.descriptionBackgroundColorGradientEnd,
                        style?.wizardTopInfo?.descriptionBackgroundColor ?? "#fffbeb",
                      )
                    : "rgba(15,23,42,0.04)",
                  border: `1px solid ${bookmarked ? "#f59e0b" : "rgba(15,23,42,0.08)"}`,
                  borderRadius: "12px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.7,
                      marginBottom: "2px",
                    }}
                  >
                    {`Page ${pageIndex ?? ""}${title ? ` · ` : ""}`}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: style?.wizardTopInfo?.descriptionColor ?? "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {title?.trim() ? title : stepTitle ?? "Current page"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleBookmark}
                  style={{
                    background: bookmarked ? "#b45309" : "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {bookmarked ? "🔖 Saved" : "📑 Save"}
                </button>
              </div>
            ) : null}

            {bookmarkCount === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: style?.wizardTopInfo?.descriptionColor ?? "#64748b",
                  opacity: 0.75,
                  padding: "10px 4px",
                }}
              >
                No saved bookmarks yet. Tap "Save" above to save your spot.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {bookmarkList.map((b) => {
                  const isCurrent = b.bookId === bookId && b.stepIndex === stepIndex;
                  return (
                    <li
                      key={b.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        padding: "10px 12px",
                        background: isCurrent
                          ? "#fef3c7"
                          : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
                        border: `1px solid ${isCurrent ? "#f59e0b" : "rgba(15,23,42,0.08)"}`,
                        borderRadius: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onJumpToBookmark?.(b.stepIndex)}
                        style={{
                          flex: 1,
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: style?.wizardTopInfo?.descriptionColor ?? "#0f172a",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {isCurrent ? "📍 " : ""}
                          {b.stepTitle?.trim() ? b.stepTitle : `Page ${b.stepIndex + 1}`}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            opacity: 0.7,
                            marginTop: "3px",
                          }}
                        >
                          {`Page ${b.stepIndex + 1}${b.createdAt ? ` · ${new Date(b.createdAt).toLocaleDateString()}` : ""}`}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark?.(b.id)}
                        aria-label="Remove bookmark"
                        title="Remove bookmark"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#991b1b",
                          fontSize: "15px",
                          lineHeight: 1,
                          padding: "6px 10px",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(153, 27, 27, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        🗑
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
