import { getHomePageData } from "../utils/contentStore";
import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import CourseBookCard from "./CourseBookCard";

interface HomeCourseShelvesProps {
  row: CourseShelfRow;
}

export default function HomeCourseShelves({ row }: HomeCourseShelvesProps) {
  const CHUNK = 3;
  const groups: CourseShelfItem[][] = [];
  const totalRows = Math.max(1, Math.ceil(row.items.length / CHUNK));

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    groups.push(row.items.slice(rowIndex * CHUNK, rowIndex * CHUNK + CHUNK));
  }

  return (
    <div className="bookshelf-container">
      {groups.map((group, rowIndex) => (
        <div key={`book-row-wrap-${rowIndex}`} className="shelf">
          <div className="books" key={`book-row-${rowIndex}`}>
            {group.map((item) => (
              <CourseBookCard key={item.id} item={item} />
            ))}
            {Array.from({ length: CHUNK - group.length }).map((_, emptyIndex) => {
              const homePageData = getHomePageData();
              const emptyBookWidth = homePageData.style?.emptyBook?.coverWidth ?? 100;
              const emptyBookHeight = homePageData.style?.emptyBook?.coverHeight ?? 150;

              return (
                <div
                  key={`empty-${rowIndex}-${emptyIndex}`}
                  className="book empty-space"
                  style={{
                    width: `${emptyBookWidth}px`,
                    minWidth: `${emptyBookWidth}px`,
                    maxWidth: `${emptyBookWidth}px`,
                  }}
                >
                  <div
                    className="book-cover"
                    style={{
                      width: `${emptyBookWidth}px`,
                      height: `${emptyBookHeight}px`,
                      background: "linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%)",
                      position: "relative",
                    }}
                  >
                    <span
                      className="empty-book-text"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#000",
                        fontSize: "12px",
                        textAlign: "center",
                        width: "80%",
                      }}
                    >
                      Coming soon
                    </span>
                    <div className="book-spine" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="shelf-board" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
