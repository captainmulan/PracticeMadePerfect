import React from "react";
import { Link } from "react-router-dom";
import { CourseShelfItem } from "../utils/courseShelf";
import { getHomePageData } from "../utils/contentStore";

interface CourseNewspaperCardProps {
  item: CourseShelfItem;
}

export default function CourseNewspaperCard({ item }: CourseNewspaperCardProps) {
  const homePageData = getHomePageData();
  const isEmpty = !item.link || item.placeholder;
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const coverWidth = isEmpty
    ? ((homePageData.style?.emptyBook as any)?.coverWidth ?? (item.coverWidth ?? 100))
    : (item.coverWidth ?? 100);
  const coverHeight = isEmpty
    ? ((homePageData.style?.emptyBook as any)?.coverHeight ?? (item.coverHeight ?? 160))
    : (item.coverHeight ?? 160);

  const content = (
    <div
      style={{
        width: `${coverWidth}px`,
        height: `${coverHeight}px`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f5e6",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.25), inset 0 0 30px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,0,0,0.05)";
      }}
    >
      {/* Newspaper header */}
      <div
        style={{
          padding: "6px 4px",
          borderBottom: "2px double #1a1a1a",
          textAlign: "center",
          backgroundColor: "#f0ebe0"
        }}
      >
        <div
          style={{
            fontSize: "6px",
            color: "#666",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "2px"
          }}
        >
          Daily
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "900",
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            lineHeight: "1.1"
          }}
        >
          {item.title.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: "6px",
            color: "#444",
            marginTop: "2px",
            fontStyle: "italic"
          }}
        >
          {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Newspaper content - single column for compact size */}
      <div
        style={{
          flex: 1,
          padding: "6px 4px",
          display: "flex",
          flexDirection: "column",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,0,0,0.03) 18px, rgba(0,0,0,0.03) 19px)"
        }}
      >
        <div style={{ fontSize: "9px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "3px" }}>
          HEADLINE
        </div>
        <div style={{ fontSize: "7px", color: "#333", lineHeight: "1.2", marginBottom: "6px" }}>
          {item.description || "Breaking news updates"}
        </div>
        {item.icon && (
          <div
            style={{
              fontSize: "20px",
              margin: "4px auto",
              textAlign: "center"
            }}
          >
            {item.icon}
          </div>
        )}
        <div style={{ fontSize: "8px", fontWeight: "bold", color: "#1a1a1a", marginTop: "4px" }}>
          LOCAL
        </div>
        <div style={{ fontSize: "6px", color: "#444", lineHeight: "1.1" }}>
          Community events this week
        </div>
      </div>

      {/* Newspaper footer */}
      <div
        style={{
          padding: "3px 4px",
          borderTop: "1px solid #ccc",
          fontSize: "6px",
          color: "#666",
          textAlign: "center",
          backgroundColor: "#f0ebe0"
        }}
      >
        Vol. 1 • $0.50
      </div>
    </div>
  );

  if (item.link) {
    return (
      <Link to={item.link} className="newspaper" aria-label={`Open ${item.title}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className="newspaper" aria-hidden={!item.title}>
      {content}
    </div>
  );
}
