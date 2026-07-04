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
  const titlePosition = isEmpty ? (homePageData.style?.emptyBook?.titlePosition ?? "center-center") : (item.titlePosition ?? "center-center");
  const titleAlignment = (isEmpty
    ? (homePageData.style?.emptyBook?.titleAlignment ?? homePageData.style?.emptyBook?.titleTextAlign ?? "center")
    : (item.titleAlignment ?? item.titleTextAlign ?? "center")) as CSSProperties["textAlign"];
  const coverColorStart = isEmpty ? (homePageData.style?.emptyBook?.coverColorStart ?? "#f1f5f9") : item.coverColorStart;
  const coverColorMiddle = isEmpty ? (homePageData.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9") : item.coverColorMiddle;
  const coverColorEnd = isEmpty ? (homePageData.style?.emptyBook?.coverColorEnd ?? "#f1f5f9") : item.coverColorEnd;
  const coverWidth = item.coverWidth;
  const coverHeight = item.coverHeight;
  const displayTitle = isEmpty ? (homePageData.style?.emptyBook?.title ?? "Coming soon") : item.title;
  const iconPosition = item.iconPosition ?? "center-center";

  // Map position to styles
  const getPositionStyles = (pos: string) => {
    switch (pos) {
      case "top-left":
        return { top: "2px", left: "4px" };
      case "top-center":
        return { top: "2px", left: "50%", transform: "translateX(-50%)" };
      case "top-right":
        return { top: "2px", right: "4px" };
      case "center-left":
        return { top: "50%", left: "0", transform: "translateY(-50%)" };
      case "center-center":
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      case "center-right":
        return { top: "50%", right: "0", transform: "translateY(-50%)" };
      case "bottom-left":
        return { bottom: "4px", left: "4px" };
      case "bottom-center":
        return { bottom: "4px", left: "50%", transform: "translateX(-50%)" };
      case "bottom-right":
        return { bottom: "4px", right: "4px" };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  const bookStyles: CSSProperties = {
    ["--book-color" as any]: coverColorStart,
    ["--book-icon-font" as any]: `${iconFont}px`,
    ["--book-title-font" as any]: `${titleFontSize}px`,
    width: coverWidth ? `${coverWidth}px` : undefined,
  };

  const bookTitleStyles: CSSProperties = {
    fontSize: `calc(var(--book-title-font) / 4)`, // scale down for book card size
    fontWeight: titleFontWeight,
    color: titleColor,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const coverTitleStyles: CSSProperties = {
    fontSize: `calc(var(--book-title-font) / 4)`, // scale down for book card size
    fontWeight: titleFontWeight,
    color: titleColor,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    width: '100%',
    maxWidth: '100%',
    padding: '0 8px',
    boxSizing: 'border-box',
    textAlign: titleAlignment,
  };

  const iconContainerStyles = getPositionStyles(iconPosition);
  const titleContainerStyles = getPositionStyles(titlePosition);

  const content = (
    <>
      {item.link && <span className="book-title" style={bookTitleStyles}>{displayTitle}</span>}
      <div className="book-cover" style={{ 
        background: `linear-gradient(180deg, ${coverColorStart} 0%, ${coverColorMiddle} 50%, ${coverColorEnd} 100%)`, 
        position: "relative",
        width: coverWidth ? `${coverWidth}px` : undefined,
        height: coverHeight ? `${coverHeight}px` : undefined,
      }}>
        {isEmpty ? (
          <span className="book-cover-title" style={{ 
            position: "absolute",
            width: "100%",
            padding: "0 4px",
            boxSizing: "border-box",
            zIndex: 1,
            ...coverTitleStyles,
            ...titleContainerStyles
          }}>
            {displayTitle}
          </span>
        ) : (
          <>
            <span className="book-cover-title" style={{
              position: "absolute",
              ...titleContainerStyles,
              ...coverTitleStyles
            }}>{displayTitle}</span>
            <div className="book-icon" style={{ 
              position: "absolute", 
              width: `calc(var(--book-icon-font) * 1)`,
              height: `calc(var(--book-icon-font) * 1)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              lineHeight: 1,
              fontSize: `calc(var(--book-icon-font) * 0.7)`,
              color: item.iconColorStart ?? "#ffffff",
              zIndex: 5,
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
