interface PdfFunLoaderProps {
  compact?: boolean;
  label?: string;
}

export default function PdfFunLoader({
  compact = false,
  label = "Getting your book ready…",
}: PdfFunLoaderProps) {
  return (
    <div className={`pdf-fun-loader${compact ? " pdf-fun-loader--compact" : ""}`} aria-live="polite">
      <div className="pdf-fun-loader-stage" aria-hidden="true">
        <span className="pdf-fun-loader-book pdf-fun-loader-book--a">📗</span>
        <span className="pdf-fun-loader-book pdf-fun-loader-book--b">📘</span>
        <span className="pdf-fun-loader-book pdf-fun-loader-book--c">📙</span>
        <span className="pdf-fun-loader-sparkle">✨</span>
      </div>
      <p className="pdf-fun-loader-label">{label}</p>
    </div>
  );
}
