import { Link } from "react-router-dom";
import type { CourseShelfItem } from "../utils/courseShelf";
import type { CSSProperties } from "react";

interface CourseBookCardProps {
  item: CourseShelfItem;
}

export default function CourseBookCard({ item }: CourseBookCardProps) {
  const iconSize = item.iconSize ?? 80; // default admin-configurable
  const iconFont = Math.round(iconSize * 0.9);
  const bookStyles: CSSProperties = {
    width: "100px",
    minWidth: "100px",
    maxWidth: "100px",
    ["--book-color" as any]: item.color,
  };

  const content = (
    <>
      {item.link && <span className="book-title">{item.title}</span>}
      {item.link && <span className="book-cover-title">{item.title}</span>}
      <div className="book-cover" style={{ backgroundColor: item.color }}>
        <div className="book-icon" style={{ fontSize: `${iconFont}px` }}>{item.icon}</div>
        <div className="book-spine" />
      </div>
    </>
  );

  if (item.link) {
    return (
      <Link to={item.link} className="book" style={bookStyles}>
        {content}
      </Link>
    );
  }

  return (
    <div className="book" style={bookStyles} aria-hidden="true">
      {content}
    </div>
  );
}
