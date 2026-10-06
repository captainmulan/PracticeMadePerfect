# Magic Library (မှော်ဝင် စာကြည့်တိုက်)

Magic Library is a place to discover knowledge in many forms—not just books.

Every shelf contains a different kind of adventure:
- 📖 Read a story
- 💻 Learn programming
- 🌍 Study a language
- 🙏 Explore religion
- 📰 Catch up on today's news
- 🎮 Play educational games

That keeps the name Magic Library meaningful while giving you the freedom to expand far beyond traditional books.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

3. Open the app at: `http://localhost:4173`

## Deploy

Use this command for future app deployments so the repo's current database and bundled app data are copied into the Firebase hosting folder first:

```bash
npm run deploy:firebase
```

The live Firebase sites are:

- App: `magiclibrary-92246` (`https://magiclibrary-92246.web.app`)
- Legacy Other books host: `magiclibrary-143b7` (`https://magiclibrary-143b7.web.app`)
- Comic books: `magiclibrary-d9921` (`https://magiclibrary-d9921.web.app`)

Deploy individually with:

```bash
npm run deploy:app
npm run deploy:other
npm run deploy:comic
```

`npm run deploy:other` and the Other target in `npm run deploy:all` are legacy Firebase deployments. The active Other book host is Cloudflare Pages; use `npm run deploy:cloudflare:other` to update it.

`npm run deploy:app` deploys the app without the `book_html` folder. Use
`npm run deploy:firebase` when the app deployment should include all built files.

Or deploy all three sites:

```bash
npm run deploy:all
```

### Deploy Other books to Cloudflare Pages

The `magiclibrary` Pages project is reserved for the static files under `book_html/Other` only. It does not deploy the React app, Comic books, or any other folder. First authenticate Wrangler with the new Cloudflare account and create the Pages project once:

```bash
pnpm dlx wrangler@latest login
pnpm dlx wrangler@latest pages project create magiclibrary --production-branch main --force
```

Then deploy the Other books:

```bash
npm run deploy:cloudflare:other
```

The deploy script checks the Pages per-file and project file-count limits, confirms the active Wrangler account, and applies temporary CORS/cache headers during upload without changing `book_html/Other`. The project is live at `https://magiclibrary-daw.pages.dev`.

The app's `Other` asset route now points to this Pages host, while `Comic` remains on Firebase. Deploy the app separately with `npm run deploy:app` for the live app to start using the new `Other` host; the static-file deploy command above never deploys the app.

### Deploy Comic books to Cloudflare Pages

The `deploy:cloudflare:comic` target deploys only `book_html/Comic` to the separate Pages project `magiclibrary-comic`. Sign in with the intended Cloudflare account and create the project once:

```bash
pnpm dlx wrangler@latest login
pnpm dlx wrangler@latest pages project create magiclibrary-comic --production-branch main --force
```

Then deploy the Comic files:

```bash
pnpm run deploy:cloudflare:comic
```

The deploy script confirms the active Wrangler account, requires confirmation, checks the Pages file-count and per-file size limits, and applies temporary CORS/cache headers. It does not build or deploy the app or any other book folder. After the first successful deployment, update the app's Comic asset host separately before deploying the app.

Comic PDFs at or above the Pages 25 MiB asset limit can be split and their admin page URLs remapped with:

```bash
pnpm run split:comic-pdfs
pnpm run sync-deploy-assets
node scripts/generate-course-details.cjs
```

The script writes numbered PDF parts into each Comic book folder, updates `deploy/indexeddb-export.json`, and moves the original PDFs to `comic-source-pdfs/` outside the deploy tree. The sync and detail-generation commands refresh the admin/public export, course details, and home catalog. App startup also has a versioned IndexedDB migration (`pmp-split-book-assets-v6`) that updates cached records for the affected Comic books. Comic hosting remains configured separately from the Other Pages project.

The book deployments use only these built directories:

- Other: `dist/book_html/Other`
- Comic: `dist/book_html/Comic`

