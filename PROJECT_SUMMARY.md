# Project Summary

## Peek Code Overlay Implementation

The peek code overlay is implemented as an absolute overlay that sits on top of the right side of the code editor so the editor width does not change when the peek is visible. Key points:

- Positioning: the overlay is absolutely positioned inside the practice workspace body/editor shell and aligned to the workspace padding box so its top edge begins directly below the chapter brief/header.
- Size: it covers the right 50% of the editor (capped at a configurable max width, currently 600px). The overlay and the editor both scroll internally.
- Appearance: dark theme (background `#1e293b`), inner code surface `#111827`, border-left `#374151`, soft shadow to separate overlay visually.
- Behavior: the overlay does not push or shrink the editor content — it visually overlays it. A small padding/gutter can be added to the editor when the peek is open to avoid obscuring critical UI.

## Files to Inspect When Adjusting Overlay Behavior

1. [src/index.css](file:///c:/Users/65966/PracticeMadePerfect/src/index.css) — app-level rules that may include `.practice-code-page .practice-peek-desktop` variants.
2. [src/styles/bookshelf-theme.css](file:///c:/Users/65966/PracticeMadePerfect/src/styles/bookshelf-theme.css) — theme/styles for `.practice-workspace`, `.practice-workspace-body`, and `.practice-peek-desktop` (primary implementation location).
3. [src/styles/course.css](file:///c:/Users/65966/PracticeMadePerfect/src/styles/course.css) — legacy/course-level workspace styles that can affect layout or overflow.

## Troubleshooting / Common Fixes

- Overlay not aligned: ensure the workspace body or editor shell is the positioning context (`position: relative`) and that the overlay is `position: absolute; top: 0; right: 0; bottom: 0;` within that context.
- Overlay overlaps header: align the overlay to the workspace body padding box or set `top` to the header height. Use `--app-header-height` CSS variable or compute it at runtime.
- Editor width changes: confirm overlay is absolute within the editor shell (not a flex child) so it does not participate in normal layout flow.
- Theme mismatch: confirm `background` and `color` values in both index.css and theme files match the desired dark palette.

## Admin Persistence Note

- If you add new admin-configurable fields (for example `coverWidth` / `coverHeight`), add both a `Course` type property and an explicit SQLite column, then ensure the persistence layer writes/reads the column. The codebase prefers explicit DB columns over the `raw` JSON value to avoid stale JSON overriding newly-saved values. See [src/utils/sqliteBrowserCourses.ts](file:///c:/Users/65966/PracticeMadePerfect/src/utils/sqliteBrowserCourses.ts) for `ensureCourseSchema`, `courseToRows`, `saveCourseBundleToDb`, and `assembleCourses`.

When adding fields:

1. Add the property to [src/data/courses.ts](file:///c:/Users/65966/PracticeMadePerfect/src/data/courses.ts).
2. Add a DB column in `ensureCourseSchema` and to the `REPLACE INTO courses` SQL.
3. Update `queryCourseRows` and `assembleCourses` to read the column and prefer it over `raw` JSON.
4. Add admin UI inputs in [src/pages/AdminCourses.tsx](file:///c:/Users/65966/PracticeMadePerfect/src/pages/AdminCourses.tsx) and test save + reload.

## Customization Notes

- Admin theme controls now use gradient start/middle/end stops for all backgrounds, so the app uses a single source of truth for shared theme values.
- `--app-header-height` (in `:root` of [src/styles/bookshelf-theme.css](file:///c:/Users/65966/PracticeMadePerfect/src/styles/bookshelf-theme.css)) adjusts the workspace height calculation.
- `--practice-editor-height` provides a default clamp-based fallback for editor height.
- To keep the overlay behavior consistent across pages, prefer setting positioning and overlay rules in [src/styles/bookshelf-theme.css](file:///c:/Users/65966/PracticeMadePerfect/src/styles/bookshelf-theme.css) and let [src/index.css](file:///c:/Users/65966/PracticeMadePerfect/src/index.css) provide page-specific variants only when necessary.

## Home page — Author tab & bookshelf fixes (latest)

Summary:
- Goal: Show authors as circular avatar "shelf items" (like placeholders) in the Author tab, and keep all other categories rendering as book-cover cards with spines. Avoid changing the existing book-category UI/UX.
- Outcome: Author rendering and styles were separated into dedicated components and selectors so the theme's global button/card styles no longer affect author avatars. Build and verification passed.

Key implementation points:
- Render branching: `Home` now chooses the author-specific row by checking the shelf row title (`selectedRow.title === "Author"`) rather than relying on tab state alone. This prevents accidental reuse of the book rendering path for authors.
- Dedicated author components: created / refactored components specifically for author rendering to keep concerns separated:
	- `src/components/AuthorShelfCard.tsx` — author avatar card (now renders `author-profile-content`, `author-profile-avatar`, with overlaid name for real authors and placeholder label for empty slots).
	- `src/components/AuthorShelfRow.tsx` — builds author rows/placeholder padding and only uses author cards for items where `actionType === "author"`.
- Kept book rendering untouched: `HomeCourseShelves.tsx` and `CourseBookCard.tsx` continue to render normal book cards, spines and cover images for non-author categories.

Files changed (high level):
- `src/pages/Home.tsx` — enhanced selection logic; only `selectedRow.title === "Author"` renders `AuthorShelfRow`.
- `src/components/AuthorShelfCard.tsx` — refactor to author-specific markup and overlay title behavior.
- `src/components/AuthorShelfRow.tsx` — author row builder; ensures minimum slots and uses `AuthorShelfCard` for author items.
- `src/components/CourseBookCard.tsx` — preserved book rendering; author variants removed from the shared visual path.
- `src/components/HomeCourseShelves.tsx` — unchanged for book categories; placeholder padding preserved.
- `src/utils/courseShelf.ts` — author row builders: `getAuthorShelfRow`, `getCourseShelfRowForAuthor` return items with `actionType: "author"` and `artifactType: "book"` so author rows are distinct at render time.
- `src/index.css` and `src/styles/bookshelf-theme.css` — fixed malformed rules, restored `.book-spine`, and added explicit author-profile overrides to opt out of the global themed `button` styles (so author buttons are transparent and show only the circular avatar).

Verification performed:
- Ran `npm run build` successfully after each change to ensure TypeScript/packager errors were not introduced and assets compiled.
- Manual visual checks with screenshots (mobile and desktop widths) to confirm:
	- Placeholder author slots (empty profiles) show the circular avatar and label below the shelf board.
	- Real author entries show the circular avatar with the author name overlaid on the avatar (configurable) and no purple card background.
	- Other categories still show book covers and the left spine vertical line.

Notes for further verification or tweaks:
- To inspect in the browser, open devtools and check that author items use `author-profile-button` (or `author-profile-content`) and not `book`/`book--cover-image` classes.
- If the theme (data attribute `data-bookshelf-theme="space"`) still paints buttons, confirm `body[data-bookshelf-theme="space"] .author-profile-button` has `background: transparent!important; box-shadow:none!important` in computed styles. If not, clear caches or ensure the built CSS is loaded.

Next possible adjustments (optional):
- Tweak overlay text styling (`.author-profile-title--on-avatar`) for better legibility (font size, color, shadow).
- Align spacing of the first (real) author row with placeholders by adjusting `AuthorShelfRow` padding or `author-profile-content` margins.
- Remove dead/stale `.author-card` selectors entirely if no component references remain.

If you'd like, I can now:
- Run a quick DOM snapshot and list the rendered classes for the visible author row so you can confirm which selectors are active, or
- Tweak the overlay text style to match your exact visual preference — tell me font size/weight/color and I'll apply it.
