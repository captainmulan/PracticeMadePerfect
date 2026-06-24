import { Link } from "react-router-dom";
import type { CourseShelfItem } from "../utils/courseShelf";
import type { CSSProperties } from "react";

interface CourseBookCardProps {
  item: CourseShelfItem;
}

export default function CourseBookCard({ item }: CourseBookCardProps) {
  const bookStyles: CSSProperties = { width: "160px", minWidth: "160px", maxWidth: "160px" };

  const content = (
    <div className="course-book-cover">
      <div className="course-book-cover-art" style={{ backgroundColor: item.color }}>
        <div className="course-book-cover-icon">{item.icon}</div>
        <div className="course-book-cover-details">
          <div className="course-book-title">{item.title}</div>
          <div className="course-book-meta">{item.meta}</div>
        </div>
      </div>
    </div>
  );

  if (item.link) {
    return (
      <Link to={item.link} className="course-book-card" style={bookStyles}>
        {content}
      </Link>
    );
  }

  return (
    <div className="course-book-card course-book-card-placeholder" style={bookStyles} aria-hidden="true">
      {content}
    </div>
  );
}
