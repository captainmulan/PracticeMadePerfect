import { useState, useEffect, useRef } from "react";

interface DictionaryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectionText?: string | null;
  styleConfig?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

interface WordDefinition {
  word: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface DictionaryApiEntry {
  word?: string;
  phonetic?: string;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
    }>;
  }>;
}

interface DatamuseEntry {
  word?: string;
  defs?: string[];
}

export default function DictionaryPanel({
  isVisible,
  onClose,
  selectionText = null,
  styleConfig,
}: DictionaryPanelProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(selectionText);
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle text selection
  useEffect(() => {
    if (!isVisible) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedWord(text);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    document.addEventListener("mouseup", handleSelection);

    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !selectionText?.trim()) return;
    setSelectedWord(selectionText.trim());
  }, [isVisible, selectionText]);

  useEffect(() => {
    if (!isVisible || !selectedWord) return;
    const word = selectedWord.trim().split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "");
    if (!word) {
      setDefinition(null);
      setError("Select an English word.");
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    const fetchDefinition = async () => {
      setIsLoading(true);
      setDefinition(null);
      setError(null);
      const primaryController = new AbortController();
      let primaryTimedOut = false;
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 8000);
      const primaryTimeoutId = window.setTimeout(() => {
        primaryTimedOut = true;
        primaryController.abort();
      }, 3500);

      try {
        let response: Response | null = null;
        try {
          response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            { signal: primaryController.signal },
          );
          if (response.ok) {
            const entries = (await response.json()) as DictionaryApiEntry[];
            const entry = entries[0];
            const meaning = entry?.meanings?.find((item) => item.definitions?.[0]);
            const firstDefinition = meaning?.definitions?.[0];
            if (entry && firstDefinition?.definition) {
              setDefinition({
                word: entry.word ?? word,
                partOfSpeech: meaning?.partOfSpeech ?? "",
                definition: firstDefinition.definition,
                example: firstDefinition.example,
              });
              return;
            }
          }
        } catch (primaryError) {
          if (timedOut && !primaryTimedOut) throw primaryError;
          /* dictionaryapi.dev may be unavailable or blocked by CORS. */
        } finally {
          window.clearTimeout(primaryTimeoutId);
        }

        const fallbackResponse = await fetch(
          `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`,
          { signal: controller.signal },
        );
        if (!fallbackResponse.ok) throw new Error("service-unavailable");
        const fallbackEntries = (await fallbackResponse.json()) as DatamuseEntry[];
        const fallback = fallbackEntries[0];
        const rawDefinition = fallback?.defs?.[0];
        if (!fallback?.word || !rawDefinition) throw new Error("not-found");
        const separator = rawDefinition.indexOf("\t");
        setDefinition({
          word: fallback.word,
          partOfSpeech: separator > 0 ? rawDefinition.slice(0, separator) : "",
          definition: separator > 0 ? rawDefinition.slice(separator + 1) : rawDefinition,
        });
      } catch (fetchError) {
        if (timedOut) {
          setError("Dictionary service timed out. Please try again.");
        } else if ((fetchError as Error).name !== "AbortError") {
          setDefinition(null);
          setError(
            (fetchError as Error).message === "not-found"
              ? `No short definition found for "${word}".`
              : "Dictionary service is temporarily unavailable. Please try again.",
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) setIsLoading(false);
        else if (timedOut) setIsLoading(false);
      }
    };

    void fetchDefinition();
    return () => controller.abort();
  }, [isVisible, selectedWord]);

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: styleConfig?.backgroundColor ?? "#ffffff",
        border: `1px solid ${styleConfig?.borderColor ?? "#e2e8f0"}`,
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 6px 30px rgba(15, 23, 42, 0.2)",
        zIndex: 55,
        maxWidth: "400px",
        minWidth: "280px",
        animation: "slideUp 0.2s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: styleConfig?.textColor ?? "#0f172a",
            }}
          >
            Dictionary
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px 8px",
            borderRadius: "6px",
            color: styleConfig?.textColor ?? "#0f172a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(15, 23, 42, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ✕
        </button>
      </div>

      {!selectedWord ? (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#64748b",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Select any word in the content to see its definition.
        </p>
      ) : isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 0",
          }}
        >
          <span style={{ fontSize: "24px", animation: "spin 1s linear infinite" }}>
            ⏳
          </span>
        </div>
      ) : error ? (
        <div
          style={{
            padding: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#dc2626",
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        </div>
      ) : definition ? (
        <div>
          <div
            style={{
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: styleConfig?.textColor ?? "#0f172a",
              }}
            >
              {definition.word}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
                fontStyle: "italic",
                marginLeft: "8px",
              }}
            >
              {definition.partOfSpeech}
            </span>
          </div>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            {definition.definition}
          </p>
          {definition.example && (
            <p
              style={{
                margin: 0,
              fontSize: "13px",
                color: "#64748b",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              <em>"{definition.example}"</em>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
