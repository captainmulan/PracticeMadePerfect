import type { Course } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";
import HomeSpaceDecor from "./HomeSpaceDecor";
import { createShelfItemFromCourse } from "../utils/courseShelf";
import { normalizeBookCategory } from "../utils/bookCategories";
import { resolveBookCoverUrl } from "../utils/bookCoverSeeds";
import CourseBookCard from "./CourseBookCard";
import "../styles/course.css";

interface CourseAboutStepProps {
  course: Course;
  related: Course[];
  pageIndex: number;
  totalPages: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
}

export default function CourseAboutStep({
  course,
  related,
  pageIndex,
  totalPages,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = true,
}: CourseAboutStepProps) {
  const coverUrl = resolveBookCoverUrl(course);
  const pageCount = course.stepCount ?? course.chapters.reduce((sum, chapter) => sum + chapter.steps.length, 0);
  const relatedItems = related.slice(0, 12).map((item) => createShelfItemFromCourse(item, item.category));

  return (
    <PracticeWorkspace
      bookName={`${course.icon} ${course.title}`}
      chapterName="About"
      chapterNumber={0}
      pageType="About"
      pageIndex={pageIndex}
      totalPages={totalPages}
      title={course.title}
      description={course.description}
      onPrevious={onPrevious}
      onNext={onNext}
      canPrevious={canPrevious}
      canNext={canNext}
    >
      <div className="book-about">
        <HomeSpaceDecor />
        <div className="book-about-hero">
          {coverUrl ? (
            <img className="book-about-cover" src={coverUrl} alt="" />
          ) : (
            <div className="book-about-cover book-about-cover--fallback">{course.icon}</div>
          )}
          <dl className="book-about-meta">
            <div>
              <dt>Title</dt>
              <dd>{course.title || "Untitled"}</dd>
            </div>
            <div>
              <dt>Author</dt>
              <dd>{course.authorName?.trim() || "Unknown"}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{normalizeBookCategory(course.category) || "—"}</dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>{pageCount || "—"}</dd>
            </div>
          </dl>
        </div>
        {course.description?.trim() ? (
          <p className="book-about-blurb">{course.description}</p>
        ) : (
          <p className="book-about-blurb book-about-blurb--empty">No description yet.</p>
        )}
        {relatedItems.length > 0 ? (
          <section className="book-about-related">
            <h3>Related books</h3>
            <div className="book-about-related-scroller">
              {relatedItems.map((item) => (
                <div key={item.id} className="book-about-related-item">
                  <CourseBookCard item={item} useCoverImage />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PracticeWorkspace>
  );
}
