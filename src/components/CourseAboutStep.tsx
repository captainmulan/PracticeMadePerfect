import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import HomeSpaceDecor from "./HomeSpaceDecor";
import { createShelfItemFromCourse } from "../utils/courseShelf";
import { formatCategoryPath } from "../utils/bookCategories";
import { canonicalAuthorName } from "../utils/authorName";
import { resolveBookCoverUrl } from "../utils/bookCoverSeeds";
import CourseBookCard from "./CourseBookCard";
import PdfFunLoader from "./PdfFunLoader";
import "../styles/course.css";

interface CourseAboutStepProps {
  course: Course;
  related: Course[];
  bookType: "PDF" | "EPUB";
  onRead?: () => void;
  pdfLoading?: boolean;
  readDisabled?: boolean;
}

export default function CourseAboutStep({
  course,
  related,
  bookType,
  onRead,
  pdfLoading = false,
  readDisabled = false,
}: CourseAboutStepProps) {
  const fullCoverUrl = resolveBookCoverUrl(course, { variant: "full" });
  const thumbCoverUrl = resolveBookCoverUrl(course, { variant: "thumb" });
  const [coverUrl, setCoverUrl] = useState(fullCoverUrl || thumbCoverUrl);

  useEffect(() => {
    setCoverUrl(fullCoverUrl || thumbCoverUrl);
  }, [fullCoverUrl, thumbCoverUrl]);
  const pageCount = course.stepCount ?? course.chapters.reduce((sum, chapter) => sum + chapter.steps.length, 0);
  const relatedItems = related.slice(0, 12).map((item) => createShelfItemFromCourse(item, item.category));

  return (
    <div className="book-about-page">
      <div className="book-about">
        <HomeSpaceDecor />
        <div className="book-about-inner">
          <div className="book-about-hero">
            <div className="book-about-cover-wrap">
              {coverUrl ? (
                <img
                  className="book-about-cover"
                  src={coverUrl}
                  alt=""
                  onError={() => {
                    if (thumbCoverUrl && coverUrl !== thumbCoverUrl) {
                      setCoverUrl(thumbCoverUrl);
                    }
                  }}
                />
              ) : (
                <div className="book-about-cover book-about-cover--fallback">{course.icon}</div>
              )}
              <div className="book-spine" aria-hidden="true" />
            </div>
            <div className="book-about-meta">
              <h1 className="book-about-title">{course.title || "Untitled"}</h1>
              <p className="book-about-author">{canonicalAuthorName(course.authorName)}</p>
              <div className="book-about-tags">
                <span className="book-about-tag book-about-tag--category">{formatCategoryPath(course)}</span>
                <span className="book-about-tag">{pageCount || "—"} pages</span>
              </div>
              <div className="book-about-tags book-about-tags--format">
                <span className="book-about-tag book-about-tag--language">
                  {course.language === "MM" ? "Myanmar" : "English"}
                </span>
                <span className={`book-about-tag book-about-tag--${bookType.toLowerCase()}`}>{bookType}</span>
              </div>
              <button
                type="button"
                className="book-about-action book-about-read"
                onClick={onRead}
                disabled={readDisabled}
              >
                Read
              </button>
            </div>
          </div>
          <section className="book-about-description-panel" aria-label="Book description">
            {course.description?.trim() ? (
              <p className="book-about-blurb">{course.description}</p>
            ) : (
              <p className="book-about-blurb book-about-blurb--empty">No description yet.</p>
            )}
          </section>
          {pdfLoading ? (
            <PdfFunLoader compact label="Getting your book ready…" />
          ) : null}
        </div>
        {relatedItems.length > 0 ? (
          <section className="book-about-related">
            <h3>Related books</h3>
            <div className="book-about-related-scroller">
              {relatedItems.map((item) => (
                <div key={item.id} className="book-about-related-item">
                  <CourseBookCard item={item} useCoverImage hideTitleRibbon />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
