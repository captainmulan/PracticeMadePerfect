import type { Course, CourseStep } from "../data/courses";
import { extractBookHtmlIframeSrc, resolveBookHtmlFolder } from "./htmlStepContent";
import { getPopularCourses } from "./courseShelf";
import { resolveBookCoverUrl } from "./bookCoverSeeds";

export interface ShowcaseSelection {
  course: Course;
  step: CourseStep;
}

export interface ShowcaseExcerpt {
  bookTitle: string;
  chapterTitle: string;
  pageTitle: string;
  /** Image from the featured chapter page (legacy / fallback). */
  heroImageUrl: string | null;
  /** Book cover — fills the left open page. */
  coverImageUrl: string | null;
  /** Random related chapter page image — fills the right open page. */
  previewImageUrl: string | null;
  previewPageTitle: string;
  pageEmoji: string | null;
  excerpt: string;
  artifactType: Course["artifactType"];
  coverColorStart: string;
  coverColorMiddle: string;
  coverColorEnd: string;
  icon: string;
}

const PAGE_BLOCKLIST =
  /quiz|activity|character[- ]selection|overall[- ]quiz|overview\.html$|intro[- ]?build|village\.html|index\.html|character[- ]select|big-game|stamp-row|allplanets|all-planets|defender|globerush|mapexplorer|continent[- ]trek|eco[- ]?garden|ecoplanetrush/i;

const TITLE_BLOCKLIST =
  /quiz|activity|character selection|overall quiz|book briefing|build myanmar village|intro build|index|let'?s play|character select|all planets|order the planets/i;

export function isShowcaseEligibleStep(step: CourseStep): boolean {
  if (step.stepType !== "html") {
    return false;
  }

  const title = step.title.toLowerCase();
  if (TITLE_BLOCKLIST.test(title)) {
    return false;
  }

  const iframeSrc = step.contentHtml ? extractBookHtmlIframeSrc(step.contentHtml) : null;
  if (iframeSrc && PAGE_BLOCKLIST.test(iframeSrc)) {
    return false;
  }

  return true;
}

function stepShowcaseWeight(step: CourseStep): number {
  const title = step.title.toLowerCase();
  const iframeSrc = (step.contentHtml ? extractBookHtmlIframeSrc(step.contentHtml) : "") ?? "";
  let weight = 1;
  if (/explained/i.test(title) || /explained/i.test(iframeSrc)) {
    weight += 4;
  }
  if (/story|chapter|zone|family|animal|color|feeling|ocean|planet/i.test(title)) {
    weight += 2;
  }
  if (/game|play|maze|whack|stamp/i.test(title)) {
    weight -= 3;
  }
  return Math.max(weight, 0.1);
}

export function getShowcaseEligibleSteps(course: Course): CourseStep[] {
  return course.chapters
    .flatMap((chapter) => chapter.steps)
    .filter(isShowcaseEligibleStep)
    .sort((a, b) => a.stepIndex - b.stepIndex);
}

/** Weighted random among eligible steps (prefers Explained / story pages). */
export function pickRandomEligibleStep(course: Course): CourseStep | null {
  return pickWeightedStep(getShowcaseEligibleSteps(course));
}

export function isRichShowcaseExcerpt(excerpt: ShowcaseExcerpt): boolean {
  if (excerpt.coverImageUrl || excerpt.previewImageUrl || excerpt.heroImageUrl) {
    return true;
  }
  return excerpt.excerpt.trim().length >= 80;
}

/** Prefer stopping when the right page has enough copy to fill (image optional). */
export function isFilledShowcaseExcerpt(excerpt: ShowcaseExcerpt): boolean {
  const pageArt = Boolean(excerpt.previewImageUrl);
  const textLen = excerpt.excerpt.trim().length;
  if (pageArt && textLen >= 80) {
    return true;
  }
  return textLen >= 200;
}

function urlsLookSame(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  const norm = (u: string) => u.trim().split("?")[0].replace(/\/+$/, "").toLowerCase();
  return norm(a) === norm(b);
}

function pickWeightedStep(steps: CourseStep[]): CourseStep | null {
  if (steps.length === 0) {
    return null;
  }
  const weights = steps.map(stepShowcaseWeight);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < steps.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return steps[i];
    }
  }
  return steps[steps.length - 1];
}

