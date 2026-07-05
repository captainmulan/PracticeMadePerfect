# Magic Library (မှော်ဝင် စာကြည့်တိုက်)

Explore interactive e-books with hands-on activities. Every chapter is a magical journey of learning.

- **Read Like a Book:** Each chapter feels like flipping through pages in a magical book
- **Interactive Activities:** Quizzes, code exams, and engaging lessons keep you immersed
- **Flexible Content:** Update content without touching code — just edit the data files

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

Use this command for future deployments so the repo's current SQLite database and bundled app data are copied into the Firebase hosting folder first:

```bash
npm run deploy:firebase
```

This command runs the build, syncs the current database into the public hosting assets, and then deploys to Firebase.

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



The peek code overlay is implemented as an absolute overlay that sits on top of the right side of the code editor so the editor width does not change when the peek is visible. Key points:

- Positioning: the overlay is absolutely positioned inside the practice workspace body/editor shell and aligned to the workspace padding box so its top edge begins directly below the chapter brief/header.
- Size: it covers the right 50% of the editor (capped at a configurable max width, currently 600px). The overlay and the editor both scroll internally.
- Appearance: dark theme (background `#1e293b`), inner code surface `#111827`, border-left `#374151`, soft shadow to separate overlay visually.
- Behavior: the overlay does not push or shrink the editor content — it visually overlays it. A small padding/gutter can be added to the editor when the peek is open to avoid obscuring critical UI.

## Files to inspect when adjusting overlay behavior

1. `src/index.css` — app-level rules that may include `.practice-code-page .practice-peek-desktop` variants.
2. `src/styles/bookshelf-theme.css` — theme/styles for `.practice-workspace`, `.practice-workspace-body`, and `.practice-peek-desktop` (primary implementation location).
3. `src/styles/course.css` — legacy/course-level workspace styles that can affect layout or overflow.

## Troubleshooting / Common fixes

- Overlay not aligned: ensure the workspace body or editor shell is the positioning context (`position: relative`) and that the overlay is `position: absolute; top: 0; right: 0; bottom: 0;` within that context.
- Overlay overlaps header: align the overlay to the workspace body padding box or set `top` to the header height. Use `--app-header-height` CSS variable or compute it at runtime.
- Editor width changes: confirm overlay is absolute within the editor shell (not a flex child) so it does not participate in normal layout flow.
- Theme mismatch: confirm `background` and `color` values in both index.css and theme files match the desired dark palette.

### Admin persistence note

- If you add new admin-configurable fields (for example `coverWidth` / `coverHeight`), add both a `Course` type property and an explicit SQLite column, then ensure the persistence layer writes/reads the column. The codebase prefers explicit DB columns over the `raw` JSON value to avoid stale JSON overriding newly-saved values. See `src/utils/sqliteBrowserCourses.ts` for `ensureCourseSchema`, `courseToRows`, `saveCourseBundleToDb`, and `assembleCourses`.

When adding fields:

1. Add the property to `src/data/courses.ts`.
2. Add a DB column in `ensureCourseSchema` and to the `REPLACE INTO courses` SQL.
3. Update `queryCourseRows` and `assembleCourses` to read the column and prefer it over `raw` JSON.
4. Add admin UI inputs in `src/pages/AdminCourses.tsx` and test save + reload.

## Customization notes

- Admin theme controls now use gradient start/middle/end stops for all backgrounds, so the app uses a single source of truth for shared theme values.
- `--app-header-height` (in `:root` of `src/styles/bookshelf-theme.css`) adjusts the workspace height calculation.
- `--practice-editor-height` provides a default clamp-based fallback for editor height.
- To keep the overlay behavior consistent across pages, prefer setting positioning and overlay rules in `src/styles/bookshelf-theme.css` and let `index.css` provide page-specific variants only when necessary.

If you'd like, I can add a small runtime helper that measures the real header height and sets `--app-header-height` automatically so the overlay and workspace always align precisely with the real DOM header.
