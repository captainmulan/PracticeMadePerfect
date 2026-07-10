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
