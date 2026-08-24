interface CategoryBooksFolderCoverProps {
  label: string;
}

const MYANMAR_RE = /[\u1000-\u109F]/;

function wrapLabel(label: string): string[] {
  const text = label.trim();
  if (MYANMAR_RE.test(text) || text.length <= 16) return [text];
  const breakAt = text.lastIndexOf(" ", 16);
  if (breakAt >= 4) {
    return [text.slice(0, breakAt), text.slice(breakAt + 1)];
  }
  return [text];
}

export default function CategoryBooksFolderCover({ label }: CategoryBooksFolderCoverProps) {
  const lines = wrapLabel(label);
  const myanmar = MYANMAR_RE.test(label);
  return (
    <div className="book-folder-3d">
      <img className="book-folder-3d-photo" src="/folder-covers/generic-shelf.webp?v=2" alt="" draggable={false} />
      <span
        className={`book-folder-3d-ribbon${lines.length > 1 ? " book-folder-3d-ribbon--two" : ""}${myanmar ? " book-folder-3d-ribbon--mm" : ""}`}
      >
        {lines.map((line) => (
          <span key={line} className="book-folder-3d-ribbon-line">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
