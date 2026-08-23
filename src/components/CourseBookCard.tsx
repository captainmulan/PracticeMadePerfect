import { Link } from "react-router-dom";
import type { CourseShelfItem } from "../utils/courseShelf";
import type { CSSProperties } from "react";
import { getHomePageData } from "../utils/contentStore";

interface CourseBookCardProps {
  item: CourseShelfItem;
  /** When true, prefer admin/seed cover image over gradient+icon. */
  useCoverImage?: boolean;
  hideTitleRibbon?: boolean;
  onItemClick?: (item: CourseShelfItem) => void;
}

export default function CourseBookCard({ item, useCoverImage = false, hideTitleRibbon = false, onItemClick }: CourseBookCardProps) {
  const homePageData = getHomePageData();
  const isEmpty = Boolean(item.placeholder);
  const isAuthor = item.actionType === "author";
  const isLanguageSub = item.actionType === "language-sub";
  const isCategory = item.actionType === "category";
  const isEmojiCategory = isCategory && !item.coverImageUrl;
  const authorAvatarUrl = isAuthor ? item.coverImageUrl?.trim() : undefined;
  const isImageAvatar = Boolean(authorAvatarUrl && /^https?:\/\//i.test(authorAvatarUrl));
  const showCoverImage = Boolean(
    useCoverImage && item.coverImageUrl && !isEmpty && (!item.actionType || isLanguageSub || (isCategory && Boolean(item.coverImageUrl))),
  );
  const showCaption = !isEmpty && isEmojiCategory;
  const showCoverRibbon = !hideTitleRibbon && !isEmpty && !isAuthor && !isCategory && !isLanguageSub;
  
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
  };

  const authorCoverStyles: CSSProperties = isAuthor
    ? {
        background: "transparent",
        borderRadius: 0,
        boxShadow: "none",
        border: "none",
        padding: 0,
      }
    : {};

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
    // remove heavy text shadow for empty/placeholder books so "Normal" weight renders correctly
    textShadow: isEmpty ? 'none' : undefined,
  };

  const iconContainerStyles = getPositionStyles(iconPosition);
  const titleContainerStyles = getPositionStyles(titlePosition);

  const content = (
    <>
      {showCaption ? (
        <div className="book-caption">
          <span className="book-caption-title">{displayTitle}</span>
        </div>
      ) : null}
      <div className={`book-cover${isEmojiCategory ? " book-cover--emoji" : ""}`} style={{ 
        ...authorCoverStyles,
        background: showCoverImage || isEmojiCategory
          ? undefined
          : `linear-gradient(180deg, ${coverColorStart} 0%, ${coverColorMiddle} 50%, ${coverColorEnd} 100%)`, 
        position: "relative",
        overflow: isEmojiCategory ? "visible" : "hidden",
      }}>
        {isEmojiCategory ? (
          item.iconImageUrl ? (
            <img
              className="book-category-emoji book-category-flag"
              src={item.iconImageUrl}
              alt=""
              draggable={false}
            />
          ) : (
            <span className="book-category-emoji" aria-hidden="true">{item.icon}</span>
          )
        ) : isAuthor ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
              height: "100%",
              paddingBottom: "6px",
              background: "transparent",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "999px",
                border: "3px solid rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 0 0 2px rgba(15,23,42,0.08)",
                marginBottom: "8px",
              }}
            >
              {isImageAvatar ? (
                <img
                  src={authorAvatarUrl}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <span style={{ fontSize: 34, lineHeight: 1 }}>{item.icon || "👤"}</span>
              )}
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#f8fafc",
                textAlign: "center",
                lineHeight: 1.2,
                whiteSpace: "normal",
                wordBreak: "break-word",
                textShadow: "0 1px 2px rgba(0,0,0,0.45)",
              }}
            >
              {item.title}
            </span>
          </div>
        ) : showCoverImage ? (
          <img
            className="book-cover-image"
            src={(item.coverImageUrl ?? "").replace(/ /g, "%20")}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="(max-width: 640px) 46vw, (max-width: 980px) 28vw, 18vw"
            style={{
              position: "absolute",
              inset: 0,
              left: 10,
              width: "calc(100% - 10px)",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              background: "#0b1220",
              display: "block",
            }}
            onError={(event) => {
              const image = event.currentTarget;
              const current = image.src;
              if (!current.includes("/thumbs/") && current.includes("/book_covers/")) {
                image.src = current.replace("/book_covers/", "/book_covers/thumbs/");
                return;
              }
              if (current.includes("/thumbs/")) {
                /* thumbs are canonical — nothing further to try */
              }
            }}
          />
        ) : isEmpty ? (
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
            {item.iconImageUrl ? (
              <img
                src={item.iconImageUrl}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              />
            ) : (
              item.icon
            )}
          </div>
        )}
        {showCoverRibbon ? (
          <div className="book-cover-ribbon">
            <span className="book-cover-ribbon-title">{displayTitle}</span>
          </div>
        ) : null}
        {!isEmojiCategory ? <div className="book-spine" /> : null}
      </div>
    </>
  );

  if (item.actionType === "author" || item.actionType === "category" || item.actionType === "language-sub") {
    const openLabel =
      item.actionType === "language-sub"
        ? `Open ${item.description || item.category || "language"} books`
        : item.actionType === "category"
          ? `Open ${item.title}`
          : `View books by ${item.title}`;
    return (
      <button
        type="button"
        className={`book${showCoverImage ? " book--cover-image" : ""}${isEmojiCategory ? " book--category" : ""}`}
        style={{ ...bookStyles, border: "none", cursor: "pointer", padding: 0 }}
        onClick={() => onItemClick?.(item)}
        aria-label={openLabel}
      >
        {content}
      </button>
    );
  }

  if (item.link) {
    return (
      <Link to={item.link} className={`book${showCoverImage ? " book--cover-image" : ""}`} style={bookStyles}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`book${showCoverImage ? " book--cover-image" : ""}`} style={bookStyles} aria-hidden={!displayTitle}>
      {content}
    </div>
  );
}
