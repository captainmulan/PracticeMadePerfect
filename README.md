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
