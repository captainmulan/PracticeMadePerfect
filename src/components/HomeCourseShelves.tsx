import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import CourseBookCard from "./CourseBookCard";

interface HomeCourseShelvesProps {
  row: CourseShelfRow;
}

export default function HomeCourseShelves({ row }: HomeCourseShelvesProps) {
  const CHUNK = 7;
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
            {Array.from({ length: CHUNK - group.length }).map((_, emptyIndex) => (
              <div key={`empty-${rowIndex}-${emptyIndex}`} className="book empty-space">
                <span className="empty-book-text">Coming soon</span>
              </div>
            ))}
          </div>
          <div className="shelf-board" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
