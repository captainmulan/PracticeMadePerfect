# Magic Library (မှော်ဝင် စာကြည့်တိုက်) — Project Summary

> **Status:** Development in progress  
> **Last reviewed:** July 2026  
> **Purpose of this doc:** Document the **current codebase**, feature set, CMS capabilities, and development roadmap.

---

## 1. Vision (Current)

**Magic Library** is an interactive e-book platform with hands-on learning activities. Each chapter is a magical journey of learning through quizzes, code exams, and engaging lessons.

### Core features:
- **Read Like a Book:** Each chapter feels like flipping through pages in a magical book
- **Interactive Activities:** Quizzes, code exams, and engaging lessons keep learners immersed
- **Flexible Content:** Update content without touching code — just edit the data files (CMS-enabled)

### Original Vision (Interview Practice Foundation):

The codebase was initially built as a **lightweight, mobile-friendly interview practice site** for busy professionals. Core ideas:

| Theme | Foundation |
|-------|------------|
| **Audience** | IT-first, expandable to Car, Education, etc. |
| **Tech focus** | Angular (primary), plus React, C#, SQL |
| **Practice UI** | Top task list · left hideable instruction checklist (linked to right panel) · right free-text / code workspace |
| **Content model** | CMS-style: admin edits content; presentation site renders from **text/HTML files** |
| **Auth** | Same app, role-based: public presentation vs admin editor (future) |
| **Principles** | Simple, minimum, compact, useful — SOLID without over-engineering |
| **Future** | SaaS potential, progress tracking, live code execution |

---

## 2. What Exists Today

### 2.1 Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **React 19** + TypeScript | Component-driven, type-safe |
| Build | Vite 5 | Dev server on port `4173` |
| Routing | react-router-dom 7 | `/` home, `/courses` book shelf, `/course/:courseId` course reader |
| Backend | None | Fully client-side SPA |
| Data storage | **Browser SQLite** (sql.js) | Courses, chapters, steps stored in `course_*` tables; admin UI for editing; bundled defaults included |
| CMS | **HTML rendering** in `CourseHtmlStep` | Chapter content via `dangerouslySetInnerHTML`; flexible markup without code rebuild |
| Admin UI | `/admin` page | Edit home page styles, book builder, database recovery |

### 2.2 Folder structure

```
Magic Library/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── data/
│   └── tasks.db.bak          # Bundled SQLite database (courses, chapters, steps)
├── public/data/
│   └── tasks.db.bak          # Public assets for deployment
└── src/
    ├── main.tsx              # App bootstrap
    ├── App.tsx               # Shell: header, nav, routes
    ├── index.css             # Global layout + practice workspace styles
    ├── data/
    │   ├── courses.ts        # Default course definitions (bundled seed data)
    │   ├── tasks.ts          # Interview practice task definitions
    │   ├── fictionBook.ts    # Example e-book content
    │   └── courses_clean.ts  # Cleaned course exports
    ├── components/
    │   ├── CourseBookCard.tsx           # Book shelf card rendering
    │   ├── CourseHtmlStep.tsx           # **CMS: HTML chapter renderer**
    │   ├── CourseCodeStep.tsx           # Code exam step
    │   ├── CourseQuizStep.tsx           # Quiz step
    │   ├── HomeCourseShelves.tsx        # Home page book shelves
    │   ├── PracticeWorkspace.tsx        # Shared workspace layout
    │   └── PracticeCodeEditor.tsx       # Code editor for exams
    ├── utils/
    │   ├── sqliteBrowserDb.ts           # Browser SQLite DB cache, restore logic
    │   ├── sqliteBrowserCourses.ts      # Course CRUD operations
    │   ├── sqliteBrowserTaskSource.ts   # Task queries
    │   ├── contentStore.ts              # Admin data persistence
    │   ├── courseShelf.ts               # Book grouping logic
    │   └── compileVerifier.ts           # Code verification (legacy interview tasks)
    ├── pageData/
    │   ├── homePage.ts       # Home page styling + metadata
    │   └── practicePage.ts   # Practice workspace metadata
    └── pages/
        ├── Home.tsx          # Home page: hero + book shelves
        ├── PracticeCode.tsx  # Code exam workspace (legacy)
        ├── PracticeText.tsx  # Text task workspace (legacy)
        ├── CourseWizard.tsx  # **Book reader: renders chapters**
        ├── Admin.tsx         # Admin: home page & database controls
        ├── AdminCourses.tsx  # Admin: book builder (create/edit chapters)
        └── AdminTaskEditor.tsx # Admin: legacy task editor
```

