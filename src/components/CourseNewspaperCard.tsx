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
    ? ((homePageData.style?.emptyBook as any)?.coverWidth ?? (item.coverWidth ?? 200))
    : (item.coverWidth ?? 200);
  const coverHeight = isEmpty
    ? ((homePageData.style?.emptyBook as any)?.coverHeight ?? (item.coverHeight ?? 280))
    : (item.coverHeight ?? 280);

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
          padding: "12px 10px",
          borderBottom: "3px double #1a1a1a",
          textAlign: "center",
          backgroundColor: "#f0ebe0"
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#666",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "4px"
          }}
        >
          Daily Edition
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "900",
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}
        >
          {item.title.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: "9px",
            color: "#444",
            marginTop: "6px",
            fontStyle: "italic"
          }}
        >
          {dateStr}
        </div>
      </div>

      {/* Newspaper content columns */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          display: "flex",
          gap: "8px",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0,0,0,0.03) 24px, rgba(0,0,0,0.03) 25px)"
        }}
      >
        {/* Left column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "4px" }}>
            HEADLINE
          </div>
          <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.3" }}>
            {item.description || "Breaking news and updates from around the world"}
          </div>
          {item.icon && (
            <div
              style={{
                fontSize: "36px",
                margin: "12px auto",
                textAlign: "center"
              }}
            >
              {item.icon}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ width: "1px", backgroundColor: "#ccc", margin: "4px 0" }}></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1a1a1a" }}>
            LOCAL NEWS
          </div>
          <div style={{ fontSize: "8px", color: "#444", lineHeight: "1.2" }}>
            Community events and announcements happening this week
          </div>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1a1a1a", marginTop: "8px" }}>
            OPINION
          </div>
          <div style={{ fontSize: "8px", color: "#444", lineHeight: "1.2" }}>
            Editorial: The importance of lifelong learning in today's world
          </div>
        </div>
      </div>

      {/* Newspaper footer */}
      <div
        style={{
          padding: "6px 10px",
          borderTop: "1px solid #ccc",
          fontSize: "8px",
          color: "#666",
          textAlign: "center",
          backgroundColor: "#f0ebe0"
        }}
      >
        Vol. 1, No. 1 • Price: $0.50
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
