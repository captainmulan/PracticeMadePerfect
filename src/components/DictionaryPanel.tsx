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
      className="dictionary-panel"
      style={{
        background: styleConfig?.backgroundColor ?? "#ffffff",
        borderColor: styleConfig?.borderColor ?? "rgba(30, 41, 59, 0.18)",
        color: styleConfig?.textColor ?? "#17212b",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="dictionary-panel-close"
        aria-label="Close dictionary"
        title="Close dictionary"
      >
        ✕
      </button>
      <div className="dictionary-panel-content" role="status" aria-live="polite">
        {!selectedWord ? (
          <span className="dictionary-panel-message" title="Select any word in the content to see its definition.">
            Select a word to see its definition.
          </span>
        ) : isLoading ? (
          <span className="dictionary-panel-loading" aria-label="Loading definition">⏳</span>
        ) : error ? (
          <span className="dictionary-panel-error" title={error}>{error}</span>
        ) : definition ? (
          <div className="dictionary-result">
            <div className="dictionary-result-heading">
              <strong className="dictionary-term">{definition.word}</strong>
              {definition.partOfSpeech && <span className="dictionary-part-of-speech">{definition.partOfSpeech}</span>}
            </div>
            <p className="dictionary-definition-text">{definition.definition}</p>
            {definition.example && <p className="dictionary-example">“{definition.example}”</p>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