### 2.3 Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Home` | Hero banner + book shelves (interactive e-books) |
| `/course/:courseId` | `CourseWizard` | **Book reader:** renders chapters with HTML content, quizzes, code exams |
| `/practice/:categoryKey` | `PracticeCode` / `PracticeText` | Legacy interview practice workspace |
| `/admin` | `Admin` | Admin controls: home page styling, database recovery |
| `/admin` (books tab) | `AdminCourses` | Book builder: create/edit chapters with HTML content |

### 2.4 Data model (`src/data/tasks.ts`)

```ts
PracticeTask {
  id, category, title, description,
  checklist: string[],
  categoryIndex?: number,   // sort categories (maps to SQLite Category_Index)
  taskIndex?: number,         // sort tasks within category (maps to SQLite Task_Index)
  verificationKeywords?: string[][],
  type: "code" | "sql" | "text"
}

Category { key, label, description?, color?, icon? }
```

**SQLite `tasks` table columns:** `id`, `filename`, `category`, `title`, `raw`, `Category_Index`, `Task_Index`, `type`

- **Category_Index** — display order of categories (from `categoryIndexByKey` in `tasks.ts`)
- **Task_Index** — display order of tasks inside a category (was legacy `idx` / JSON `index`)
- Sort: `ORDER BY Category_Index, Task_Index` (see `sqliteBrowserTaskSource.ts`, `taskSort.ts`)

**Categories configured:** `react`, `angular`, `csharp`, `sql` (IT only — no Car / Education yet).

**Tasks seeded (15 total):**

| Category | Tasks in repo |
|----------|---------------|
| React | useState counter, Reducer counter, Counter variations, Redux counter, Toggle visibility, Form input, Fetch data, Manage list, Tab navigation (9) |
| Angular | *(category exists, no tasks yet)* |
| C# | Bubble Sort, Bounce Count and Distance |
| SQL | Count Employees in P1, Find Duplicate Records |

Many sample tasks from the original prompt (Redux counter, tab nav, fair rounding, RANK(), etc.) are **not yet added**.

### 2.5 UI behaviour (current)

**Home page**
- **Hero banner** (same pattern as practice): compact clickable bar, **starts collapsed** — headline only; expand for summary
- 2-column category cards with colour accent, icon, expand/collapse for category description
- Links directly into `/practice/{category}`

