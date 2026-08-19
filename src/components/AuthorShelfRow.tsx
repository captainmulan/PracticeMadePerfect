import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import AuthorShelfCard from "./AuthorShelfCard";
import CourseBookCard from "./CourseBookCard";
import { getHomePageData } from "../utils/contentStore";
import { useShelfColumns } from "../hooks/useShelfColumns";

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
  const booksPerRow = useShelfColumns();
  const DEFAULT_SHELF_ROWS = 2;
  const minSlots = DEFAULT_SHELF_ROWS * booksPerRow;
  const displayItems: CourseShelfItem[] = [...row.items];

  while (displayItems.length < minSlots) {
    displayItems.push(createAuthorPlaceholderItem(displayItems.length));
  }

  const groups: CourseShelfItem[][] = [];
  const totalRows = Math.max(DEFAULT_SHELF_ROWS, Math.ceil(displayItems.length / booksPerRow));

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    groups.push(displayItems.slice(rowIndex * booksPerRow, rowIndex * booksPerRow + booksPerRow));
  }

  const renderCard = (item: CourseShelfItem) => {
    if (item.actionType === "author") {
      return <AuthorShelfCard key={item.id} item={item} onItemClick={onItemClick} />;
    }
    return <CourseBookCard key={item.id} item={item} useCoverImage onItemClick={onItemClick} />;
  };

  return (
    <div className="bookshelf-container" style={{ ["--shelf-cols" as string]: String(booksPerRow) }}>
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