### Book Traffic and Hosting Quota Discussion

Discussion handoff for planning additional promotion (no analytics or caching code changes made):

- The Cloudflare Pages app is separate from the book-file hosts. The current Other host is `magiclibrary-daw.pages.dev`; Comic assets remain on `magiclibrary-d9921.web.app`. The Firebase quota figures below are a historical snapshot from before the Other-host migration. Cloudflare app request totals do not include separate book-file host requests.
- Firebase Console usage screenshot for project `magiclibrary-143b7` (October 2026) showed Spark Hosting downloads at 1.8 GB of the 10 GB monthly limit (17.6%), and stored files at 1.7 GB of the 10 GB storage limit (17.3%). Recheck the live quota before a campaign; these are a point-in-time snapshot.
- The Vibe EPUB observed in DevTools was 72,515,758 bytes (about 72.5 MB decimal). At one full download per new visitor, 100 visitors would transfer about 7.25 GB, before repeat visits, caching, or other books. This can consume most of the remaining monthly download quota, so larger IT-group promotion should be staged and monitored.
- The active EPUB reader now loads through `getEpubBuffer()` in `src/utils/epubCache.ts`; the PDF course reader now loads through `getPdfBuffer()` in `src/utils/pdfCache.ts` and transfers the buffer to its viewer iframe. Both use in-memory and IndexedDB caches with a 24-hour TTL and retain at most the 2 most recently downloaded files per media type. IndexedDB read/write failures are non-fatal; PDF fetch failures fall back to a URL load, while EPUB fetch failures show the reader error. This can avoid repeat file transfers on the same browser/device, but every new visitor still needs the initial full download. Browser storage can also be evicted by the browser or user.
- Firebase Hosting responses observed in DevTools include `Cache-Control: public, max-age=86400, must-revalidate`. Browser HTTP caching may avoid some repeat transfers on the same device/browser during that period, but it is not a shared cache across visitors and should not be used to budget first visits. Verify response headers for each asset host and file type.
- There is no current centralized `book_open` analytics event. Cloudflare’s account-level request graph is aggregate traffic, not distinct app users or a ranking of books opened. Decide whether to add privacy-conscious book-open analytics before claiming per-book popularity.
- Hosting requirement: prefer a predictable $0/month solution and preserve reading quality. Other books are now on the separate Cloudflare Pages project `magiclibrary`; Comic books remain on Firebase. Pages does not list a monthly bandwidth allowance in its Free limits documentation, but each deployed asset must be below 25 MiB and each Free project supports up to 20,000 files. A second account does not increase either per-project limit.
- The former `pmp-book-assets` split-EPUB pilot and its `Book_html_cloudflare/Other/vibe-book-final/cloudflare-pages/` packages are historical and are not the active Other host. The active full Other deployment is `book_html/Other` to `magiclibrary-daw.pages.dev`; do not use the old `pmp-book-assets.pages.dev` URLs for new book mappings.
- Existing-book Manual Update > Pages has a page-range URL mapper for books that use split-file URLs. EPUB mappings retain each original page location; PDF mappings calculate the page number within each segment. The mapper updates metadata only; it does not create or deploy part files.
- Split files are stored directly in each book folder (for example, `book_html/Other/elon-musk/part-01.pdf`); course metadata uses `/book_html/Other/<book>/part-01.pdf` or `.epub`, without a `parts/` subfolder. The oversized originals present during the Other-books split were removed after checking their replacements. No PDF or EPUB over 25 MiB remains in `book_html/Other`.
- Existing browser profiles have separate IndexedDB databases. On the first course-database initialization after loading the updated app, a versioned migration updates the 23 split books' direct-root asset URLs and EPUB/PDF types by page index while preserving local book fields and unrelated records. The migration is scoped to the current browser profile.
- Manual Update > General has **Map split PDF/EPUB parts** for applying multiple segment URLs in one operation. Enter each generated part's inclusive original page range and URL. PDF page numbers are translated to each segment; EPUB `#page-*.xhtml` locations are retained. The mapper rejects overlapping or uncovered ranges. Click **Save Book** afterward. This control updates metadata; it does not create the part files.
- Splitting does not reduce total bytes if a reader downloads every segment, but it allows smaller initial downloads when only one range is opened. It also adds manual mapping and deployment steps; test page turns at each range boundary before moving more books.
- Cloudflare R2 remains an alternative if splitting and maintaining multiple page mappings proves too cumbersome. Its Standard free tier includes 10 GB-month storage, 1 million Class A operations, 10 million Class B operations, and free egress, but usage beyond the free allowances is billable, so it is not a hard $0 cap.
- At a target of 200 monthly visitors, 200 full downloads of the 72.5 MB EPUB would transfer about 14.5 GB. With 1.8 GB already used in the screenshot, approximately 8.2 GB remained that month, equal to about 113 such full downloads before other files. Visitor count alone does not equal book downloads; measure opened books and actual transfer before deciding whether the Spark quota is sufficient.
- Continue monitoring Firebase usage for the remaining Firebase-hosted sites; optional lossless optimization of oversized embedded images may reduce transfers, but do not reduce reading quality just to fit a quota. Do not rely on browser or CDN caching as a guarantee for first-time readers.

