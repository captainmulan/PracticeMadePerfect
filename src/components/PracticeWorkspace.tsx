import type { ChangeEvent, ReactNode, RefObject } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PracticeCodeEditor from "./PracticeCodeEditor";
import DictionaryPanel from "./DictionaryPanel";
import { usePageSwipeNavigation } from "../hooks/usePageSwipeNavigation";
import { getHomePageData } from "../utils/contentStore";
import "../styles/course.css";

interface PracticeWorkspaceProps {
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
  /** Same-origin book iframe — swipe inside page content also changes steps. */
  contentIframeRef?: RefObject<HTMLIFrameElement | null>;
  contentIframeBindKey?: string | number | null;
  /** Navigate to a specific page index (for bookmark navigation) */
  onNavigateToPage?: (pageIndex: number) => void;
  /** Bookmark-related props */
  bookId?: string | null;
  stepIndex?: number;
  stepTitle?: string;
  bookmarked?: boolean;
  bookmarks?: any[];
  onToggleBookmark?: () => void;
  onRemoveBookmark?: (bookmarkId: string) => void;
  onJumpToBookmark?: (stepIndex: number) => void;
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
  onNavigateToPage,
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

  const [showSettingsBar, setShowSettingsBar] = useState(false);
  const [showBookmarkHistory, setShowBookmarkHistory] = useState(false);
  const [dictionaryMode, setDictionaryMode] = useState(false);

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
      {/* Top Bar: Chapter Info + Book Name + Toolbar */}
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
          <button
            type="button"
            className="chapter-settings-gear"
            onClick={() => setShowSettingsBar(!showSettingsBar)}
            aria-label="Settings"
            style={{
              fontSize: "16px",
              fontWeight: "normal",
              width: "32px",
              height: "32px",
              borderRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              color: style?.wizardTopInfo?.navButton?.color ?? "#0f172a",
              marginLeft: "6px",
            }}
          >
            ⚙️
          </button>
        </div>

        <div className="chapter-nav-side chapter-nav-side-right">
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

      {/* Settings Bar - Toggleable bar with bookmark, bookmark history, dictionary */}
      {showSettingsBar && (
        <div
          className="practice-settings-bar"
          style={{
            background: style?.wizardTopInfo?.useBackgroundColorGradient
              ? `linear-gradient(180deg, ${style.wizardTopInfo.backgroundColorGradientStart} 0%, ${style.wizardTopInfo.backgroundColorGradientMiddle ?? style.wizardTopInfo.backgroundColorGradientStart} 50%, ${style.wizardTopInfo.backgroundColorGradientEnd} 100%)`
              : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
            borderBottom: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
            padding: "8px 16px",
          }}
        >
          <div className="practice-settings-buttons">
            <button
              type="button"
              className="practice-settings-btn"
              onClick={() => {
                // Save current page to bookmark history
                if (typeof pageIndex === "number") {
                  const bookmark = {
                    id: Date.now().toString(),
                    bookId: bookName ?? "",
                    stepIndex: pageIndex,
                    stepTitle: title,
                    createdAt: new Date().toISOString(),
                  };
                  const existingBookmarks = JSON.parse(localStorage.getItem("bookmarkHistory") || "[]");
                  const updatedBookmarks = [bookmark, ...existingBookmarks.filter((b: any) => b.stepIndex !== pageIndex)];
                  localStorage.setItem("bookmarkHistory", JSON.stringify(updatedBookmarks));
                  setShowBookmarkHistory(true);
                }
                setDictionaryMode(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "0",
                padding: "0",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: style?.wizardTopInfo?.navButton?.color ?? "#0f172a",
              }}
              title="Save bookmark"
            >
              📑
            </button>
            <button
              type="button"
              className="practice-settings-btn"
              onClick={() => {
                setShowBookmarkHistory(!showBookmarkHistory);
                setDictionaryMode(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "0",
                padding: "0",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: style?.wizardTopInfo?.navButton?.color ?? "#0f172a",
              }}
              title="Bookmark history"
            >
              📚
            </button>
            <button
              type="button"
              className="practice-settings-btn"
              onClick={() => {
                setDictionaryMode(!dictionaryMode);
                setShowBookmarkHistory(false);
              }}
              style={{
                background: dictionaryMode ? "rgba(15, 23, 42, 0.08)" : "transparent",
                border: "none",
                borderRadius: "0",
                padding: "0",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: style?.wizardTopInfo?.navButton?.color ?? "#0f172a",
              }}
              title="Dictionary"
            >
              🔍
            </button>
          </div>
        </div>
      )}

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

      {/* Bookmark History Right-Side Menu (20% overlap) */}
      {showBookmarkHistory && (
        <>
          <div
            className="bookmark-history-backdrop"
            onClick={() => setShowBookmarkHistory(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.3)",
              zIndex: 40,
            }}
          />
          <div
            className="bookmark-history-drawer"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "20%",
              minWidth: "280px",
              maxWidth: "400px",
              zIndex: 50,
              background: style?.wizardTopInfo?.backgroundColor ?? "#ffffff",
              borderLeft: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
              boxShadow: "-4px 0 20px rgba(15, 23, 42, 0.15)",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: style?.wizardTopInfo?.chapterLabel?.color ?? "#0f172a",
                }}
              >
                📚 Bookmark History
              </h4>
              <button
                type="button"
                onClick={() => setShowBookmarkHistory(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>
            {(() => {
              const bookmarks = JSON.parse(localStorage.getItem("bookmarkHistory") || "[]");
              if (bookmarks.length === 0) {
                return (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "#64748b",
                      opacity: 0.75,
                    }}
                  >
                    No saved bookmarks yet. Tap "Save" to bookmark this page.
                  </p>
                );
              }
              return (
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {bookmarks.map((b: any) => {
                    const isCurrent = b.stepIndex === pageIndex;
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
                          onClick={() => {
                            // Navigate to saved page index
                            if (onNavigateToPage && typeof b.stepIndex === "number") {
                              onNavigateToPage(b.stepIndex);
                              setShowBookmarkHistory(false);
                            }
                          }}
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
                          onClick={() => {
                            const updatedBookmarks = bookmarks.filter((item: any) => item.id !== b.id);
                            localStorage.setItem("bookmarkHistory", JSON.stringify(updatedBookmarks));
                          }}
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
              );
            })()}
          </div>
        </>
      )}

      {/* Dictionary Panel - Word Selection & Explanation */}
      {dictionaryMode && (
        <div
          className="dictionary-mode-overlay"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 45,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: style?.wizardTopInfo?.backgroundColor ?? "#ffffff",
              border: `1px solid ${style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0"}`,
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.15)",
              pointerEvents: "auto",
              maxWidth: "300px",
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
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: style?.wizardTopInfo?.chapterLabel?.color ?? "#0f172a",
                }}
              >
                🔍 Dictionary Mode
              </span>
              <button
                type="button"
                onClick={() => setDictionaryMode(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              Select any word in the content to see its definition.
            </p>
          </div>
        </div>
      )}

      {/* Dictionary Panel Component */}
      <DictionaryPanel
        isVisible={dictionaryMode}
        onClose={() => setDictionaryMode(false)}
        styleConfig={{
          backgroundColor: style?.wizardTopInfo?.backgroundColor,
          borderColor: style?.wizardTopInfo?.borderBottomColor,
          textColor: style?.wizardTopInfo?.chapterLabel?.color,
        }}
      />
    </section>
  );
}
