# PracticeMadePerfect (PMP)

A lightweight React practice app focused on mobile-friendly interview preparation.

## Run locally

1. Install dependencies

```bash
cd practice-made-perfect
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the app in your browser

`http://localhost:4173`

## What’s included

- responsive practice UI for React, Angular, C#, and SQL
- category selector and top task list
- instruction checklist panel
- notes editor
- starter code editor for code and SQL tasks

## Future extension

- admin content editor
- save tasks as JSON files
- user progress tracking
- live code execution / evaluation

---

## Peek Code Overlay Implementation Notes

### Key Requirements
- The peek code overlay must be positioned **absolutely** over the right 50% of the code editor
- Must sit directly on top of the editor (not next to it)
- Must have a distinct dark theme to avoid confusion with the light editor area

### CSS Files to Check for Fixes (in order of priority)
1. `src/index.css`: Contains `.practice-code-page .practice-peek-desktop` rules
2. `src/styles/bookshelf-theme.css`: Contains `.practice-workspace .practice-peek-desktop` rules
3. `src/styles/course.css`: Contains general practice workspace styles

### Common Issues & Fixes
- **Anchor side problem**: Ensure both index.css and bookshelf-theme.css set `position: absolute` on `.practice-peek-desktop`
- **Overlay not covering editor**: Check that the parent container (`.practice-workspace-body`, `.practice-right`, or `.practice-editor-area`) is `position: relative`
- **Dark theme not applied**: Verify `background` and `color` properties match the dark theme in both index.css and bookshelf-theme.css

### Current Implementation
- Peek covers right 50% (max 600px)
- Position: `absolute`
- Background: `#1e293b` (dark slate blue)
- Code area background: `#111827` (near black)
- Border-left: `1px solid #374151`
- Box-shadow: `-8px 0 32px rgba(0, 0, 0, 0.15)`
- z-index: `10`
