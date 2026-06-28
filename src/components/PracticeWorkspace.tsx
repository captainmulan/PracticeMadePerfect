import type { ChangeEvent, ReactNode } from "react";

interface PracticeWorkspaceProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: string;
  progressPct?: number;
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
  eyebrow,
  title,
  description,
  meta,
  progressPct,
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
  const hasEditor = Boolean(onChange) && children === undefined;
  const showToolbar = Boolean(toolbarLabel || onTogglePeek || onVerify);

  return (
    <section className={`practice-workspace panel ${showPeek ? "peek-open" : "peek-closed"}`}>
      <div className="practice-workspace-top">
        <div className="practice-workspace-intro">
          {eyebrow ? <div className="practice-workspace-eyebrow">{eyebrow}</div> : null}
          <h1 className="practice-workspace-title">{title}</h1>
          {meta ? <div className="practice-workspace-meta">{meta}</div> : null}
          {progressPct !== undefined ? (
            <div className="practice-workspace-progress" aria-hidden="true">
              <div className="practice-workspace-progress-bar" style={{ width: `${progressPct}%` }} />
            </div>
          ) : null}
          {description ? <p className="practice-workspace-desc">{description}</p> : null}
        </div>

        {showToolbar ? (
          <div className="practice-workspace-toolbar">
            {toolbarLabel ? <span className="panel-heading">{toolbarLabel}</span> : null}
            <div className="practice-header-actions">
              {onTogglePeek ? (
                <button
                  type="button"
                  className="action-button practice-header-button practice-tool-button"
                  onClick={onTogglePeek}
                >
                  {showPeek ? "Hide Peek" : "Peek"}
                </button>
              ) : null}
              {onVerify ? (
                <button
                  type="button"
                  className="action-button practice-header-button practice-tool-button"
                  onClick={onVerify}
                  disabled={verifyDisabled}
                >
                  Verify
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="practice-workspace-body">
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
