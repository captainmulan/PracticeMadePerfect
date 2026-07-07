import type { ChangeEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import PracticeCodeEditor from "./PracticeCodeEditor";
import { getHomePageData } from "../utils/contentStore";

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
}: PracticeWorkspaceProps) {
  const homeData = getHomePageData();
  const hasEditor = Boolean(onChange) && children === undefined;
  const style = homeData.style;

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
      }}
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
        <div className="chapter-info-left">
          <span 
            className="chapter-label"
            style={{
              color: style?.wizardTopInfo?.chapterLabelColor ?? "#64748b",
              fontSize: `${(style?.wizardTopInfo?.chapterLabelFontSize ?? 10) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterLabelFontWeight ?? "700",
            }}
          >
            {`${style?.wizardTopInfo?.chapterLabelText ?? "Chapter"} ${chapterNumber ?? ""}`}
          </span>
        </div>

        {(onPrevious || onNext) && (
          <div className="chapter-nav-buttons">
            <button
              type="button"
              className="chapter-nav-button"
              disabled={!canPrevious}
              onClick={onPrevious}
              aria-label="Previous chapter"
            >
              ←
            </button>
            <button
              type="button"
              className="chapter-nav-button"
              disabled={!canNext}
              onClick={onNext}
              aria-label="Next chapter"
            >
              →
            </button>
          </div>
        )}

        <div className="top-bar-right">
          <Link to="/" className="chapter-nav-home" aria-label="Home">
            🏠
          </Link>
        </div>
      </div>

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
