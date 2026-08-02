import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import AuthorShelfCard from "./AuthorShelfCard";
import CourseBookCard from "./CourseBookCard";
import CourseMagazineCard from "./CourseMagazineCard";
import CourseNewspaperCard from "./CourseNewspaperCard";
import { getHomePageData } from "../utils/contentStore";

interface AuthorShelfRowProps {
  row: CourseShelfRow;
  onItemClick?: (item: CourseShelfItem) => void;
}

function createAuthorPlaceholderItem(index: number): CourseShelfItem {
  const homePageData = getHomePageData();
  const emptyBookWidth = homePageData.style?.emptyBook?.coverWidth ?? 100;
  const emptyBookHeight = homePageData.style?.emptyBook?.coverHeight ?? 150;

  return {
    id: `author-empty-${index}`,
    title: homePageData.style?.emptyBook?.title ?? "Coming soon",
    description: "",
    color: "#f1f5f9",
    coverColorStart: homePageData.style?.emptyBook?.coverColorStart ?? "#f1f5f9",
    coverColorMiddle: homePageData.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9",
    coverColorEnd: homePageData.style?.emptyBook?.coverColorEnd ?? "#f1f5f9",
    coverWidth: emptyBookWidth,
    coverHeight: emptyBookHeight,
    icon: "👤",
    iconColorStart: "#fff",
    iconColorMiddle: "#fff",
    iconColorEnd: "#fff",
    meta: "Author",
    placeholder: true,
    category: "Author",
    actionType: "author",
    artifactType: "book",
  };
}

export default function AuthorShelfRow({ row, onItemClick }: AuthorShelfRowProps) {
  const BOOKS_PER_ROW = 3;
  const DEFAULT_SHELF_ROWS = 4;
  const minSlots = DEFAULT_SHELF_ROWS * BOOKS_PER_ROW;
  const displayItems: CourseShelfItem[] = [...row.items];

  while (displayItems.length < minSlots) {
    displayItems.push(createAuthorPlaceholderItem(displayItems.length));
  }

  const groups: CourseShelfItem[][] = [];
  const totalRows = Math.max(DEFAULT_SHELF_ROWS, Math.ceil(displayItems.length / BOOKS_PER_ROW));

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    groups.push(displayItems.slice(rowIndex * BOOKS_PER_ROW, rowIndex * BOOKS_PER_ROW + BOOKS_PER_ROW));
  }

  const renderCard = (item: CourseShelfItem) => {
    if (item.artifactType === "magazine") {
      return <CourseMagazineCard key={item.id} item={item} />;
    }
    if (item.artifactType === "newspaper") {
      return <CourseNewspaperCard key={item.id} item={item} />;
    }
    if (item.actionType === "author") {
      return <AuthorShelfCard key={item.id} item={item} onItemClick={onItemClick} />;
    }
    return <CourseBookCard key={item.id} item={item} onItemClick={onItemClick} />;
  };

  return (
    <div className="bookshelf-container">
      {groups.map((group, rowIndex) => (
        <div key={`author-row-wrap-${rowIndex}`} className="shelf">
          <div className="books author-browse-row" key={`author-row-${rowIndex}`}>
            {group.map((item) => renderCard(item))}
          </div>
          <div className="shelf-board author-shelf-board" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