**Practice page** (wizard-style, mobile-first)
- **Hero banner:** single row — category · task title · `N/total` · type badge; **starts expanded**; tap to collapse/expand task description
- **Editor:** auto-generated **comment hints only** for every task — `Import` block, numbered checklist steps, `Export` block; **2 blank lines** between each step; user writes all real code
- **Footer:** Exit · Previous · Reset · Verify · Next
- **Verify (2-step):** (1) **compile/syntax check** by language (JSX, C#, SQL, text) via `compileVerifier.ts`; (2) keyword checklist on non-comment code. Compile failure → all checklist ✗ + error shown in modal. Checklist starts **all false**
- **Reset:** restores generated comment hints and clears checklist
- **State:** per-task drafts, checklist booleans, verification results — all in React `useState` (lost on refresh)

### 2.5.1 Hint + verification model

| Module | Function | Purpose |
|--------|----------|---------|
| `taskHints.ts` | `getCommentHints(task)` | Build hints: Import → numbered checklist → Export; `STEP_GAP` = 2 blank lines |
| `taskHints.ts` | `getExecutableCode` / `getVerifiableCode` | Strip `//` / `--` hint lines before compile + keyword scan |
| `taskHints.ts` | `verifyTaskFull` | Compile first; keyword checklist only if compile passes |
| `compileVerifier.ts` | `runCompileCheck` | JSX (delimiter + JS parse), SQL, C#, text validators |
| `compileLanguages.ts` | `resolveCompileLanguage` | Maps category/type → language id (future admin config) |

Tasks without `verificationKeywords` pass compile-only (e.g. text answer) but checklist stays ✗ until keywords added.

### 2.6 CMS Feature: HTML Chapter Rendering

**Location:** `src/components/CourseHtmlStep.tsx`

**How it works:**
- Each `CourseStep` with `stepType === "html"` stores lesson content in the `contentHtml` field (string of HTML markup)
- React renders this using `dangerouslySetInnerHTML` so chapters can include formatted text, images, lists, etc.
- No code rebuild required to update chapter content — just edit the `contentHtml` field in the course data
- Admin UI (`AdminCourses.tsx`) allows editing chapter content directly

**Data flow:**
1. Default courses loaded from `src/data/courses.ts` (bundled seed data)
2. Courses persisted to browser SQLite (`course_*` tables)
3. Admin can edit chapter HTML via book builder
4. Changes saved to browser DB and localStorage
5. On page load, `CourseWizard` fetches course from SQLite and renders chapters via `CourseHtmlStep`

**Example chapter with HTML:**
```ts
{
  id: "chapter-1-step-1",
  stepType: "html",
  title: "Introduction",
  contentHtml: `<div class="lesson">
    <h2>Welcome to Magic Library</h2>
    <p>This chapter explores interactive learning...</p>
    <ul><li>Learn by reading</li><li>Practice with quizzes</li></ul>
  </div>`,
  description: "Learn the basics"
}
```

### 2.7 Recent updates

Since the last review, the project evolved from interview practice to interactive e-books:
- Renamed/rebranded to **"Magic Library"** with book-centric UI
- Introduced **Course/Chapter/Step** model (e-book structure) alongside legacy Practice tasks
- **Book builder** at `/admin` for creating/editing courses with chapters
- **CourseWizard** component for reading books (chapter navigation, quiz, code exam, HTML lessons)
- **CMS HTML rendering** — chapters can include formatted content without code rebuild
- **Browser SQLite** for persistent storage of courses and user progress
- **Admin database recovery** — one-click restore to bundled defaults
- **Hardened delete actions** — prevent accidental book/task removal
- **Password-protected restore** — require `admin123` password for critical admin actions
 
### Admin persistence: cover size bug and fix

- **Symptom:** When changing a book's `coverHeight` (or other new admin-configured fields) in the admin UI and saving, the value could revert to an older value (for example, change to `200` then save and it returns to `150`). The bookshelf rendering also did not reflect the saved size.
- **Root cause:** New configuration fields were added to both the `raw` JSON (stored in the `raw` column) and to explicit DB columns (e.g. `cover_width`). When assembling course objects the code preferred the `raw` JSON values which could be stale and overwrite freshly-saved DB column values.
- **Fix applied:** Persistence code now writes `cover_width` / `cover_height` columns and `assembleCourses` prefers explicit DB columns when present (`courseRow.coverWidth ?? courseMeta.coverWidth`) so the DB column value wins over stale `raw` JSON.
- **Effect:** After saving from the admin UI the new numeric dimensions persist, and the bookshelf/card rendering reads the stored column values.

**Guidance for adding future admin configuration fields**

1. Add the new optional property to the `Course` type in `src/data/courses.ts`.
2. Extend `ensureCourseSchema` in `src/utils/sqliteBrowserCourses.ts` to add a dedicated column (e.g. `my_field`) and include it in the `CREATE TABLE` and `ALTER TABLE` fallbacks for existing DBs.
3. Add the column to `CourseRow` and to `courseToRows` so the column is written when saving.
4. Update `saveCourseBundleToDb` to persist the new column in the `REPLACE INTO courses (...)` statement.
5. Update `queryCourseRows` to select the new column and parse numbers with `readRowOptionalNumber` if numeric.
6. Update `assembleCourses` to prefer the explicit DB column (`courseRow.myField ?? courseMeta.myField`) so that fresh DB columns are not overridden by older `raw` JSON.
7. Add admin UI controls in `src/pages/AdminCourses.tsx` and map values into `activeBook` updates and saving.
8. Update UI renderers (`src/utils/courseShelf.ts`, `src/components/CourseBookCard.tsx`) to use the new values and have sensible fallbacks.
9. Run `pnpm exec tsc --noEmit` to verify types and then test the admin save + reload flow in the browser.

If you want, add a short unit test or a debug command to dump the `courses` row after save to confirm the DB column values (useful when adding new numeric configuration fields).
---

## 3. Current Implementation Status

### 3.1 E-Book Platform (Now Primary) ✅

| Feature | Status |
|---------|--------|
| **Course/Chapter/Step Model** | ✅ Fully implemented |
| **HTML Chapter Rendering (CMS)** | ✅ Working via `CourseHtmlStep` |
| **Book Reader UI (CourseWizard)** | ✅ Chapter navigation, quizzes, code exams |
| **Admin Book Builder** | ✅ Create/edit courses and chapters |
| **Browser SQLite Persistence** | ✅ Courses, chapters, steps stored and synced |
| **Admin Database Recovery** | ✅ One-click restore to bundled defaults |
| **Home Page with Book Shelves** | ✅ Display courses as organized shelves |
| **Password-Protected Admin Actions** | ✅ Require `admin123` for critical operations |

### 3.2 Legacy Interview Practice (Secondary) ⚠️

The original interview practice system is still present but secondary to e-books:

| Feature | Status | Notes |
|---------|--------|-------|
| Practice workspace (code/text) | ✅ Working | `/practice/:categoryKey` routes |
| Task verification (compile + keywords) | ✅ Working | For code and SQL tasks |
| Task library (React, Angular, C#, SQL) | ⚠️ Partial | ~15 React tasks, few C#/SQL, no Angular |
| Top task picker UI | ❌ Missing | Only Previous/Next navigation |
| Left instruction checklist panel | ⚠️ Unused | CSS exists but not rendered |

### 3.3 Not started ❌

| Original idea | Status |
|---------------|--------|
| Top-level domains: Car, Education | Not in categories |
| Admin module / login role split | No auth |
| Save user drafts / progress | Session-only state |
| Live code execution / evaluation | Keyword match only |
| SaaS / multi-tenant | N/A |
| Presentation from raw HTML files | Not implemented |
| Multiple choice, diagram, graph task types | Only code / sql / text |

---

## 4. Architecture Snapshot

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx (shell + router)                               │
├─────────────────────────────────────────────────────────┤
│  Home.tsx          │  Practice.tsx                      │
│  ← homePageData    │  ← practicePageData + URL param    │
│  ← categories      │  ← filtered tasks by category      │
├────────────────────┴────────────────────────────────────┤
│  data/tasks.ts          pageData/homePage.ts            │
│  (tasks + categories)   pageData/practicePage.ts        │
└─────────────────────────────────────────────────────────┘
         ↓ (future)
┌─────────────────────────────────────────────────────────┐
│  JSON / TXT content files  →  Admin editor  →  API      │
│  User progress store     →  Auth / roles                │
└─────────────────────────────────────────────────────────┘
```

**Design choice already made:** React shell renders structured data; pages are thin views. This maps cleanly to a future CMS if `tasks.ts` becomes loaded JSON.

---

## 5. Original Planning Notes (Recommendations)

These were discussed in the initial prompt and remain relevant for next phases.

### 5.1 App naming

| Name | Fit |
|------|-----|
| **PracticeMadePerfect (PMP)** ✅ current | Clear, professional, acronym works; slight overlap with project-management "PMP" |
| DrillDeck | Short, SaaS-friendly |
| ByteBench | Dev-focused |
| PrepSnap | Emphasises quick sessions |

**Recommendation:** Keep **PracticeMadePerfect** for now. Revisit before public SaaS if trademark / SEO matters.

### 5.2 React vs Angular (for the app itself)

| | React (chosen) | Angular (original preference) |
|--|----------------|-------------------------------|
| **Pros** | Faster MVP, huge ecosystem, Vite DX, easier content-driven UI | Strong structure, DI, good for large teams / enterprise SaaS |
| **Cons** | Less opinionated — discipline needed for scale | Heavier boilerplate, slower initial setup |
| **For this project** | ✅ Good for CMS-like, content-heavy, mobile SPA | Better if team is Angular-first or app grows into complex admin |

**Recommendation:** React is fine for the **platform**. Angular should remain a **practice category** (interview tasks), not necessarily the framework you build the site in — unless the goal is also to demo Angular fluency in the codebase itself.

### 5.3 CMS / content storage — suggested path

Original: `.txt` / simple HTML per page.

**Minimum viable evolution (no over-engineering):**

1. **Phase 1 (now):** `content/*.json` — one file per page + `tasks.json`
2. **Phase 2:** Vite `import` or `fetch` at build time; hot-reload in dev
3. **Phase 3:** Admin UI writes JSON; optional Git-based deploy
4. **Phase 4:** DB + auth only when multi-user / SaaS is real

Skip raw `.html` fragments unless you need rich arbitrary markup per task. JSON + a small set of render components is easier to validate and safer than `dangerouslySetInnerHTML`.

### 5.4 Practice UI — suggested restore (minimal)

To match the original 3-panel intent without complexity:

```
┌──────────────────────────────────────────────┐
│  Task bar: title · 2/10 · [◀ ▶]              │
├──────────────┬───────────────────────────────┤
│ Instructions │  Workspace (code / notes)     │
│ [x] step 1   │                               │
│ [ ] step 2   │                               │
│ (hide ◀)     │                               │
└──────────────┴───────────────────────────────┘
│  Exit · Reset · Verify · Next                │
└──────────────────────────────────────────────┘
```

- Left panel: read-only checklist; auto-check on verify (keep current keyword logic)
- Right panel: single editor (not separate notepad + code — one surface is enough for MVP)
- Mobile: left panel → bottom sheet or verify modal (partially done)

### 5.5 SOLID — practical minimum

| Principle | Light-touch application |
|-----------|-------------------------|
| **S** | `TaskRepository` (load tasks), `ChecklistVerifier` (keyword logic), `PracticeSession` (state) |
| **O** | New task types via `type` enum + strategy, not new pages |
| **L** | N/A at current scale |
| **I** | Small interfaces: `PracticeTask`, `Category`, `Verifier` |
| **D** | Pages depend on data interfaces, not file format |

Avoid abstract factories until you have 3+ task renderers.

### 5.6 SaaS feasibility

| Factor | Assessment |
|--------|------------|
| Market | Interview prep is crowded but niche verticals (C#, SQL, Angular live-coding) are viable |
| MVP moat | Structured checklists + mobile flow + curated tasks |
| Monetisation | Freemium tasks, paid packs, team licences |
| Blockers | Need auth, progress, payments, content pipeline first |

**Verdict:** Valid long-term; current codebase is an appropriate **free single-user MVP** foundation.

---

## 6. Task Backlog (from original samples)

### React — missing
Counter with Reducer · Math.max/min with steps · Multiple Counters · Reset · Double/Triple Counter · Counter with Redux · Toggle visibility · Fetch on button click · Manage list · Tab navigation

### C# — missing
`GetTotalDistanceOfBall` (partial: bounce task exists as text type) · Fair rounding · Denominations / coin change

### SQL — missing
Salary range query · Project-wise count DESC · First name from FullName · LEFT JOIN salary · Managers query · Employees with salary · Remove duplicates without temp table · Min/max salary in one query · `RANK()` second-largest salary

### Angular — missing
Entire task set (category placeholder only)

---

## 7. Immediate next steps (suggested priority)

1. **Restore left checklist panel** in `Practice.tsx` (CSS already exists)
2. **Add task list** — dropdown or compact top strip for jumping between tasks
3. **Move `tasks.ts` → `content/tasks.json`** — first step toward CMS
4. **Seed Angular + remaining SQL/C#/React samples** incrementally
5. **Persist drafts** — `localStorage` per task id (no backend needed)
6. **Defer** admin module, auth, live runner until content library is useful

---

## 8. How to run

```bash
npm install
npm run dev
# → http://localhost:4173
```

---

## 9. Summary sentence

**PracticeMadePerfect** is a React + Vite SPA that delivers a mobile-oriented interview practice wizard with category navigation, structured tasks, and keyword verification — implementing roughly **60% of the original UI vision** and **~15% of the planned content library**, with TypeScript data modules standing in for the future file-based CMS and no admin or persistence layer yet.
