import { Link } from "react-router-dom";
import type { CourseShelfItem } from "../utils/courseShelf";
import type { CSSProperties } from "react";

interface CourseBookCardProps {
  item: CourseShelfItem;
}

export default function CourseBookCard({ item }: CourseBookCardProps) {
  const iconSize = item.iconSize ?? 80; // default admin-configurable
  const iconFont = Math.round(iconSize * 0.9);
  const titleFontSize = item.titleFontSize ?? 24;
  const titleFontWeight = item.titleFontWeight ?? "bold";
  const titleColor = item.titleColor ?? "#0f172a";
  const iconPosition = item.iconPosition ?? "center-center";

  // Map icon position to styles
  const getIconPositionStyles = () => {
    switch (iconPosition) {
      case "top-left":
        return { top: "8px", left: "8px" };
      case "top-center":
        return { top: "8px", left: "50%", transform: "translateX(-50%)" };
      case "top-right":
        return { top: "8px", right: "8px" };
      case "center-left":
        return { top: "50%", left: "8px", transform: "translateY(-50%)" };
      case "center-center":
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      case "center-right":
        return { top: "50%", right: "8px", transform: "translateY(-50%)" };
      case "bottom-left":
        return { bottom: "8px", left: "8px" };
      case "bottom-center":
        return { bottom: "8px", left: "50%", transform: "translateX(-50%)" };
      case "bottom-right":
        return { bottom: "8px", right: "8px" };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  const bookStyles: CSSProperties = {
    width: "100px",
    minWidth: "100px",
    maxWidth: "100px",
    ["--book-color" as any]: item.color,
  };

  const titleStyles: CSSProperties = {
    fontSize: `${titleFontSize / 4}px`, // scale down for book card size
    fontWeight: titleFontWeight,
    color: titleColor,
  };

  const iconContainerStyles = getIconPositionStyles();

  const content = (
    <>
      {item.link && <span className="book-title" style={titleStyles}>{item.title}</span>}
      {item.link && <span className="book-cover-title" style={titleStyles}>{item.title}</span>}
      <div className="book-cover" style={{ backgroundColor: item.color, position: "relative" }}>
        <div className="book-icon" style={{ position: "absolute", fontSize: `${iconFont}px`, ...iconContainerStyles }}>
          {item.icon}
        </div>
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
