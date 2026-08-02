import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { CourseShelfItem } from "../utils/courseShelf";

interface AuthorShelfCardProps {
  item: CourseShelfItem;
  onItemClick?: (item: CourseShelfItem) => void;
}

export default function AuthorShelfCard({ item, onItemClick }: AuthorShelfCardProps) {
  const authorAvatarUrl = item.coverImageUrl?.trim();
  const isImageAvatar = Boolean(authorAvatarUrl && /^https?:\/\//i.test(authorAvatarUrl));
  const cardStyles: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "10px",
    padding: item.placeholder ? "4px 0 0" : "0",
    background: "transparent",
    border: "none",
    boxSizing: "border-box",
    cursor: item.placeholder ? "default" : "pointer",
    width: "auto",
    minHeight: "auto",
  };

  const content = (
    <div className={`author-profile-content${item.placeholder ? " placeholder" : ""}`} style={cardStyles}>
      <div className="author-profile-avatar">
        {isImageAvatar ? (
          <img
            src={authorAvatarUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="author-profile-icon">{item.icon || "👤"}</span>
        )}
      </div>
      <div className="author-profile-title">{item.title}</div>
    </div>
  );

  if (item.placeholder) {
    return <div aria-hidden="true">{content}</div>;
  }

  if (item.link) {
    return (
      <Link to={item.link} style={{ textDecoration: "none", background: "transparent" }}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="author-profile-button"
      onClick={() => onItemClick?.(item)}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        width: "auto",
      }}
      aria-label={`View books by ${item.title}`}
    >
      {content}
    </button>
  );
}