Questions for the follow-up discussion:

1. Estimate downloads per EPUB/PDF from Firebase Hosting request logs or exported usage data, and determine whether per-file URL rankings are available on the current plan.
2. Decide whether to add a `book_open` event keyed by course ID/category to measure reader interest independently of file-host requests.
3. Verify cross-origin fetches and page turns against the deployed Other host, especially at pages 107/108 and 156/157. Do not treat Pages bandwidth as an unconditional guarantee or R2's free tier as a hard spending cap.

Firebase Hosting deployments are versioned and atomic. A successful new deploy becomes the complete live file set for that site; files from the previous release that are not in the new directory are no longer served. There is no separate “delete all files” step, and disabling the site first would only create unnecessary downtime.

For a direct deploy from CMD or PowerShell:

```bash
firebase deploy --config firebase-comic.json --project magiclibrary-d9921
firebase deploy --config firebase-other.json --project magiclibrary-143b7
```

Run `npm run build` and `npm run sync-deploy-assets` first when using those direct commands. The `npm run deploy:comic` and `npm run deploy:other` scripts already do that preparation automatically.

### Deploying custom theme / admin settings

Custom theme and admin settings are stored locally in the browser, so they do not automatically become part of the deployed site.

To deploy your local theme and admin data:

1. Open `http://localhost:4173/admin`
2. Click the new `Export` button
3. Save the downloaded `admin.json`
4. Place that file at `deploy/admin.json`
5. Run:

```bash
npm run deploy:firebase
```

If `deploy/admin.json` is present, the deployment will inject the theme/settings into the production site.

## Features

- **Interactive E-Books:** Browse and read courses organized as book shelves
- **Multiple Content Types:**
  - **HTML Lessons:** Rich formatted content for chapters (CMS-enabled)
  - **Quizzes:** Multi-choice questions to test understanding
  - **Code Exams:** Write and verify code solutions with syntax checking
- **Admin Controls:**
  - Home page theme customization (gradients, colors, fonts)
  - Book builder: Create and edit courses/chapters
  - Database recovery: One-click restore to bundled defaults (requires password)
- **Persistent Storage:** Browser SQLite for courses, chapters, and user progress
- **Responsive Design:** Mobile-first UI with collapsible navigation and full-screen editor
- **Bundled Defaults:** Ships with sample courses and chapters

## CMS: HTML Chapter Rendering

Chapters are rendered as HTML without requiring code rebuilds. The content is stored in the `contentHtml` field of each `CourseStep`.

**How to edit chapter content:**
1. Go to `/admin` → **Book Builder** tab
2. Select a book and chapter
3. Edit the chapter HTML in the admin panel
4. Changes are saved to browser SQLite instantly
5. Visit `/course/:courseId` to see the updated chapter

