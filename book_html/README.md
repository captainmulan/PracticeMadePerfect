# Interactive Book HTML — Structure Guide

This folder holds **standalone HTML chapters** for Magic Library ebooks (ages 7–8). Each book is a subfolder of self-contained files (`001` … `NNN`). The parent app loads chapters in **numeric filename order**.

**Reference implementation:** [SolarSystem/README.md](SolarSystem/README.md)  
**Aligned book:** [OceanAdventure/README.md](OceanAdventure/README.md)

---

## Standard page flow (use for every new book)

| Order | Filename pattern | Page type | Purpose |
|------:|------------------|-----------|---------|
| 01 | `001-Book-Briefing.html` | **Briefing** | About the book, **author name (Jimmy Cooper)**, author speech / welcome message |
| 02 | `002-Index.html` | **Index** | Table of contents with chapter numbers matching filenames |
| 03 | `003-Character-Selection.html` | **Setup** | Name + avatar → `localStorage` (used in quizzes) |
| 04 | `004-Intro-*.html` | **Intro game** | High-quality hook game before main lessons |
| 05+ | Topic block (repeat) | See below | One topic = **3 chapters** |
| … | `NNN-Conclusion.html` | **Conclusion** | Summary of what was learned |
| … | `NNN-*-Overall-Quiz.html` | **Overall quiz** | Mixed questions from the whole book |
| … | `NNN-Outro-*.html` | **Outro game** | Unique finale game (different from chapter minigames) |
| last | `050-*-Congratulations.html` or next free number | **Congratulations** | Certificate-style celebration (Solar: `043`, Ocean: `032`) |

### Topic block (repeat for each subject)

Each topic uses **three files in this order**:

1. **`NNN-Topic.html`** — Brief explain + **mini game** / interactive activity (tap facts, canvas game, SVG viewer)
2. **`NNN-Topic-Explained.html`** — Detailed reading (cards, stats, missions)
3. **`NNN-Topic-Quiz.html`** — **Quiz time** (VS bar, one question at a time, podium)

Example (Solar System — Sun):

- `008-The-Sun.html` → activity + Solar Climb minigame  
- `009-The-Sun-Explained.html` → reading  
- `010-The-Sun-Quiz.html` → quiz  

Example (Ocean — Sunlight Zone):

- `008-Sunlight-Zone.html` → activity  
- `009-Sunlight-Zone-Explained.html` → reading  
- `010-Sunlight-Zone-Quiz.html` → quiz  

---

## Filename rules

```
NNN-Slug.html
```

- **NNN** — Three-digit sort key (`001`, `002`, …). Shell sorts alphabetically; always zero-pad.
- **Slug** — Pascal-Case words, hyphens between words.
- **Suffixes:** `-Explained`, `-Quiz`, `Intro-`, `Outro-`, `Congratulations`.

---

## Shared anatomy (every chapter)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Title - Chapter Name</title>
  <style>/* embedded theme CSS */</style>
</head>
<body>
  <div class="stars"><!-- or .bubbles for ocean --></div>
  <div class="container">
    <div class="header"><h1>…</h1></div>
    <!-- page content -->
    <div class="nav-hint">💡 Use ← → and 🏠 in the top bar</div>
  </div>
  <script>/* embedded JS only — no build step */</script>
</body>
</html>
```

### Required UI

| Block | Used on |
|-------|---------|
| `.nav-hint` | Every chapter |
| `.competition-bar` + `.quiz-card.active` + podium `.score-card` | All quiz pages |
| `#startScreen` / `#endScreen` + `⏱` / `❤️` HUD | Canvas minigames |
| Author row + speech quote | `001-Book-Briefing.html` only |

### Character progress (`localStorage`)

Set in `003-Character-Selection.html`:

| Key | Example |
|-----|---------|
| `userName` | Ariel |
| `userCharacter` | 🤿 |
| `characterName` | Diver |

Books may also namespace keys as `book:oceanadventure:userName` (see `_ocean-player.js` / Solar equivalent).

---

## Theme variants

| Book | Background | Accents | Shared JS helper |
|------|------------|---------|------------------|
| Solar System | `.stars` on `#0f0c29` | purple / gold | `_planet-texture-art.js`, `_apply-solar-fixes.cjs` |
| Ocean Adventure | `.bubbles` on blue gradient | teal `#64ffda`, yellow `#ffeb3b` | `_ocean-player.js` |

---

## New book checklist

1. Create `book_html/YourBook/`
2. Add `001-Book-Briefing.html` (author **Jimmy Cooper** + speech)
3. Add `002-Index.html` (badges match file numbers)
4. Add `003-Character-Selection.html`
5. Add `004-Intro-*.html` (arcade-quality intro)
6. For each topic: **Activity → Explained → Quiz** (increment `NNN`)
7. Add **Conclusion → Overall Quiz → Outro game → Congratulations**
8. Embed all CSS/JS; no external bundler required
9. Add `YourBook/README.md` with a chapter map table
10. Update this file’s book list below

---

## Books in this folder

| Folder | Chapters | Author | Notes |
|--------|----------|--------|-------|
| [SolarSystem/](SolarSystem/) | 43 | Jimmy Cooper | Planets, meteors, black holes; intro + outro games |
| [MyFirst100MMWords/](MyFirst100MMWords/) | 41 | Jimmy Cooper | First 100 Myanmar words for diaspora kids; 10 topic chapters |
| [OceanAdventure/](OceanAdventure/) | 32 | Jimmy Cooper | Zones, reefs, mammals, fish; aligned to standard flow |
| DinosaurDiscovery/ | TBD | Jimmy Cooper | In development |

See each book’s README for the full chapter map.
