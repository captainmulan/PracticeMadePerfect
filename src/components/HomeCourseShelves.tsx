import { getHomePageData } from "../utils/contentStore";
import type { CourseShelfRow, CourseShelfItem } from "../utils/courseShelf";
import CourseBookCard from "./CourseBookCard";
import { useShelfColumns } from "../hooks/useShelfColumns";

interface HomeCourseShelvesProps {
  row: CourseShelfRow;
  /** Home_Test only: show admin/seed cover images on shelf cards. */
  useCoverImages?: boolean;
  onItemClick?: (item: CourseShelfItem) => void;
}

function createPlaceholderItem(category: string, index: number): CourseShelfItem {
  const homePageData = getHomePageData();
  const emptyBookWidth = homePageData.style?.emptyBook?.coverWidth ?? 100;
  const emptyBookHeight = homePageData.style?.emptyBook?.coverHeight ?? 150;
  const isAuthor = category === "Author";

  return {
    id: `empty-slot-${category}-${index}`,
    title: homePageData.style?.emptyBook?.title ?? "Coming soon",
    description: "",
    color: "#f1f5f9",
    coverColorStart: homePageData.style?.emptyBook?.coverColorStart ?? "#f1f5f9",
    coverColorMiddle: homePageData.style?.emptyBook?.coverColorMiddle ?? "#f1f5f9",
    coverColorEnd: homePageData.style?.emptyBook?.coverColorEnd ?? "#f1f5f9",
    coverWidth: emptyBookWidth,
    coverHeight: emptyBookHeight,
    icon: isAuthor ? "👤" : "",
    iconColorStart: "#fff",
    iconColorMiddle: "#fff",
    iconColorEnd: "#fff",
    meta: "",
    placeholder: true,
    category,
    actionType: isAuthor ? "author" : undefined,
  } as CourseShelfItem;
}

export default function HomeCourseShelves({ 
  row, 
  useCoverImages = false, 
  onItemClick 
}: HomeCourseShelvesProps) {
  const booksPerRow = useShelfColumns();
  const DEFAULT_SHELF_ROWS = 2;
  const minSlots = DEFAULT_SHELF_ROWS * booksPerRow;
  const displayItems: CourseShelfItem[] = [...row.items];
  
  const shouldPadPlaceholders =
    row.items.length > 0 &&
    !row.items.some(
      (item) => item.actionType === "category" || item.actionType === "language-sub" || item.actionType === "author",
    );

  if (shouldPadPlaceholders) {
    while (displayItems.length < minSlots) {
      displayItems.push(createPlaceholderItem(row.title, displayItems.length));
    }
  }

  const groups: CourseShelfItem[][] = [];
  const isFolderRow = row.items.some(
    (item) => item.actionType === "category" || item.actionType === "language-sub" || item.actionType === "author",
  );
  const totalRows =
    displayItems.length === 0
      ? 0
      : isFolderRow
        ? Math.max(1, Math.ceil(displayItems.length / booksPerRow))
        : Math.max(DEFAULT_SHELF_ROWS, Math.ceil(displayItems.length / booksPerRow));

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    groups.push(displayItems.slice(rowIndex * booksPerRow, rowIndex * booksPerRow + booksPerRow));
  }

  const renderCard = (item: CourseShelfItem) => {
    return <CourseBookCard key={item.id} item={item} useCoverImage={useCoverImages} onItemClick={onItemClick} />;
  };

  return (
    <div className="bookshelf-container" style={{ ["--shelf-cols" as string]: String(booksPerRow) }}>
      {groups.map((group, rowIndex) => (
        <div key={`book-row-wrap-${rowIndex}`} className="shelf">
          <div className="books" key={`book-row-${rowIndex}`}>
            {group.map((item) => renderCard(item))}
          </div>
          <div className="shelf-board" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
