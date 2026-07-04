import type { ChangeEvent } from "react";

interface PracticeCodeEditorProps {
  label: string;
  value: string;
  placeholder: string;
  isText?: boolean;
  loadError?: string;
  showPeek: boolean;
  isMobileView: boolean;
  onTogglePeek: () => void;
  onVerify: () => void;
  onChange: (value: string) => void;
  peekCode: string;
  verifyDisabled?: boolean;
}

export default function PracticeCodeEditor({
  label,
  value,
  placeholder,
  isText = false,
  loadError,
  showPeek,
  isMobileView,
  onTogglePeek,
  onVerify,
  onChange,
  peekCode,
  verifyDisabled = false,
}: PracticeCodeEditorProps) {
  return (
    <>
      <section className={`practice-layout full-code ${showPeek ? "code-peek-open" : "code-peek-hidden"}`}>
        <section className="practice-right panel">
          <div className="practice-answer-toolbar">
            <div className="practice-header-actions">
              <button
                type="button"
                className="chapter-action-button"
                onClick={onTogglePeek}
              >
                {showPeek ? "Hide Peek" : "Peek"}
              </button>
              <button
                type="button"
                className="chapter-action-button"
                onClick={onVerify}
                disabled={verifyDisabled}
              >
                Verify
              </button>
            </div>
          </div>

          <div className="practice-editor-area">
            <div className="practice-editor-shell">
              {loadError ? (
                <div className="practice-error-message">
                  <pre>{loadError}</pre>
                </div>
              ) : (
                <label className="practice-text-label">
                  {isText ? (
                    <textarea
                      className="practice-textarea"
                      value={value}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
                      placeholder={placeholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  ) : (
                    <textarea
                      className="practice-codearea"
                      value={value}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
                      placeholder={placeholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  )}
                </label>
              )}
            </div>
          </div>

          {showPeek && !isMobileView && (
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
          )}
        </section>
      </section>

      {showPeek && isMobileView && (
        <div className="modal-backdrop practice-peek-mobile-modal" onClick={onTogglePeek}>
          <div className="modal practice-peek-modal" onClick={(e) => e.stopPropagation()}>
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
      )}
    </>
  );
}
