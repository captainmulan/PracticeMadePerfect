import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import CourseBookCard from "./CourseBookCard";

interface HomeCourseShelvesProps {
  row: CourseShelfRow;
}

export default function HomeCourseShelves({ row }: HomeCourseShelvesProps) {
  const groups: CourseShelfItem[][] = [];
  const totalRows = Math.max(1, Math.ceil(row.items.length / 5));

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    groups.push(row.items.slice(rowIndex * 5, rowIndex * 5 + 5));
  }

  return (
    <div className="home-course-shelves">
      <div className="course-shelf-row">
        <div className="course-shelf-row-title">{row.title} Bookshelf</div>
        {groups.map((group, rowIndex) => (
          <div className="course-book-row" key={`book-row-${rowIndex}`}>
            {group.map((item) => (
              <CourseBookCard key={item.id} item={item} />
            ))}
            {Array.from({ length: 5 - group.length }).map((_, emptyIndex) => (
              <div key={`empty-${rowIndex}-${emptyIndex}`} className="course-book-card course-book-card-empty" aria-hidden="true" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