/** Pick a different eligible step in the same book for the right-page preview. */
export function pickRelatedPreviewStep(
  course: Course,
  primaryStep: CourseStep,
): CourseStep | null {
  const eligible = getShowcaseEligibleSteps(course).filter((step) => step.id !== primaryStep.id);
  if (eligible.length === 0) {
    return null;
  }

  const sameChapter = eligible.filter(
    (step) =>
      (step.chapterTitle || "") !== "" &&
      (step.chapterTitle || "") === (primaryStep.chapterTitle || ""),
  );
  const explainedSame = sameChapter.filter((step) => {
    const title = step.title.toLowerCase();
    const src = (step.contentHtml ? extractBookHtmlIframeSrc(step.contentHtml) : "") ?? "";
    return /explained/i.test(title) || /explained/i.test(src);
  });
  if (explainedSame.length > 0) {
    return pickWeightedStep(explainedSame);
  }

  const explainedAny = eligible.filter((step) => {
    const title = step.title.toLowerCase();
    const src = (step.contentHtml ? extractBookHtmlIframeSrc(step.contentHtml) : "") ?? "";
    return /explained/i.test(title) || /explained/i.test(src);
  });
  if (explainedAny.length > 0 && Math.random() < 0.75) {
    return pickWeightedStep(explainedAny);
  }

  return pickWeightedStep(sameChapter.length > 0 ? sameChapter : eligible);
}

/** Catalog summaries have empty chapters — pick a course id first, then load outline. */
export function getShowcaseCoursePool(courses: Course[]): Course[] {
  const popular = getPopularCourses(courses);
  return (popular.length > 0 ? popular : courses).slice();
}

export function shuffleCourses(courses: Course[]): Course[] {
  return courses.slice().sort(() => Math.random() - 0.5);
}

/** Prefer when chapters/steps are already loaded (e.g. after outline fetch). */
export function pickRandomShowcaseSelection(courses: Course[]): ShowcaseSelection | null {
  const pool = shuffleCourses(getShowcaseCoursePool(courses));
  for (const course of pool) {
    const step = pickRandomEligibleStep(course);
    if (step) {
      return { course, step };
    }
  }
  return null;
}

function resolveAssetUrl(src: string, bookHtmlFolder: string | null): string {
  const trimmed = src.trim();
  if (!trimmed) {
    return "";
  }
  if (/^(https?:|\/|data:)/i.test(trimmed)) {
    return trimmed;
  }
  if (bookHtmlFolder) {
    return `/book_html/${bookHtmlFolder}/${trimmed.replace(/^\.\//, "")}`;
  }
  return trimmed;
}

async function loadStepPageHtml(step: CourseStep, bookHtmlFolder: string | null): Promise<string> {
  const contentHtml = step.contentHtml ?? "";
  const iframeSrc = extractBookHtmlIframeSrc(contentHtml);
  if (iframeSrc) {
    const response = await fetch(iframeSrc);
    if (!response.ok) {
      throw new Error(`Failed to load page preview (${response.status})`);
    }
    return response.text();
  }
  return contentHtml;
}

