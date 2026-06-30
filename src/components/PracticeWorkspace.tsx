import type { ChangeEvent, ReactNode } from "react";
import { getHomePageData } from "../utils/contentStore";

interface PracticeWorkspaceProps {
  bookName?: string;
  chapterName?: string;
  chapterNumber?: number;
  pageType?: string;
  pageIndex?: number;
  totalPages?: number;
  pageBrief?: string;
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
  onChange,
  peekCode = "",
  children,
}: PracticeWorkspaceProps) {
  const homeData = getHomePageData();
  const hasEditor = Boolean(onChange) && children === undefined;
  const showToolbar = Boolean(toolbarLabel || onTogglePeek || onVerify);
  const style = homeData.style;

  return (
    <section 
      className={`practice-workspace panel ${showPeek ? "peek-open" : "peek-closed"}`}
      style={{
        background: style?.wizardWorkspace?.usePanelBackgroundColorGradient 
          ? `linear-gradient(180deg, ${style.wizardWorkspace.panelBackgroundColorGradientStart} 0%, ${style.wizardWorkspace.panelBackgroundColorGradientEnd} 100%)` 
          : (style?.wizardWorkspace?.panelBackgroundColor ?? "#ffffff"),
        borderColor: style?.wizardWorkspace?.panelBorderColor ?? "#e2e8f0",
        color: style?.wizardWorkspace?.textColor ?? "#0f172a",
      }}
    >
      {/* Top Bar: Chapter Info + Book Name + Toolbar */}
      <div 
        className="practice-workspace-top-bar"
        style={{
          background: style?.wizardTopInfo?.useBackgroundColorGradient 
            ? `linear-gradient(180deg, ${style.wizardTopInfo.backgroundColorGradientStart} 0%, ${style.wizardTopInfo.backgroundColorGradientMiddle} 50%, ${style.wizardTopInfo.backgroundColorGradientEnd} 100%)` 
            : (style?.wizardTopInfo?.backgroundColor ?? "#ffffff"),
          borderBottomColor: style?.wizardTopInfo?.borderBottomColor ?? "#e2e8f0",
        }}
      >
        <div className="chapter-info">
          <span 
            className="chapter-label"
            style={{
              color: style?.wizardTopInfo?.chapterLabelColor ?? "#64748b",
              fontSize: `${(style?.wizardTopInfo?.chapterLabelFontSize ?? 10) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterLabelFontWeight ?? "700",
            }}
          >
            {style?.wizardTopInfo?.chapterLabelText ?? "CHAPTER"}
          </span>
          <span 
            className="chapter-number"
            style={{
              fontSize: `${(style?.wizardTopInfo?.chapterNumberFontSize ?? 24) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterNumberFontWeight ?? "700",
              color: style?.wizardTopInfo?.chapterNumberColor ?? "#0f172a",
              background: style?.wizardTopInfo?.chapterNumberUseBackgroundColorGradient 
                ? `linear-gradient(180deg, ${style.wizardTopInfo.chapterNumberBackgroundColorGradientStart} 0%, ${style.wizardTopInfo.chapterNumberBackgroundColorGradientMiddle} 50%, ${style.wizardTopInfo.chapterNumberBackgroundColorGradientEnd} 100%)` 
                : (style?.wizardTopInfo?.chapterNumberBackgroundColor ?? "transparent"),
              padding: style?.wizardTopInfo?.chapterNumberUseBackgroundColorGradient ? "0.25rem 0.75rem" : "0",
              borderRadius: style?.wizardTopInfo?.chapterNumberUseBackgroundColorGradient ? "0.5rem" : "0",
            }}
          >
            {chapterNumber}
          </span>
          <h2 
            className="step-title"
            style={{
              fontSize: `${(style?.wizardTopInfo?.chapterTitleFontSize ?? 20) / 16}rem`,
              fontWeight: style?.wizardTopInfo?.chapterTitleFontWeight ?? "700",
              color: style?.wizardTopInfo?.chapterTitleColor ?? "#0f172a",
            }}
          >
            {title}
          </h2>
        </div>
        <div className="top-bar-right">
          <div className="book-title" style={{
            fontSize: `${(style?.wizardTopInfo?.bookNameFontSize ?? 16) / 16}rem`,
            fontWeight: style?.wizardTopInfo?.bookNameFontWeight ?? "700",
            color: style?.wizardTopInfo?.bookNameColor ?? "#0f172a",
          }}>{bookName}</div>
          {showToolbar && (
            <div className="practice-workspace-toolbar">
              <div className="practice-header-actions">
                {onTogglePeek && (
                  <button
                    type="button"
                    className="action-button practice-header-button practice-tool-button"
                    onClick={onTogglePeek}
                    style={{
                      background: style?.wizardButtons?.useBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.backgroundColorGradientStart} 0%, ${style.wizardButtons.backgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.backgroundColor ?? "#e2e8f0"),
                      color: style?.wizardButtons?.color ?? "#0f172a",
                      fontSize: `${(style?.wizardButtons?.fontSize ?? 12) / 16}rem`,
                      fontWeight: style?.wizardButtons?.fontWeight ?? "700",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = style?.wizardButtons?.useHoverBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.hoverBackgroundColorGradientStart} 0%, ${style.wizardButtons.hoverBackgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.hoverBackgroundColor ?? "#cbd5e1");
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = style?.wizardButtons?.useBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.backgroundColorGradientStart} 0%, ${style.wizardButtons.backgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.backgroundColor ?? "#e2e8f0");
                    }}
                  >
                    {showPeek ? "Hide Peek" : "Peek"}
                  </button>
                )}
                {onVerify && (
                  <button
                    type="button"
                    className="action-button practice-header-button practice-tool-button"
                    onClick={onVerify}
                    disabled={verifyDisabled}
                    style={{
                      background: style?.wizardButtons?.useBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.backgroundColorGradientStart} 0%, ${style.wizardButtons.backgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.backgroundColor ?? "#e2e8f0"),
                      color: style?.wizardButtons?.color ?? "#0f172a",
                      fontSize: `${(style?.wizardButtons?.fontSize ?? 12) / 16}rem`,
                      fontWeight: style?.wizardButtons?.fontWeight ?? "700",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = style?.wizardButtons?.useHoverBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.hoverBackgroundColorGradientStart} 0%, ${style.wizardButtons.hoverBackgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.hoverBackgroundColor ?? "#cbd5e1");
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = style?.wizardButtons?.useBackgroundColorGradient 
                        ? `linear-gradient(180deg, ${style.wizardButtons.backgroundColorGradientStart} 0%, ${style.wizardButtons.backgroundColorGradientEnd} 100%)` 
                        : (style?.wizardButtons?.backgroundColor ?? "#e2e8f0");
                    }}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Brief */}
      {pageBrief && (
        <div className="practice-workspace-step-header" style={{
          paddingTop: `${(style?.wizardWorkspace?.descriptionPaddingTop ?? 16) / 16}rem`,
          paddingBottom: `${(style?.wizardWorkspace?.descriptionPaddingBottom ?? 16) / 16}rem`,
        }}>
          <p 
            className="practice-workspace-desc"
            style={{
              color: style?.wizardWorkspace?.descriptionColor ?? "#64748b",
              fontSize: `${(style?.wizardWorkspace?.descriptionFontSize ?? 16) / 16}rem`,
              fontWeight: style?.wizardWorkspace?.descriptionFontWeight ?? "normal",
              lineHeight: style?.wizardWorkspace?.descriptionLineHeight ?? 1.6,
            }}
          >
            {pageBrief}
          </p>
        </div>
      )}

      {/* Workspace Body */}
      <div 
        className="practice-workspace-body"
        style={{
          background: style?.wizardWorkspace?.useBackgroundColorGradient 
            ? `linear-gradient(180deg, ${style.wizardWorkspace.backgroundColorGradientStart} 0%, ${style.wizardWorkspace.backgroundColorGradientMiddle} 50%, ${style.wizardWorkspace.backgroundColorGradientEnd} 100%)` 
            : (style?.wizardWorkspace?.backgroundColor ?? "#ffffff"),
        }}
      >
        <div className="practice-workspace-editor-shell">
          {loadError ? (
            <div className="practice-error-message">
              <pre>{loadError}</pre>
            </div>
          ) : children ? (
            children
          ) : hasEditor ? (
            <label className="practice-text-label">
              {isText ? (
                <textarea
                  className="practice-textarea"
                  value={value}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event.target.value)}
                  placeholder={placeholder}
                  spellCheck={false}
                  autoComplete="off"
                />
              ) : (
                <textarea
                  className="practice-codearea"
                  value={value}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event.target.value)}
                  placeholder={placeholder}
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            </label>
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
