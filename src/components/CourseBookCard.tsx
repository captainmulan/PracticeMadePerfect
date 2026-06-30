import { Link } from "react-router-dom";
import type { CourseShelfItem } from "../utils/courseShelf";
import type { CSSProperties } from "react";
import { getHomePageData } from "../utils/contentStore";

interface CourseBookCardProps {
  item: CourseShelfItem;
}

export default function CourseBookCard({ item }: CourseBookCardProps) {
  const homePageData = getHomePageData();
  const isEmpty = !item.link || item.placeholder;
  
  const iconSize = item.iconSize ?? 80; // default admin-configurable
  const iconFont = Math.round(iconSize * 0.9);
  const titleFontSize = isEmpty ? (homePageData.style?.emptyBook?.titleFontSize ?? 24) : (item.titleFontSize ?? 24);
  const titleFontWeight = isEmpty ? (homePageData.style?.emptyBook?.titleFontWeight ?? "bold") : (item.titleFontWeight ?? "bold");
  const titleColor = isEmpty ? (homePageData.style?.emptyBook?.titleColor ?? "#0f172a") : (item.titleColor ?? "#0f172a");
  const titlePosition = isEmpty ? (homePageData.style?.emptyBook?.titlePosition ?? "center-center") : "center-center";
  const coverColorStart = isEmpty ? (homePageData.style?.emptyBook?.coverColorStart ?? "#f1f5f9") : item.coverColorStart;
  const coverColorMiddle = isEmpty ? (homePageData.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9") : item.coverColorMiddle;
  const coverColorEnd = isEmpty ? (homePageData.style?.emptyBook?.coverColorEnd ?? "#f1f5f9") : item.coverColorEnd;
  const displayTitle = isEmpty ? (homePageData.style?.emptyBook?.title ?? "Coming soon") : item.title;
  const iconPosition = item.iconPosition ?? "center-center";

  // Map position to styles
  const getPositionStyles = (pos: string) => {
    switch (pos) {
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
    ["--book-color" as any]: coverColorStart,
  };

  const titleStyles: CSSProperties = {
    fontSize: `${titleFontSize / 4}px`, // scale down for book card size
    fontWeight: titleFontWeight,
    color: titleColor,
  };

  const iconContainerStyles = getPositionStyles(iconPosition);
  const titleContainerStyles = getPositionStyles(titlePosition);

  const content = (
    <>
      {item.link && <span className="book-title" style={titleStyles}>{displayTitle}</span>}
      <div className="book-cover" style={{ 
        background: `linear-gradient(180deg, ${coverColorStart} 0%, ${coverColorMiddle} 50%, ${coverColorEnd} 100%)`, 
        position: "relative" 
      }}>
        {isEmpty ? (
          <span className="book-cover-title" style={{ 
            position: "absolute",
            textAlign: "center",
            width: "100%",
            padding: "0 4px",
            boxSizing: "border-box",
            ...titleStyles,
            ...titleContainerStyles 
          }}>
            {displayTitle}
          </span>
        ) : (
          <>
            <span className="book-cover-title" style={titleStyles}>{displayTitle}</span>
            <div className="book-icon" style={{ 
              position: "absolute", 
              fontSize: `${iconFont}px`, 
              background: `linear-gradient(180deg, ${item.iconColorStart} 0%, ${item.iconColorMiddle} 50%, ${item.iconColorEnd} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              ...iconContainerStyles 
            }}>
              {item.icon}
            </div>
          </>
        )}
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
    <div className="book" style={bookStyles} aria-hidden={!displayTitle}>
      {content}
    </div>
  );
}
