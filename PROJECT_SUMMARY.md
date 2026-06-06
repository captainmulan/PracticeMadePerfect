# PracticeMadePerfect — Project Summary

> **Status:** Development in progress  
> **Last reviewed:** June 2026  
> **Purpose of this doc:** Compare the **current codebase** against the **original planning prompt**, document structure, and note intentional gaps / next steps.

---

## 1. Vision (Original Prompt)

A **lightweight, mobile-friendly interview practice site** for busy professionals (MRT commute, late-night sessions). Core ideas:

| Theme | Original intent |
|-------|-----------------|
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
| Framework | **React 19** + TypeScript | Not Angular (see §5) |
| Build | Vite 5 | Dev server on port `4173` |
| Routing | react-router-dom 7 | `/` home, `/practice/:categoryKey` workspace |
| Backend | None | Fully client-side SPA |
| Data storage | TypeScript modules | Not `.txt` / `.html` files yet |

### 2.2 Folder structure

```
PracticeMadePerfect/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── src/
    ├── main.tsx              # App bootstrap
    ├── App.tsx               # Shell: header, nav, routes
    ├── index.css             # Global + practice layout styles
    ├── data/
    │   └── tasks.ts          # Categories + practice task definitions
    ├── config/
    │   └── compileLanguages.ts  # Language profiles (future admin override)
    ├── utils/
    │   ├── taskHints.ts         # Comment hints + keyword verification
    │   └── compileVerifier.ts   # Syntax / compile checks per language
    └── pageData/
        ├── homePage.ts       # Home page copy / metadata
        └── practicePage.ts   # Practice page copy + re-exports tasks
    └── pages/
        ├── Home.tsx          # Category picker (Netflix-style cards)
        └── Practice.tsx      # Task wizard / editor workspace
```

### 2.3 Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Home` | Hero + category grid (React, Angular, C#, SQL) |
| `/practice/:categoryKey` | `Practice` | Single-category task flow |
| `/practice` | redirect → `/` | Guard for bare practice URL |

### 2.4 Data model (`src/data/tasks.ts`)

```ts
PracticeTask {
  id, category, title, description,
  checklist: string[],
  detailedInstructions?: string[],
  verificationKeywords?: string[][],  // keyword-based auto-check
  starterCode?: string,
  type: "code" | "sql" | "text"
}

Category { key, label, description?, color?, icon? }
```

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

### 2.6 Content separation (partial CMS foundation)

Original plan: each page = editable `.txt` / `.html` file.

Current approach: **TypeScript data modules** (`pageData/`, `data/tasks.ts`). Content is separated from page components, but:
- Requires a dev rebuild to change content
- Not editable by a non-developer admin
- `homePageData.featureHtml` exists but is **not rendered** on Home yet

---

## 3. Gap Analysis — Prompt vs Current Build

### 3.1 Aligned ✅

| Original idea | Current implementation |
|---------------|------------------------|
| IT categories: React, Angular, C#, SQL | Four categories on home screen |
| Busy-user / mobile focus | Mobile CSS: full-height editor, collapsible hero, sticky-friendly layout |
| Instruction checklist concept | `checklist`, `detailedInstructions`, `verificationKeywords` on each task |
| Multiple task types | `code`, `sql`, `text` types with appropriate editor labels |
| Separate content from shell | `pageData/` + `data/tasks.ts` pattern |
| Simple, no backend yet | Pure SPA, no auth, no API |
| Keyword-based progress hint | `verifyCode()` + modal results |
| Name: PracticeMadePerfect (PMP) | Used in README, header, `homePageData` |

### 3.2 Partially done ⚠️

| Original idea | Current state | Gap |
|---------------|---------------|-----|
| **3-panel layout** (top Q · left checklist · right notepad) | Top panel + right editor only | **Left instruction checklist panel removed** from JSX; CSS for `.practice-left` remains but unused. Checklist only appears after "Verify" in modal |
| **Real-time checklist** linked to right panel text | Keyword verify on button click | Not live/as-you-type; no separate notepad — editor doubles as workspace |
| **Top task list** | Previous/Next footer navigation | No visible top task picker / sidebar list |
| **CMS via text files** | TS modules | Structure ready; format is code not `.txt`/`.html` |
| **Angular focus** | Angular category card exists | Zero Angular practice tasks |
| **Sample task library** | 6 tasks | ~80% of listed samples missing |
| **SOLID / maintainable** | Clean separation of data vs pages | No formal service layer, interfaces only in `tasks.ts` |

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