export function parseShowcaseExcerptFromHtml(
  html: string,
  course: Course,
  step: CourseStep,
  bookHtmlFolder: string | null,
): ShowcaseExcerpt {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const pageTitle =
    doc.querySelector("h1")?.textContent?.trim() ||
    step.title ||
    course.title;

  const imgEl =
    doc.querySelector(".chapter-hero-img") ||
    doc.querySelector(".chapter-photo-hero img") ||
    doc.querySelector(".scene-card img") ||
    doc.querySelector(".hero-art img") ||
    doc.querySelector(".story-art img") ||
    doc.querySelector(".planet-img") ||
    doc.querySelector(".word-card img") ||
    doc.querySelector('img[src*="assets/"]') ||
    doc.querySelector('img[src*="planets/"]') ||
    doc.querySelector("img[src]");

  let heroImageUrl: string | null = null;
  const imgSrc = imgEl?.getAttribute("src");
  if (imgSrc) {
    heroImageUrl = resolveAssetUrl(imgSrc, bookHtmlFolder);
  } else {
    const assetMatch = html.match(
      /src=["']((?:assets\/|planets\/|\.?\.\/)?[^"']+\.(?:png|jpg|jpeg|webp|gif))["']/i,
    );
    if (assetMatch) {
      heroImageUrl = resolveAssetUrl(assetMatch[1], bookHtmlFolder);
    }
  }

  const paragraphs = Array.from(
    doc.querySelectorAll(
      ".story-box p, .explain-box p, .card p, .fact-card p, .fact-box p, .info-panel p, .game-desc, article p, .content p, .card li, p",
    ),
  )
    .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 24)
    .filter((text, index, arr) => arr.indexOf(text) === index);

  let rawExcerpt = paragraphs.slice(0, 8).join(" ");
  if (rawExcerpt.length < 80) {
    const textSource =
      doc.querySelector(".story-box.story-box-default") ||
      doc.querySelector(".story-box") ||
      doc.querySelector(".explain-box") ||
      doc.querySelector(".card") ||
      doc.querySelector("article") ||
      doc.querySelector(".info-panel") ||
      doc.querySelector("p");
    rawExcerpt = textSource?.textContent?.replace(/\s+/g, " ").trim()
      || step.description
      || course.description
      || "";
  }
  const excerpt = rawExcerpt.length > 680 ? `${rawExcerpt.slice(0, 677).trim()}…` : rawExcerpt;

  const logoText = doc.querySelector(".logo")?.textContent?.trim() ?? "";
  const pageEmojiMatch = logoText.match(/\p{Extended_Pictographic}/u);
  const pageEmoji = pageEmojiMatch?.[0] ?? null;

  return {
    bookTitle: course.title,
    chapterTitle: step.chapterTitle || "Chapter",
    pageTitle,
    heroImageUrl,
    coverImageUrl: resolveBookCoverUrl(course) ?? null,
    previewImageUrl: null,
    previewPageTitle: pageTitle,
    pageEmoji,
    excerpt: excerpt || "Open this book to explore more pages.",
    artifactType: course.artifactType ?? "book",
    coverColorStart: course.coverColorStart ?? course.color,
    coverColorMiddle: course.coverColorMiddle ?? course.color,
    coverColorEnd: course.coverColorEnd ?? course.color,
    icon: course.icon,
  };
}

export async function buildShowcaseExcerpt(
  course: Course,
  step: CourseStep,
  relatedStep?: CourseStep | null,
): Promise<ShowcaseExcerpt> {
  const bookHtmlFolder = resolveBookHtmlFolder({
    bookHtmlFolder: course.bookHtmlFolder,
    courseId: course.id,
    contentHtml: step.contentHtml,
  });

  let excerpt: ShowcaseExcerpt;
  try {
    const html = await loadStepPageHtml(step, bookHtmlFolder);
    excerpt = parseShowcaseExcerptFromHtml(html, course, step, bookHtmlFolder);
  } catch {
    excerpt = parseShowcaseExcerptFromHtml("", course, step, bookHtmlFolder);
  }

  const previewSource = relatedStep ?? null;
  if (previewSource) {
    const previewFolder = resolveBookHtmlFolder({
      bookHtmlFolder: course.bookHtmlFolder,
      courseId: course.id,
      contentHtml: previewSource.contentHtml,
    });
    try {
      const previewHtml = await loadStepPageHtml(previewSource, previewFolder);
      const preview = parseShowcaseExcerptFromHtml(previewHtml, course, previewSource, previewFolder);
      const usePreviewCopy =
        preview.excerpt.trim().length >= Math.max(excerpt.excerpt.trim().length, 80);
      /* Page-only art for the right side — never the book cover */
      let pageArt = preview.heroImageUrl;
      if (urlsLookSame(pageArt, excerpt.coverImageUrl)) {
        pageArt = null;
      }
      excerpt = {
        ...excerpt,
        previewImageUrl: pageArt,
        previewPageTitle: usePreviewCopy ? preview.pageTitle : excerpt.previewPageTitle,
        excerpt: usePreviewCopy ? preview.excerpt : excerpt.excerpt,
        pageTitle: usePreviewCopy ? preview.pageTitle : excerpt.pageTitle,
        chapterTitle: preview.chapterTitle || excerpt.chapterTitle,
        heroImageUrl: pageArt ?? excerpt.heroImageUrl,
      };
    } catch {
      /* keep primary excerpt */
    }
  }

  /* Right page: only in-page images — never fall back to cover */
  let pageArt = excerpt.previewImageUrl || excerpt.heroImageUrl;
  if (urlsLookSame(pageArt, excerpt.coverImageUrl)) {
    pageArt = null;
  }
  excerpt.previewImageUrl = pageArt;

  return excerpt;
}
