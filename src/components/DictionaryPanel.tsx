import { useState, useEffect, useRef } from "react";

interface DictionaryPanelProps {
  isVisible: boolean;
  onClose: () => void;
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

export default function DictionaryPanel({
  isVisible,
  onClose,
  styleConfig,
}: DictionaryPanelProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mock dictionary data - replace with actual API call
  const mockDictionary: Record<string, WordDefinition> = {
    solar: {
      word: "solar",
      partOfSpeech: "adjective",
      definition: "Relating to or determined by the sun.",
      example: "The solar system includes the sun and all the planets.",
    },
    planet: {
      word: "planet",
      partOfSpeech: "noun",
      definition: "A celestial body moving in an elliptical orbit around a star.",
      example: "Earth is the third planet from the sun.",
    },
    orbit: {
      word: "orbit",
      partOfSpeech: "noun",
      definition: "The curved path of a celestial object around a star, planet, or moon.",
      example: "The moon orbits the Earth every 27 days.",
    },
    gravity: {
      word: "gravity",
      partOfSpeech: "noun",
      definition: "The force that attracts a body toward the center of the earth or toward any other physical body having mass.",
      example: "Gravity keeps us on the ground.",
    },
    galaxy: {
      word: "galaxy",
      partOfSpeech: "noun",
      definition: "A system of millions or billions of stars, together with gas and dust, held together by gravitational attraction.",
      example: "The Milky Way is our home galaxy.",
    },
  };

  // Handle text selection
  useEffect(() => {
    if (!isVisible) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedWord(text);
        fetchDefinition(text);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    document.addEventListener("mouseup", handleSelection);

    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [isVisible]);

  const fetchDefinition = async (word: string) => {
    setIsLoading(true);
    setError(null);

    // Simulate API call with mock data
    setTimeout(() => {
      const lowerWord = word.toLowerCase();
      const found = mockDictionary[lowerWord];

      if (found) {
        setDefinition(found);
      } else {
        // Try to find partial matches
        const partialMatch = Object.keys(mockDictionary).find(
          (key) => key.includes(lowerWord) || lowerWord.includes(key)
        );
        if (partialMatch) {
          setDefinition(mockDictionary[partialMatch]);
        } else {
          setError(`No definition found for "${word}"`);
          setDefinition(null);
        }
      }
      setIsLoading(false);
    }, 300);
  };

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