**Example chapter structure:**
```ts
{
  id: "intro-step-1",
  stepType: "html",
  title: "Introduction",
  contentHtml: "<h2>Welcome!</h2><p>Start your journey...</p>",
  description: "Learn the basics"
}
```

This enables non-developers to update course content by editing data files without touching React code.

## Backend Data Sync Workflow

For courses with many HTML files (like Little Programmer), use this workflow to sync from local HTML files to the production database:

**Step 1: Create/Edit HTML Files**
- Create or edit HTML files in `book_html/[CourseName]/` (e.g., `book_html/LittleProgrammer/`)
- These files serve as your source of truth for content

**Step 2: Update IndexedDB Export**
- The IndexedDB export file is located at `deploy/indexeddb-export.json`
- This file contains all course data including HTML content
- Update the `contentHtml` field for each step with the latest HTML file content
- Ensure course IDs match between the export and the TypeScript definitions (e.g., `little-programmer`)

**Step 3: Sync to Public/Directories**
```bash
npm run sync-deploy-assets
```
This copies the updated export to:
- `public/data/indexeddb-export.json` (for dev server)
- `dist/data/indexeddb-export.json` (for production build)

Production startup now uses `home-catalog.json`, `tasks.json`, and `announcements.json`.
Full course content is generated into `data/course-details/<course-id>.json` and fetched
only when a course is opened, then cached in IndexedDB. The full export remains as a
legacy/admin fallback and is not part of normal catalog startup.

**Step 4: Clear Browser IndexedDB**
Since the app loads from IndexedDB, you must clear the old data:
- Open DevTools (F12) → Application tab → IndexedDB
- Delete the `magic-library-db` database
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

The app will now load the updated course data from `indexeddb-export.json`.

**Step 5: Deploy (if needed)**
```bash
npm run deploy:firebase
```

This builds the app, syncs the database, and deploys to Firebase.

## Standalone raw HTML lessons

Some lessons are shipped as self-contained HTML files so they can be viewed directly in the browser or embedded inside the app workspace.

Recommended workflow:
1. Create or edit the lesson in the public copy, for example [public/move-bunny-demo-responsive.html](public/move-bunny-demo-responsive.html).
2. Keep the lesson self-contained with its own HTML, CSS, and JavaScript so it can run independently.
3. If the lesson should also appear in the book/offline version, mirror the same file into the matching book folder, such as [book_html/kid-programming-for-age-7-10/move-bunny-demo-responsive.html](book_html/kid-programming-for-age-7-10/move-bunny-demo-responsive.html).
4. Verify the lesson both as a direct HTML page and inside the app course viewer, especially for interactive demos that rely on scripts.

Project context:
- Raw HTML lessons are rendered inside an iframe in the app so embedded scripts can run correctly.
- This was needed because simple inline injection did not execute lesson JavaScript reliably in the workspace view.
- When changing a lesson, keep the public version and the book copy aligned so the experience stays consistent.
- Important: the app expects exact folder names from `contentHtml` iframe paths. If you upload a renamed book folder, create a matching path or redirect stubs so the old iframe path still resolves.
- Important: do not leave stale `00x-*.html` files behind in a book folder, because duplicate chapter prefixes can break ordering and load behavior.

## Interactive kids' books (`book_html/`)

Age 7–8 ebooks (Solar System, Ocean Adventure, etc.) live in [book_html/](book_html/). Each book is a folder of **numbered standalone HTML chapters** loaded in order by filename (`001`, `002`, …).

**Standard flow for every new book:**

1. `001-Book-Briefing.html` — about the book, author **Jimmy Cooper**, author speech  
2. `002-Index.html` — table of contents  
3. `003-Character-Selection.html` — name + avatar  
4. `004-Intro-*.html` — intro arcade game  
5. Repeat per topic: **Activity (mini game) → Explained → Quiz**  
6. Conclusion → Overall quiz → Outro game → Congratulations  

