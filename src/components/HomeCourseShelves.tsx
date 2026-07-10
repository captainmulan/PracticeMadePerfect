import { getHomePageData } from "../utils/contentStore";
import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import CourseBookCard from "./CourseBookCard";
import CourseMagazineCard from "./CourseMagazineCard";
import CourseNewspaperCard from "./CourseNewspaperCard";

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

  const renderCard = (item: CourseShelfItem) => {
    if (item.artifactType === "magazine") {
      return <CourseMagazineCard key={item.id} item={item} />;
    }
    if (item.artifactType === "newspaper") {
      return <CourseNewspaperCard key={item.id} item={item} />;
    }
    return <CourseBookCard key={item.id} item={item} />;
  };

  return (
    <div className="bookshelf-container">
      {groups.map((group, rowIndex) => (
        <div key={`book-row-wrap-${rowIndex}`} className="shelf">
          <div className="books" key={`book-row-${rowIndex}`}>
            {group.map((item) => renderCard(item))}
            {Array.from({ length: CHUNK - group.length }).map((_, emptyIndex) => {
              const homePageData = getHomePageData();
              const emptyBookWidth = homePageData.style?.emptyBook?.coverWidth ?? 100;
              const emptyBookHeight = homePageData.style?.emptyBook?.coverHeight ?? 150;

              // Create a placeholder CourseShelfItem so it renders the same
              // way as other books (CourseBookCard handles placeholder styling).
              const placeholderItem = {
                id: `empty-${rowIndex}-${emptyIndex}`,
                title: homePageData.style?.emptyBook?.title ?? "Coming soon",
                description: "",
                color: "#f1f5f9",
                coverColorStart: homePageData.style?.emptyBook?.coverColorStart ?? "#f1f5f9",
                coverColorMiddle: homePageData.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9",
                coverColorEnd: homePageData.style?.emptyBook?.coverColorEnd ?? "#f1f5f9",
                coverWidth: emptyBookWidth,
                coverHeight: emptyBookHeight,
                icon: "",
                iconColorStart: "#fff",
                iconColorMiddle: "#fff",
                iconColorEnd: "#fff",
                meta: "",
                placeholder: true,
                category: row.title,
              } as any;

              return (
                <CourseBookCard key={`empty-${rowIndex}-${emptyIndex}`} item={placeholderItem} />
              );
            })}
          </div>
          <div className="shelf-board" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
