import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Course } from "../data/courses";
import HomeSpaceDecor from "./HomeSpaceDecor";
import { createShelfItemFromCourse } from "../utils/courseShelf";
import { formatCategoryPath } from "../utils/bookCategories";
import { resolveBookCoverUrl } from "../utils/bookCoverSeeds";
import CourseBookCard from "./CourseBookCard";
import "../styles/course.css";

interface CourseAboutStepProps {
  course: Course;
  related: Course[];
  onRead?: () => void;
}

export default function CourseAboutStep({
  course,
  related,
  onRead,
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
                <dd>{formatCategoryPath(course)}</dd>
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
          <div className="book-about-actions">
            <Link to="/" className="book-about-action">
              Home
            </Link>
            <button type="button" className="book-about-action book-about-action--primary" onClick={onRead}>
              Read
            </button>
          </div>
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