**Reference:** [book_html/README.md](book_html/README.md) (master template) · [book_html/SolarSystem/README.md](book_html/SolarSystem/README.md) (43 chapters) · [book_html/OceanAdventure/README.md](book_html/OceanAdventure/README.md) (32 chapters)

After editing book HTML, sync into `deploy/indexeddb-export.json` and re-import in admin if the reader loads from the database.

## Mobile-First HTML Lesson Design

HTML lesson files are designed with mobile-first principles to ensure optimal viewing across all devices:

**Responsive Layout:**
- Use `viewport` meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Container max-width constraints (typically 600-620px) with auto margins for centering
- Flexible padding that adjusts based on screen size
- Use `clamp()` for responsive font sizes that scale smoothly

**Touch-Friendly Design:**
- Button sizes minimum 44x44px for easy tapping
- Generous spacing between interactive elements
- Touch targets with adequate padding and visual feedback
- Support both tap and keyboard interactions

**Compact Content:**
- Reduced padding and margins on mobile to minimize scrolling
- Smaller font sizes and spacing on smaller screens
- Condensed layouts that fit within viewport height when possible
- Prioritize essential content visibility above the fold

**CSS Techniques:**
- Use relative units (%, rem, vw) instead of fixed pixels where appropriate
- Flexbox and grid for adaptive layouts
- Media queries for device-specific adjustments
- `aspect-ratio` for maintaining proportions across screen sizes

**Example Mobile Optimization:**
```css
.container {
  max-width: 620px;
  margin: auto;
  padding: 12px; /* Reduced from 24px for mobile */
}

.chapter-title {
  font-size: clamp(16px, 4vw, 22px); /* Responsive font size */
}

.button {
  min-width: 50px; /* Touch-friendly minimum */
  padding: 12px;
}
```

## Quiz UI/UX Design
The quiz end screen has been updated to provide a clean, engaging experience:

**Key Features:**
- **Competition Bar:** 1 vs 1 score display for player vs computer opponent
- **Score Card:** Prominent score display with dark background for contrast
- **Podium Display:** First and second place with distinct gold/silver gradients
- **Responsive Design:** Mobile-first with media queries for small screens
- **High Visibility:** No yellow-on-yellow text, all elements have strong contrast
- **No Overlaps:** Careful margin/padding to ensure all elements are visible

**Color Palette:**
- Score card: Gold-orange gradient background (#ffd700 → #ffa500)
- Score display: Dark purple gradient (#1a1240 → #3a2f70)
- First place: Dark gold (#b8860b → #8b6914)
- Second place: Silver (#c0c0c0 → #a0a0a0)
- Text colors: White on dark backgrounds, dark on light backgrounds


## Admin Features

### Home Page Customization
- Gradient colors for hero section, buttons, and bookshelves
- Typography: font sizes, weights, colors
- All changes saved to browser localStorage

### Book Builder
- Create new courses with custom colors and icons
- Add chapters with HTML content, quizzes, or code exams
- Edit chapter titles, descriptions, and content
- Delete courses (with confirmation to prevent accidents)

### Database Recovery
- **Restore Bundled Database:** One-click recovery to default courses (requires `admin123` password)
- Automatically re-seeds missing built-in books
- Useful after accidental deletions or to start fresh

## Project History

- Started as a SQLite-based offline learning platform.
- Migrated to IndexedDB for a fully browser-based database.
- Added automatic one-time migration from legacy SQLite to IndexedDB.
- Implemented JSON export/import (`indexeddb-export.json`) for backup and deployment.
- Firebase deployment now automatically syncs the latest exported database.
- Built a CMS for creating books, chapters, quizzes, HTML pages and interactive courses.
- Added Presentation Site for learners and separate Admin UI for content management.
- Introduced bookshelf UI with customizable book covers and responsive mobile layout.
- Added HTML-based interactive books, including **Little Programmer**, **JS Programmer**, **IT Newspaper**, Interview books, Fiction and Myanmar learning books.
- Continually improved mobile UX, offline support, deployment workflow and content authoring.
