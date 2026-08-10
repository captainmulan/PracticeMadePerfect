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
      }}
      onPointerDown={swipe.onPointerDown}
      onPointerUp={swipe.onPointerUp}
      onPointerCancel={swipe.onPointerCancel}
    >
      <div
        className="practice-workspace-top-bar"
        style={{
          background: style?.wizardTopInfo?.useBackgroundColorGradient
            ? `linear-gradient(180deg, ${style.wizardTopInfo.backgroundColorGradientStart} 0%, ${style.wizardTopInfo.backgroundColorGradientMiddle ?? style.wizardTopInfo.backgroundColorGradientStart} 50%, ${style.wizardTopInfo.backgroundColorGradientEnd} 100%)`
            : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
          borderBottom: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
        }}
      >
        <div className="chapter-nav-side chapter-nav-side-left">
        <button
          type="button"
          className="chapter-nav-button"
          disabled={!canPrevious}
          onClick={onPrevious}
          aria-label="Previous chapter"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: style?.wizardTopInfo?.navButton?.backgroundColor ?? "#e2e8f0",
            border: style?.wizardTopInfo?.navButton?.border ?? "none",
            cursor: canPrevious ? "pointer" : "not-allowed",
            color: canPrevious ? (style?.wizardTopInfo?.navButton?.color ?? "#0f172a") : (style?.wizardTopInfo?.navButton?.disabledColor ?? "#94a3b8"),
          }}
        >
          ←
        </button>
        </div>

        <div className="chapter-nav-center">
          <Link
            to="/"
            className="chapter-nav-home"
            aria-label="Home"
            style={{
              textDecoration: "none",
              width: "32px",
              height: "32px",
              borderRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: style?.wizardTopInfo?.homeButton?.color ?? "#0f172a",
              fontSize: "18px",
            }}
          >
            🏠
          </Link>
          <span
            className="chapter-label"
            style={{
              padding: "0",
              borderRadius: "0",
              background: "transparent",
              border: "none",
              color: style?.wizardTopInfo?.chapterLabel?.color ?? "#0f172a",
              fontSize: `${(style?.wizardTopInfo?.chapterLabel?.fontSize ?? 14) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterLabel?.fontWeight ?? 700,
              opacity: 1,
              textTransform: "none",
            }}
          >
            {`Page ${pageIndex ?? ""}/${totalPages ?? ""}`}
          </span>
        </div>

        <div className="chapter-nav-side chapter-nav-side-right" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {bookId && typeof stepIndex === "number" && onToggleBookmark ? (
            <>
              <button
                type="button"
                className="chapter-nav-button"
                onClick={onToggleBookmark}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
                title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
                style={{
                  fontSize: bookmarked ? "22px" : "20px",
                  fontWeight: "bold",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: bookmarked ? (style?.wizardTopInfo?.navButton?.backgroundColor ?? "#fde68a") : (style?.wizardTopInfo?.navButton?.backgroundColor ?? "#e2e8f0"),
                  border: "none",
                  cursor: "pointer",
                  color: bookmarked ? "#b45309" : (style?.wizardTopInfo?.navButton?.color ?? "#0f172a"),
                  filter: bookmarked ? "drop-shadow(0 1px 1px rgba(0,0,0,0.15))" : undefined,
                }}
              >
                {bookmarked ? "🔖" : "📑"}
              </button>
              <button
                type="button"
                className="chapter-nav-button"
                onClick={() => setShowBookmarkDrawer((v) => !v)}
                aria-label={showBookmarkDrawer ? "Close bookmarks" : "Open bookmarks"}
                title={`Bookmarks (${bookmarkCount})`}
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: showBookmarkDrawer ? (style?.wizardTopInfo?.navButton?.color ?? "#0f172a") : (style?.wizardTopInfo?.navButton?.backgroundColor ?? "#e2e8f0"),
                  border: "none",
                  cursor: "pointer",
                  color: showBookmarkDrawer ? "#ffffff" : (style?.wizardTopInfo?.navButton?.color ?? "#0f172a"),
                  position: "relative",
                }}
              >
                <span>☰</span>
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
            </>
          ) : null}
        <button
          type="button"
          className="chapter-nav-button"
          disabled={!canNext}
          onClick={onNext}
          aria-label="Next chapter"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: style?.wizardTopInfo?.navButton?.backgroundColor ?? "#e2e8f0",
            border: style?.wizardTopInfo?.navButton?.border ?? "none",
            cursor: canNext ? "pointer" : "not-allowed",
            color: canNext ? (style?.wizardTopInfo?.navButton?.color ?? "#0f172a") : (style?.wizardTopInfo?.navButton?.disabledColor ?? "#94a3b8"),
          }}
        >
          →
        </button>
        </div>
      </div>

      {showBookmarkDrawer ? (
        <div
          className="practice-workspace-step-header"
          style={{
            padding: "10px 12px",
            background: buildGradient(
              style?.wizardTopInfo?.descriptionBackgroundColorGradientStart,
              style?.wizardTopInfo?.descriptionBackgroundColorGradientMiddle,
              style?.wizardTopInfo?.descriptionBackgroundColorGradientEnd,
              style?.wizardTopInfo?.descriptionBackgroundColor ?? "#fffbeb",
            ),
            borderBottom: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#fde68a"}`,
            borderTop: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#fde68a"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: style?.wizardTopInfo?.descriptionColor ?? "#78350f",
              }}
            >
              {bookmarkCount > 0 ? `🔖 Bookmarks (${bookmarkCount})` : "🔖 No bookmarks yet"}
            </h4>
            <button
              type="button"
              onClick={() => setShowBookmarkDrawer(false)}
              aria-label="Close bookmarks"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: style?.wizardTopInfo?.descriptionColor ?? "#78350f",
                fontSize: "16px",
                lineHeight: 1,
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>
          {bookmarkCount === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: style?.wizardTopInfo?.descriptionColor ?? "#78350f",
                opacity: 0.75,
              }}
            >
              Tap the 📑 button to save a spot.
            </p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "min(42vh, 340px)",
                overflowY: "auto",
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
                      padding: "8px 10px",
                      background: isCurrent ? "#fef3c7" : "rgba(255,255,255,0.75)",
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
                        {isCurrent ? "• " : ""}
                        {b.stepTitle?.trim() ? b.stepTitle : `Page ${b.stepIndex + 1}`}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          opacity: 0.7,
                          marginTop: "2px",
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
                        fontSize: "16px",
                        lineHeight: 1,
                        padding: "4px 8px",
                        borderRadius: "6px",
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
      ) : null}

      {/* Step Brief */}
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

      {/* Workspace Body */}
      <div className="practice-workspace-body">
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
    </section>
  );
}
